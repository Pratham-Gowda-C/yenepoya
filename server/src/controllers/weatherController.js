import { fetchWeatherData } from '../services/weather/weatherService.js';
import * as db from '../services/supabase/dbService.js';
import { AppError } from '../middleware/errorHandler.js';

export const getCurrentWeather = async (req, res, next) => {
  try {
    let lat = req.query.latitude ? parseFloat(req.query.latitude) : null;
    let lon = req.query.longitude ? parseFloat(req.query.longitude) : null;

    if ((!lat || !lon) && req.query.plot_id) {
      const plot = await db.getPlotById(req.farmerId, req.query.plot_id);
      if (plot && plot.latitude && plot.longitude) {
        lat = plot.latitude;
        lon = plot.longitude;
      }
    }

    // Default to Mandya/Bengaluru Karnataka if no coords provided
    lat = lat || 12.9716;
    lon = lon || 77.5946;

    const weather = await fetchWeatherData(lat, lon);
    res.json({
      success: true,
      data: weather,
      message: 'Current weather and agricultural advisory retrieved',
    });
  } catch (error) {
    next(new AppError('Failed to fetch current weather', 500, 'WEATHER_SERVICE_ERROR', error.message));
  }
};

export const getWeatherForecast = async (req, res, next) => {
  try {
    let lat = req.query.latitude ? parseFloat(req.query.latitude) : 12.9716;
    let lon = req.query.longitude ? parseFloat(req.query.longitude) : 77.5946;

    const weather = await fetchWeatherData(lat, lon);
    res.json({
      success: true,
      data: {
        location: weather.location,
        observed_at: weather.observed_at,
        forecast: weather.forecast,
        advisory: weather.advisory,
      },
      message: 'Weather forecast retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch weather forecast', 500, 'WEATHER_SERVICE_ERROR', error.message));
  }
};

export const getPlotWeather = async (req, res, next) => {
  try {
    const plot = await db.getPlotById(req.farmerId, req.params.id);
    if (!plot) {
      return next(new AppError('Plot not found or access denied', 404, 'NOT_FOUND'));
    }

    const lat = plot.latitude || 12.9716;
    const lon = plot.longitude || 77.5946;
    const weather = await fetchWeatherData(lat, lon);

    res.json({
      success: true,
      data: {
        plot_id: plot.id,
        plot_name: plot.plot_name,
        ...weather,
      },
      message: `Weather for plot ${plot.plot_name} retrieved successfully`,
    });
  } catch (error) {
    next(new AppError('Failed to fetch plot weather', 500, 'WEATHER_SERVICE_ERROR', error.message));
  }
};
