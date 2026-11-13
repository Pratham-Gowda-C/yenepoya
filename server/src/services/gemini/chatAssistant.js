import { ai, defaultModel } from '../../config/gemini.js';
import { AGRIPULSE_SYSTEM_INSTRUCTION } from './systemPrompt.js';

export const handleAgriculturalChat = async ({
  message,
  history = [],
  farmerProfile = {},
  plot = {},
  soil = {},
  weather = {},
  language = 'en',
}) => {
  const languageNames = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    kn: 'Kannada (ಕನ್ನಡ)',
    te: 'Telugu (తెలుగు)',
    ta: 'Tamil (தமிழ்)',
    ml: 'Malayalam (മലയാളം)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
  };

  const selectedLangName = languageNames[language] || 'English';

  const contextBlock = `
FARMER INFORMATION:
- Name: ${farmerProfile.full_name || 'Farmer'}
- State: ${farmerProfile.state || 'Karnataka'}
- District: ${farmerProfile.district || 'Mandya'}
- Experience: ${farmerProfile.farming_experience || 5} years
- Preferred Language: ${selectedLangName}

SELECTED PLOT:
- Name: ${plot.plot_name || 'Main Plot'}
- Area: ${plot.area || 2} ${plot.area_unit || 'acres'}
- Soil: ${plot.soil_type || 'Red Loam'}
- Irrigation: ${plot.irrigation_source || 'Borewell / Canal'}

LATEST SOIL TEST (IF RECORDED):
- N: ${soil.nitrogen ? `${soil.nitrogen} kg/ha` : 'Not recorded'}
- P: ${soil.phosphorus ? `${soil.phosphorus} kg/ha` : 'Not recorded'}
- K: ${soil.potassium ? `${soil.potassium} kg/ha` : 'Not recorded'}
- pH: ${soil.ph ? `${soil.ph}` : 'Not recorded'}

CURRENT WEATHER AT FARM:
- Temp: ${weather.current ? `${weather.current.temperature}°C` : '27°C'}
- Condition: ${weather.current ? weather.current.condition : 'Partly cloudy'}
- Rainfall: ${weather.current ? `${weather.current.precipitation} mm` : '0 mm'}
- Irrigation Alert: ${weather.advisory ? weather.advisory.irrigation : 'Check soil moisture before irrigating'}
`;

  const prompt = `
${contextBlock}

CONVERSATION HISTORY:
${history.slice(-6).map((h) => `${h.role === 'user' ? 'Farmer' : 'AgriPulse AI'}: ${h.content}`).join('\n')}

FARMER'S NEW QUESTION:
"${message}"

INSTRUCTIONS:
1. Answer warmly, practically, and concisely as an agricultural advisory expert.
2. Formulate your answer in the farmer's preferred language: ${selectedLangName}. Ensure proper grammar and native script.
3. Incorporate the farmer's real plot, soil, or weather context when relevant.
4. Output strictly in JSON adhering to this schema:
{
  "answer": "Clear, friendly, practical advice written in ${selectedLangName}",
  "language": "${language}",
  "intent": "crop_selection | soil_health | pest_disease | weather_irrigation | general_farming",
  "related_actions": ["Action 1", "Action 2"],
  "missing_information": ["Any crucial missing details needed for definitive advice"],
  "safety_notice": "Safety precaution if chemical handling is mentioned, otherwise null"
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
          temperature: 0.3,
        },
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.answer) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini chat assistant call failed, using responsive agricultural engine:', err.message);
    }
  }

  // Agronomic Conversational Intelligence Fallback
  const q = message.toLowerCase();
  let answer = '';
  let intent = 'general_farming';
  const relatedActions = [];

  if (q.includes('yellow') || q.includes('chlorosis')) {
    intent = 'soil_health';
    answer = `Yellowing of crop leaves is commonly caused by Nitrogen deficiency (general yellowing of older lower leaves) or Iron deficiency (interveinal chlorosis on fresh top leaves). In your plot (${plot.plot_name || 'farm'}), check if drainage is blocked after recent rain or apply a mild foliar spray of 1% urea or chelated micronutrient solution.`;
    relatedActions.push('Perform a complete soil NPK test', 'Inspect roots for root rot or nematode infestation');
  } else if (q.includes('crop') || q.includes('grow') || q.includes('plant')) {
    intent = 'crop_selection';
    answer = `For your ${plot.soil_type || 'local'} soil in ${farmerProfile.district || 'your region'}, suitable seasonal crops include pulses like Chickpea or Maize in moderate moisture, or Paddy if you have assured canal/borewell irrigation. Review our Crop Recommendations module for an in-depth suitability breakdown.`;
    relatedActions.push('Check Crop Recommendation Engine', 'Review water availability');
  } else if (q.includes('water') || q.includes('irrigat')) {
    intent = 'weather_irrigation';
    answer = `Current weather indicates ${weather.current ? weather.current.condition : 'stable conditions'} at ${weather.current ? weather.current.temperature : '27'}°C. ${weather.advisory ? weather.advisory.irrigation : 'Check soil moisture before irrigating.'} Avoid midday irrigation to curb evaporation losses.`;
    relatedActions.push('View 7-day weather forecast', 'Check soil moisture in root zone');
  } else if (q.includes('ph') || q.includes('acid') || q.includes('alkal')) {
    intent = 'soil_health';
    const phVal = soil.ph || 6.8;
    answer = `Your plot's pH is recorded at ${phVal}. Most agricultural crops thrive between 6.0 and 7.5. ${phVal < 6.0 ? 'Your soil is slightly acidic; consider applying agricultural lime.' : (phVal > 7.8 ? 'Your soil is alkaline; consider applying gypsum and organic compost.' : 'Your soil pH is in the optimal neutral range!')}`;
    relatedActions.push('Incorporate organic matter / farmyard manure', 'Conduct a fresh soil test');
  } else {
    answer = `Hello! I am your AgriPulse AI assistant. Based on your farm in ${farmerProfile.district || 'your region'} with ${plot.soil_type || 'standard'} soil, I can help you evaluate crop options, diagnose plant diseases, plan fertilizer schedules, and guide irrigation based on live weather data. What specific crop or field challenge can I assist you with today?`;
    relatedActions.push('Ask for crop suitability', 'Upload a leaf photo for disease diagnosis', 'Review current weather alerts');
  }

  return {
    answer,
    language,
    intent,
    related_actions: relatedActions,
    missing_information: soil.nitrogen ? [] : ['Detailed soil test report would improve precision'],
    safety_notice: null,
  };
};
