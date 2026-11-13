import { ai, defaultModel } from '../../config/gemini.js';
import { AGRIPULSE_SYSTEM_INSTRUCTION } from './systemPrompt.js';
import { interpretSoilNutrient } from '../agriculture/cropDatabase.js';

export const analyzeSoilData = async (soilRecord = {}, plot = {}, language = 'en') => {
  const measuredParams = [
    { name: 'Nitrogen', value: soilRecord.nitrogen, unit: 'kg/ha' },
    { name: 'Phosphorus', value: soilRecord.phosphorus, unit: 'kg/ha' },
    { name: 'Potassium', value: soilRecord.potassium, unit: 'kg/ha' },
    { name: 'pH', value: soilRecord.ph, unit: 'pH scale' },
    { name: 'Moisture', value: soilRecord.moisture, unit: '%' },
    { name: 'Organic Carbon', value: soilRecord.organic_carbon, unit: '%' },
    { name: 'Temperature', value: soilRecord.temperature, unit: '°C' },
  ];

  const prompt = `
Analyze the provided soil test report for an Indian agricultural plot.

PLOT CONTEXT:
- Plot Name: ${plot.plot_name || 'Farm Plot'}
- Soil Type: ${plot.soil_type || soilRecord.soil_texture || 'Not specified'}

MEASURED SOIL PARAMETERS:
${measuredParams.map((p) => `- ${p.name}: ${p.value !== null && p.value !== undefined ? `${p.value} ${p.unit}` : 'Not Measured'}`).join('\n')}

INSTRUCTIONS:
1. Distinguish measured values from unmeasured/missing values. NEVER invent missing test values.
2. Provide scientific interpretation based on ICAR soil testing standards.
3. Identify potential deficiencies, toxicities, or imbalances.
4. Output strictly in valid JSON format matching this schema:
{
  "summary": "Concise agronomic summary of the soil condition",
  "soil_health_status": "good | moderate | poor | insufficient_data",
  "parameters": [
    {
      "name": "string",
      "value": 0,
      "unit": "string",
      "interpretation": "Detailed interpretation",
      "status": "low | normal | high | unknown"
    }
  ],
  "potential_issues": ["Issue 1", "Issue 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "missing_information": ["List any unmeasured parameters"]
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
          temperature: 0.1,
        },
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.parameters && Array.isArray(parsed.parameters)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed for soil analysis, using ICAR benchmark interpreter:', err.message);
    }
  }

  // Deterministic Agronomic Soil Analysis using verified ICAR thresholds
  const paramsResult = [];
  const potentialIssues = [];
  const recommendations = [];
  const missingInfo = [];

  let validCount = 0;
  let healthyCount = 0;

  for (const p of measuredParams) {
    if (p.value !== null && p.value !== undefined && !isNaN(p.value)) {
      validCount++;
      const interpretation = interpretSoilNutrient(p.name, p.value);
      paramsResult.push({
        name: p.name,
        value: Number(p.value),
        unit: p.unit,
        interpretation: interpretation.interpretation,
        status: interpretation.status,
      });

      if (interpretation.status === 'normal' || interpretation.status === 'high') {
        healthyCount++;
      } else if (interpretation.status === 'low') {
        potentialIssues.push(`Low ${p.name} levels detected (${p.value} ${p.unit}).`);
        if (p.name === 'Nitrogen') {
          recommendations.push('Apply well-decomposed FYM or split doses of Urea/Neem-coated Urea.');
        } else if (p.name === 'Phosphorus') {
          recommendations.push('Incorporate Single Super Phosphate (SSP) or DAP directly into the root zone.');
        } else if (p.name === 'Potassium') {
          recommendations.push('Apply Muriate of Potash (MOP) to improve drought and pest resistance.');
        }
      }

      if (p.name === 'pH') {
        if (p.value < 6.0) {
          potentialIssues.push(`Acidic soil reaction (pH ${p.value}) may restrict nutrient uptake.`);
          recommendations.push('Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH.');
        } else if (p.value > 8.0) {
          potentialIssues.push(`Alkaline/saline soil reaction (pH ${p.value}) restricts micronutrient availability.`);
          recommendations.push('Apply agricultural gypsum and green manuring (Dhaincha/Sesbania) to reclaim soil.');
        }
      }
    } else {
      missingInfo.push(`${p.name} was not tested`);
      paramsResult.push({
        name: p.name,
        value: null,
        unit: p.unit,
        interpretation: 'Not tested in this soil sample.',
        status: 'unknown',
      });
    }
  }

  let status = 'moderate';
  if (validCount < 2) {
    status = 'insufficient_data';
  } else if (healthyCount >= 4 && potentialIssues.length === 0) {
    status = 'good';
  } else if (potentialIssues.length >= 3) {
    status = 'poor';
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain balanced fertilization using the 4R Nutrient Stewardship principles.');
    recommendations.push('Periodically conduct green manuring to sustain soil organic carbon.');
  }

  return {
    summary: `Soil assessment reflects a ${status} fertility profile based on ${validCount} measured parameters.`,
    soil_health_status: status,
    parameters: paramsResult,
    potential_issues: potentialIssues.length > 0 ? potentialIssues : ['No critical nutrient deficiencies identified in tested parameters.'],
    recommendations,
    missing_information: missingInfo,
  };
};
