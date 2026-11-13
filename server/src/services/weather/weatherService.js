import axios from 'axios';
import { env } from '../../config/env.js';

// Weather code interpretation based on WMO standards used by Open-Meteo
const WMO_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export const fetchWeatherData = async (latitude = 12.9716, longitude = 77.5946) => {
  try {
    const lat = Number(latitude);
    const lon = Number(longitude);

    // Call Open-Meteo API
    const response = await axios.get(`${env.WEATHER_API_BASE_URL}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m',
        hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: 7,
      },
      timeout: 8000,
    });

    const data = response.data;
    const current = data.current || {};
    const weatherCode = current.weather_code ?? 0;
    const weatherDesc = WMO_CODE_MAP[weatherCode] || 'Partly cloudy';

    // Format daily forecast
    const dailyForecast = [];
    if (data.daily && data.daily.time) {
      for (let i = 0; i < Math.min(data.daily.time.length, 7); i++) {
        dailyForecast.push({
          date: data.daily.time[i],
          maxTemp: data.daily.temperature_2m_max[i],
          minTemp: data.daily.temperature_2m_min[i],
          precipitationSum: data.daily.precipitation_sum[i],
          rainProbability: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[i] : 0,
          condition: WMO_CODE_MAP[data.daily.weather_code[i]] || 'Clear',
        });
      }
    }

    // Determine agricultural irrigation and weather advisories
    const currentPrecip = current.precipitation || current.rain || 0;
    const upcomingRainMax = Math.max(...(dailyForecast.slice(0, 3).map((d) => d.precipitationSum || 0)));
    const maxRainProb = Math.max(...(dailyForecast.slice(0, 3).map((d) => d.rainProbability || 0)));

    let irrigationAdvice = 'Normal irrigation schedule recommended.';
    let warning = null;

    if (currentPrecip > 5 || upcomingRainMax > 15 || maxRainProb > 70) {
      irrigationAdvice = 'Postpone irrigation: Substantial rainfall detected or forecasted in the next 48-72 hours.';
      warning = 'Heavy rainfall alert: Ensure field drainage channels are cleared to prevent root-zone waterlogging.';
    } else if (current.temperature_2m > 38 && current.relative_humidity_2m < 35) {
      irrigationAdvice = 'High evapotranspiration rate: Provide light and frequent irrigation during early morning or evening hours.';
      warning = 'Heat stress caution: Protect young saplings and seedlings with mulch or shade nets.';
    } else if (current.relative_humidity_2m > 85 && current.temperature_2m > 24) {
      warning = 'High humidity alert: Elevated risk of fungal spore germination. Inspect lower foliage for early blight or mildew symptoms.';
    }

    return {
      success: true,
      provider: 'Open-Meteo Verified Agronomic Service',
      observed_at: current.time || new Date().toISOString(),
      location: {
        latitude: lat,
        longitude: lon,
        elevation: data.elevation || 0,
        timezone: data.timezone || 'Asia/Kolkata',
      },
      current: {
        temperature: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        precipitation: currentPrecip,
        wind_speed: current.wind_speed_10m,
        wind_direction: current.wind_direction_10m,
        condition: weatherDesc,
        weather_code: weatherCode,
      },
      advisory: {
        irrigation: irrigationAdvice,
        warning: warning,
        spraying_suitability: current.wind_speed_10m > 15 
          ? 'Unsuitable for pesticide/fertilizer spraying due to high drift wind (> 15 km/h).' 
          : (currentPrecip > 0 ? 'Avoid spraying during active rainfall.' : 'Suitable for foliar spray operations.')
      },
      forecast: dailyForecast,
    };
  } catch (error) {
    console.error('Weather API fetch error:', error.message);
    // Provide safe fallback with clear indicator
    return {
      success: false,
      provider: 'Fallback System Data',
      observed_at: new Date().toISOString(),
      error: 'Live weather service unreachable. Displaying regional baseline.',
      current: {
        temperature: 28,
        feels_like: 29,
        humidity: 65,
        precipitation: 0,
        wind_speed: 8,
        condition: 'Partly cloudy (Estimated)',
      },
      advisory: {
        irrigation: 'Verify field moisture before scheduling irrigation.',
        warning: 'Weather station communication interrupted. Check local forecast.',
        spraying_suitability: 'Check local wind speed before spraying.'
      },
      forecast: [],
    };
  }
};
