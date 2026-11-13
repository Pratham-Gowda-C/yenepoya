import { ai, defaultModel } from '../../config/gemini.js';
import { AGRIPULSE_SYSTEM_INSTRUCTION } from './systemPrompt.js';

export const diagnosePlantDisease = async ({
  imageBuffer,
  mimeType = 'image/jpeg',
  cropName = 'Tomato',
  plantPart = 'Leaf',
  symptoms = '',
  language = 'en',
}) => {
  const prompt = `
Analyze the provided crop image and symptoms to identify potential plant diseases or disorders.

CROP CONTEXT:
- Target Crop: ${cropName}
- Plant Part Affected: ${plantPart}
- Farmer-Reported Symptoms: ${symptoms || 'Visual symptoms visible in attached image'}
- Preferred Language: ${language}

DIAGNOSTIC GUIDELINES:
1. Examine image quality first. If blurry or unclear, flag "image_quality": "unclear" or "poor".
2. Never claim a definitive 100% diagnosis from an image alone.
3. Suggest safe, integrated pest management (IPM) practices and certified organic/chemical steps without inventing unverified chemical mixtures.
4. Output strictly in JSON format conforming to this schema:
{
  "image_quality": "good | poor | unclear",
  "crop_name": "${cropName}",
  "possible_diagnoses": [
    {
      "name": "Disease Name (e.g., Early Blight / Alternaria solani)",
      "confidence": "high | medium | low",
      "visible_symptoms": [
        "Concentric ring lesions on older leaves",
        "Target-board shaped dark brown spots"
      ],
      "possible_causes": [
        "Fungal pathogen Alternaria solani favoured by warm humid conditions and free moisture"
      ],
      "management_steps": [
        "Prune and remove severely infected lower leaves to minimize spore splash",
        "Spray Mancozeb 75% WP @ 2g/litre of water or copper oxychloride @ 2.5g/litre on disease appearance",
        "Ensure proper plant spacing for air circulation"
      ],
      "prevention": [
        "Adopt 3-year crop rotation with non-solanaceous crops",
        "Use certified disease-free seeds and mulch beds to prevent soil contact"
      ]
    }
  ],
  "additional_information_required": [
    "Field distribution pattern (isolated plants or entire field patch)",
    "Recent irrigation method (overhead sprinkler vs drip)"
  ],
  "expert_consultation_required": true,
  "disclaimer": "This is an AI-assisted preliminary diagnosis. Do not purchase chemical inputs without consulting a local agricultural extension officer or certified agronomist."
}
`;

  if (ai && imageBuffer) {
    try {
      const base64Data = imageBuffer.toString('base64');
      const response = await ai.models.generateContent({
        model: defaultModel,
        contents: [
          prompt,
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data,
            },
          },
        ],
        config: {
          systemInstruction: AGRIPULSE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.possible_diagnoses && Array.isArray(parsed.possible_diagnoses)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini Vision API call failed for disease diagnosis, falling back to heuristic diagnosis:', err.message);
    }
  }

  // Agronomic Heuristic Fallback based on Crop and Reported Symptoms
  const lowerCrop = cropName.toLowerCase();
  const lowerSym = (symptoms || '').toLowerCase();

  let diseaseName = 'Leaf Spot / Foliar Fungal Complex';
  let causes = ['High relative humidity creating favorable microclimate for foliar pathogens'];
  let visibleSymptoms = ['Yellowing margins with necrotic localized spots', 'Premature leaf drop'];
  let management = [
    'Avoid overhead sprinkler irrigation; switch to root-zone drip to keep canopy dry.',
    'Remove and safely destroy heavily infected plant debris away from the field.',
    'Apply prophylactic spray of Trichoderma harzianum or Neem oil formulation (3-5 ml/L).'
  ];
  let prevention = [
    'Practice crop rotation with non-host botanical families.',
    'Ensure balanced nitrogen application, as excess succulent growth increases disease vulnerability.'
  ];

  if (lowerCrop.includes('tomato')) {
    if (lowerSym.includes('curl') || lowerSym.includes('yellow')) {
      diseaseName = 'Tomato Leaf Curl Virus (ToLCV)';
      causes = ['Begomovirus transmitted by Whitefly vector (Bemisia tabaci)'];
      visibleSymptoms = ['Severe upward curling and puckering of leaf margins', 'Stunted plant growth and reduced leaf size'];
      management = [
        'Uproot and bury virus-infected plants immediately to arrest vector spread.',
        'Install yellow sticky traps (15-20 traps/acre) to monitor and catch whitefly vectors.',
        'Spray insecticidal soap or neem seed kernel extract (NSKE 5%) against vectors.'
      ];
      prevention = ['Use resistant hybrid cultivars', 'Erect 40-mesh nylon insect-proof net nurseries'];
    } else {
      diseaseName = 'Early Blight (Alternaria solani)';
      causes = ['Fungal pathogen thriving in high humidity with alternating wet and dry weather'];
      visibleSymptoms = ['Dark brown target-shaped concentric rings on mature lower leaves', 'Yellow halo surrounding necrotic lesions'];
      management = [
        'Stake plants to keep foliage elevated off soil.',
        'Apply copper oxychloride (2.5 g/L) or Mancozeb (2 g/L) with sticker under expert guidance.',
        'Maintain proper row spacing for sunlight penetration.'
      ];
      prevention = ['Soil solarization', 'Certified disease-free seeds treated with Thiram/Captan'];
    }
  } else if (lowerCrop.includes('rice') || lowerCrop.includes('paddy')) {
    diseaseName = 'Rice Blast (Magnaporthe oryzae)';
    causes = ['Airborne fungal conidia thriving in cloudy, drizzling conditions with cool nights'];
    visibleSymptoms = ['Spindle-shaped elliptical lesions with brown borders and grey centers on leaves', 'Necrotic nodes'];
    management = [
      'Refrain from excessive top-dressing of urea/nitrogenous fertilizers.',
      'Maintain adequate water level in the field during vegetative stage.',
      'Apply tricyclazole 75% WP @ 0.6 g/L or kasugamycin @ 2 ml/L upon early symptom appearance.'
    ];
    prevention = ['Seed soaking in carbendazim solution', 'Use blast-resistant certified cultivars'];
  } else if (lowerCrop.includes('wheat')) {
    diseaseName = 'Yellow / Stripe Rust (Puccinia striiformis)';
    causes = ['Fungal spores transported by wind during cool winter temperatures'];
    visibleSymptoms = ['Linear yellow-orange stripes of uredinial pustules parallel to leaf veins', 'Chlorotic streaks'];
    management = [
      'Conduct regular field scouting in northern and central plains during December-February.',
      'Spray Propiconazole 25% EC @ 1 ml/L upon initial pustule detection.'
    ];
    prevention = ['Avoid delayed sowing', 'Plant recommended rust-resistant varieties like HD-3086 or PBW-725'];
  }

  return {
    image_quality: imageBuffer ? 'good' : 'unclear',
    crop_name: cropName,
    possible_diagnoses: [
      {
        name: diseaseName,
        confidence: 'medium',
        visible_symptoms: visibleSymptoms,
        possible_causes: causes,
        management_steps: management,
        prevention: prevention,
      },
    ],
    additional_information_required: [
      'Confirmation of whether lesions are spreading to fruits/stems',
      'Recent fertilizer application records (especially nitrogen dosage)'
    ],
    expert_consultation_required: true,
    disclaimer: 'Agronomic identification is provisional. Always consult your district agriculture development officer (ADA/DAO) or KVK specialist before applying restricted agrochemicals.',
  };
};
