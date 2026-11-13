import { ai, defaultModel } from '../../config/gemini.js';
import { AGRIPULSE_SYSTEM_INSTRUCTION } from './systemPrompt.js';
import { INDIAN_CROPS_DATABASE } from '../agriculture/cropDatabase.js';

export const generateCropRecommendations = async ({
  farmerProfile = {},
  plot = {},
  soil = {},
  weather = {},
  season = 'Kharif',
  waterAvailability = 'Moderate',
  preferredCategory = 'All',
  farmingObjective = 'Maximum Yield',
  language = 'en',
}) => {
  const prompt = `
Analyze the provided agricultural parameters and generate personalized crop recommendations for an Indian farm.

FARMER CONTEXT:
- State: ${farmerProfile.state || 'Not specified'}
- District: ${farmerProfile.district || 'Not specified'}
- Preferred Language: ${language}

PLOT DETAILS:
- Plot Name: ${plot.plot_name || 'Primary Plot'}
- Area: ${plot.area || 1} ${plot.area_unit || 'acres'}
- Soil Type: ${plot.soil_type || soil.soil_texture || 'Not specified'}
- Irrigation Source: ${plot.irrigation_source || 'Rainfed / Canal'}

MEASURED SOIL PARAMETERS:
- Nitrogen (N): ${soil.nitrogen ? `${soil.nitrogen} kg/ha (Measured)` : 'Unavailable'}
- Phosphorus (P): ${soil.phosphorus ? `${soil.phosphorus} kg/ha (Measured)` : 'Unavailable'}
- Potassium (K): ${soil.potassium ? `${soil.potassium} kg/ha (Measured)` : 'Unavailable'}
- Soil pH: ${soil.ph ? `${soil.ph} (Measured)` : 'Unavailable'}
- Soil Moisture: ${soil.moisture ? `${soil.moisture}% (Measured)` : 'Unavailable'}
- Organic Carbon: ${soil.organic_carbon ? `${soil.organic_carbon}% (Measured)` : 'Unavailable'}

CURRENT SEASON & ENVIRONMENT:
- Target Season: ${season}
- Water Availability: ${waterAvailability}
- Preferred Crop Category: ${preferredCategory}
- Farming Objective: ${farmingObjective}
- Current Weather Temp: ${weather.current ? `${weather.current.temperature}°C` : 'Historical regional average'}
- Current Weather Humidity: ${weather.current ? `${weather.current.humidity}%` : 'Standard'}
- Recent Rainfall: ${weather.current ? `${weather.current.precipitation} mm` : 'Normal'}

IMPORTANT: Output strictly in JSON format matching this schema:
{
  "summary": "Detailed agronomic summary explaining seasonal and soil context",
  "data_quality": "complete | partial | insufficient",
  "recommendations": [
    {
      "crop_name": "Crop name",
      "suitability_score": 85,
      "suitability_explanation": "Detailed explanation of why this crop fits the soil, season, and water situation",
      "season": "${season}",
      "soil_compatibility": "Explanation of soil compatibility",
      "water_requirement": "Low | Moderate | High with mm estimates",
      "duration_days": 120,
      "risks": ["Risk 1", "Risk 2"],
      "precautions": ["Precaution 1", "Precaution 2"]
    }
  ],
  "missing_information": ["List any key unmeasured variables like soil NPK or micronutrients"],
  "disclaimer": "Scores represent model-generated suitability estimates based on current agronomic data. Consult your local Krishi Vigyan Kendra (KVK) before final planting decisions."
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: defaultModel,
        contents: prompt,
        config: {
          systemInstruction: AGRIPULSE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed for crop recommendations, using agronomic rule-engine:', err.message);
    }
  }

  // Agronomic Rule Engine Fallback using Verified ICAR Benchmarks
  const matchingCrops = INDIAN_CROPS_DATABASE.filter((crop) => {
    const seasonMatch = crop.suitableSeasons.includes(season) || crop.suitableSeasons.includes('Annual') || season === 'Whole Year';
    const categoryMatch = preferredCategory === 'All' || crop.category.toLowerCase() === preferredCategory.toLowerCase();
    return seasonMatch && categoryMatch;
  });

  const recommendations = (matchingCrops.length > 0 ? matchingCrops : INDIAN_CROPS_DATABASE.slice(0, 3)).map((crop) => {
    let score = 75;
    if (soil.ph && soil.ph >= crop.phRange[0] && soil.ph <= crop.phRange[1]) score += 12;
    if (plot.soil_type && crop.soilTypes.some((st) => plot.soil_type.toLowerCase().includes(st.toLowerCase()))) score += 10;
    if (waterAvailability === 'High' || waterAvailability === 'Assured Irrigation') score += 3;
    score = Math.min(score, 96);

    return {
      crop_name: crop.name,
      suitability_score: score,
      suitability_explanation: `Optimal for ${season} season. Well matched to ${plot.soil_type || 'local'} soil and ${waterAvailability.toLowerCase()} water conditions.`,
      season: season,
      soil_compatibility: `Compatible with pH ${crop.phRange[0]}-${crop.phRange[1]} and ${crop.soilTypes.join(', ')}.`,
      water_requirement: crop.waterRequirement,
      duration_days: Math.round((crop.durationDays[0] + crop.durationDays[1]) / 2),
      risks: [
        'Unseasonal heavy rain during harvest period',
        'Market price volatility at peak mandi arrivals'
      ],
      precautions: crop.keyPrecautions,
    };
  });

  const missingInfo = [];
  if (!soil.nitrogen) missingInfo.push('Soil Nitrogen (N) value is not measured');
  if (!soil.phosphorus) missingInfo.push('Soil Phosphorus (P) value is not measured');
  if (!soil.potassium) missingInfo.push('Soil Potassium (K) value is not measured');
  if (!soil.ph) missingInfo.push('Soil pH test value is unavailable');

  return {
    summary: `Agronomic evaluation for ${plot.plot_name || 'your farm'} during ${season} season based on ${soil.ph ? `measured pH ${soil.ph}` : 'baseline regional data'} and ${waterAvailability.toLowerCase()} water availability.`,
    data_quality: missingInfo.length === 0 ? 'complete' : (missingInfo.length < 3 ? 'partial' : 'insufficient'),
    recommendations: recommendations.sort((a, b) => b.suitability_score - a.suitability_score),
    missing_information: missingInfo,
    disclaimer: 'Suitability scores are model-generated estimates based on ICAR agronomic thresholds. Always verify local seed variety availability with your block agricultural officer.',
  };
};
