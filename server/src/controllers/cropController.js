import * as db from '../services/supabase/dbService.js';
import { generateCropRecommendations } from '../services/gemini/cropAdvisor.js';
import { fetchWeatherData } from '../services/weather/weatherService.js';
import { AppError } from '../middleware/errorHandler.js';

export const requestRecommendations = async (req, res, next) => {
  try {
    const { plot_id, season, water_availability, preferred_crop_category, farming_objective, language } = req.body;

    const profile = await db.getProfile(req.farmerId);
    let plot = {};
    let soil = {};

    if (plot_id) {
      plot = (await db.getPlotById(req.farmerId, plot_id)) || {};
      const soilRecords = await db.getSoilRecordsByPlot(req.farmerId, plot_id);
      if (soilRecords && soilRecords.length > 0) {
        soil = soilRecords[0]; // Most recent soil test
      }
    }

    // Retrieve weather context based on plot coordinates or default state
    const lat = plot.latitude || 12.9716;
    const lon = plot.longitude || 77.5946;
    const weather = await fetchWeatherData(lat, lon);

    // Invoke Gemini Crop Recommendation Engine
    const recommendationResult = await generateCropRecommendations({
      farmerProfile: profile,
      plot,
      soil,
      weather,
      season,
      waterAvailability: water_availability,
      preferredCategory: preferred_crop_category,
      farmingObjective: farming_objective,
      language: language || profile?.preferred_language || 'en',
    });

    // Persist to database
    const saved = await db.saveCropRecommendation(req.farmerId, {
      plot_id,
      season,
      input_snapshot: {
        farmer: profile,
        plot,
        soil,
        weather: weather.current,
        criteria: { water_availability, preferred_crop_category, farming_objective },
      },
      recommendations: recommendationResult.recommendations,
      ai_model: 'Gemini-GenAI-ICAR',
      source_metadata: {
        summary: recommendationResult.summary,
        data_quality: recommendationResult.data_quality,
        missing_information: recommendationResult.missing_information,
        disclaimer: recommendationResult.disclaimer,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: saved.id,
        ...recommendationResult,
        created_at: saved.created_at,
      },
      message: 'Crop recommendations generated and saved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to generate crop recommendations', 500, 'AI_RECOMMENDATION_ERROR', error.message));
  }
};

export const listRecommendations = async (req, res, next) => {
  try {
    const plotId = req.query.plot_id;
    const records = await db.getCropRecommendations(req.farmerId, plotId);
    res.json({
      success: true,
      data: records,
      message: 'Crop recommendations retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch recommendation history', 500, 'DATABASE_ERROR', error.message));
  }
};

export const getRecommendation = async (req, res, next) => {
  try {
    const record = await db.getCropRecommendationById(req.farmerId, req.params.id);
    if (!record) {
      return next(new AppError('Recommendation record not found or access denied', 404, 'NOT_FOUND'));
    }
    res.json({
      success: true,
      data: record,
      message: 'Recommendation retrieved successfully',
    });
  } catch (error) {
    next(new AppError('Failed to fetch recommendation', 500, 'DATABASE_ERROR', error.message));
  }
};
