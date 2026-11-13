/**
 * AgriPulse AI - Verified Agricultural Benchmarks & Crop Database
 * Standard ICAR (Indian Council of Agricultural Research) Agronomic Guidelines
 */

export const INDIAN_CROPS_DATABASE = [
  {
    name: 'Rice (Paddy)',
    category: 'Cereals',
    suitableSeasons: ['Kharif'],
    soilTypes: ['Clay', 'Clay Loam', 'Alluvial', 'Black Soil'],
    phRange: [5.5, 7.2],
    npkRatio: { n: 100, p: 50, k: 50 }, // kg/ha
    waterRequirement: 'High (1200-1400 mm)',
    durationDays: [110, 150],
    waterSensitivity: 'High water requirement, needs submerged or saturated soil conditions.',
    keyPrecautions: [
      'Maintain 2-5 cm standing water during tillering to panicle initiation.',
      'Monitor for Blast and Brown Plant Hopper (BPH).',
      'Apply nitrogen in splits (Basal, Active Tillering, Panicle Initiation).'
    ]
  },
  {
    name: 'Wheat',
    category: 'Cereals',
    suitableSeasons: ['Rabi'],
    soilTypes: ['Loamy', 'Clay Loam', 'Alluvial'],
    phRange: [6.0, 7.8],
    npkRatio: { n: 120, p: 60, k: 40 },
    waterRequirement: 'Moderate (450-650 mm)',
    durationDays: [100, 140],
    waterSensitivity: 'Critical irrigation stages: Crown Root Initiation (CRI) at 21 days, Tillering, and Flowering.',
    keyPrecautions: [
      'Ensure first irrigation at 20-25 days after sowing (CRI stage).',
      'Avoid waterlogging, which stunts root respiration.',
      'Monitor for Yellow Rust in northern states.'
    ]
  },
  {
    name: 'Maize (Corn)',
    category: 'Cereals',
    suitableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['Sandy Loam', 'Loamy', 'Red Loam', 'Alluvial'],
    phRange: [5.8, 7.5],
    npkRatio: { n: 120, p: 60, k: 40 },
    waterRequirement: 'Moderate (500-800 mm)',
    durationDays: [90, 120],
    waterSensitivity: 'Extremely sensitive to waterlogging in early stages and drought at tasseling/silking.',
    keyPrecautions: [
      'Ensure proper drainage to avoid moisture stress.',
      'Scout for Fall Armyworm (FAW) regularly.',
      'Apply potash to strengthen stalk strength against lodging.'
    ]
  },
  {
    name: 'Chickpea (Gram / Chana)',
    category: 'Pulses',
    suitableSeasons: ['Rabi'],
    soilTypes: ['Sandy Loam', 'Loamy', 'Clay Loam'],
    phRange: [6.0, 7.5],
    npkRatio: { n: 20, p: 50, k: 20 },
    waterRequirement: 'Low (250-400 mm)',
    durationDays: [90, 120],
    waterSensitivity: 'Drought-hardy legume; excess moisture causes vegetative growth and wilt.',
    keyPrecautions: [
      'Inoculate seeds with Rhizobium and PSB culture prior to sowing.',
      'Avoid irrigation during peak flowering to prevent flower drop.',
      'Install pheromone traps for Pod Borer (Helicoverpa armigera).'
    ]
  },
  {
    name: 'Soybean',
    category: 'Oilseeds',
    suitableSeasons: ['Kharif'],
    soilTypes: ['Well-drained Loam', 'Black Cotton Soil', 'Clay Loam'],
    phRange: [6.0, 7.5],
    npkRatio: { n: 30, p: 60, k: 40 },
    waterRequirement: 'Moderate (450-700 mm)',
    durationDays: [90, 110],
    waterSensitivity: 'Moisture stress during pod filling drastically lowers oil content and yield.',
    keyPrecautions: [
      'Ensure seed treatment with fungicide and Rhizobium japonicum.',
      'Maintain broad bed furrow (BBF) in black soils to manage drainage.',
      'Monitor for Girdle Beetle and Spodoptera litura.'
    ]
  },
  {
    name: 'Cotton',
    category: 'Commercial',
    suitableSeasons: ['Kharif'],
    soilTypes: ['Black Cotton Soil', 'Deep Alluvial', 'Loamy'],
    phRange: [6.0, 8.0],
    npkRatio: { n: 100, p: 50, k: 50 },
    waterRequirement: 'Moderate to High (700-1100 mm)',
    durationDays: [150, 180],
    waterSensitivity: 'Requires deep moisture during boll formation; sensitive to water stagnation.',
    keyPrecautions: [
      'Implement Integrated Pest Management for Pink Bollworm.',
      'Maintain adequate spacing to facilitate light penetration and ventilation.',
      'Apply micro-nutrients (Boron and Magnesium) during square and boll formation.'
    ]
  },
  {
    name: 'Groundnut (Peanut)',
    category: 'Oilseeds',
    suitableSeasons: ['Kharif', 'Zaid'],
    soilTypes: ['Sandy Loam', 'Light Red Loam', 'Well-drained Alluvial'],
    phRange: [6.0, 7.2],
    npkRatio: { n: 25, p: 50, k: 75 },
    waterRequirement: 'Moderate (500-700 mm)',
    durationDays: [105, 125],
    waterSensitivity: 'Critical pegging and pod development stages require uniform light moisture.',
    keyPrecautions: [
      'Apply Gypsum at 40-45 days after sowing to provide calcium and sulfur for peg penetration.',
      'Avoid heavy compacted clays which hinder peg entry into soil.'
    ]
  },
  {
    name: 'Tomato',
    category: 'Vegetables',
    suitableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['Sandy Loam', 'Rich Loam', 'Red Soil'],
    phRange: [6.0, 7.0],
    npkRatio: { n: 150, p: 100, k: 100 },
    waterRequirement: 'Moderate (600-800 mm)',
    durationDays: [90, 130],
    waterSensitivity: 'Uneven watering triggers Blossom End Rot (calcium deficiency) and fruit cracking.',
    keyPrecautions: [
      'Stake or trellis plants to elevate foliage away from soil-borne pathogens.',
      'Employ drip irrigation with mulching for moisture stability.',
      'Monitor for Early Blight and Tomato Leaf Curl Virus.'
    ]
  },
  {
    name: 'Mustard',
    category: 'Oilseeds',
    suitableSeasons: ['Rabi'],
    soilTypes: ['Loam', 'Sandy Loam', 'Alluvial'],
    phRange: [6.0, 7.5],
    npkRatio: { n: 80, p: 40, k: 40 },
    waterRequirement: 'Low (300-450 mm)',
    durationDays: [105, 135],
    waterSensitivity: 'Requires 2 irrigations (flowering and siliqua formation).',
    keyPrecautions: [
      'Ensure sulfur fertilization for higher oil percentage.',
      'Watch for Mustard Aphid infestations during cloudy weather in winter.'
    ]
  },
  {
    name: 'Sugarcane',
    category: 'Commercial',
    suitableSeasons: ['Annual'],
    soilTypes: ['Deep Loam', 'Clay Loam', 'Alluvial'],
    phRange: [6.5, 7.8],
    npkRatio: { n: 250, p: 100, k: 120 },
    waterRequirement: 'Very High (1500-2500 mm)',
    durationDays: [300, 360],
    waterSensitivity: 'Requires continuous assured irrigation or furrow system.',
    keyPrecautions: [
      'Perform earthing up at 90 and 120 days to prevent lodging.',
      'Trash mulching in furrows to conserve soil moisture.'
    ]
  }
];

export const interpretSoilNutrient = (name, value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return { status: 'unknown', interpretation: 'Value not measured or provided' };
  }

  const v = Number(value);
  switch (name.toLowerCase()) {
    case 'nitrogen':
      // kg/ha standard: < 280 low, 280-560 medium/normal, > 560 high
      if (v < 280) return { status: 'low', interpretation: 'Low nitrogen content. May cause leaf chlorosis and stunting.' };
      if (v <= 560) return { status: 'normal', interpretation: 'Adequate available nitrogen for normal crop growth.' };
      return { status: 'high', interpretation: 'Excessive nitrogen. Risk of lodging and delayed maturity.' };

    case 'phosphorus':
      // kg/ha: < 10 low, 10-25 normal, > 25 high
      if (v < 10) return { status: 'low', interpretation: 'Deficient phosphorus. Can impair root elongation and flowering.' };
      if (v <= 25) return { status: 'normal', interpretation: 'Sufficient phosphorus for healthy root and seed formation.' };
      return { status: 'high', interpretation: 'High phosphorus level. May interfere with zinc and iron uptake.' };

    case 'potassium':
      // kg/ha: < 110 low, 110-280 normal, > 280 high
      if (v < 110) return { status: 'low', interpretation: 'Potassium deficiency. Increases disease susceptibility and weak stems.' };
      if (v <= 280) return { status: 'normal', interpretation: 'Optimal potassium for drought tolerance and enzyme activation.' };
      return { status: 'high', interpretation: 'Ample potassium reserves in the soil.' };

    case 'ph':
      if (v < 6.0) return { status: 'low', interpretation: `Acidic soil (pH ${v}). May limit phosphorus and calcium availability; consider liming.` };
      if (v <= 7.5) return { status: 'normal', interpretation: `Optimal neutral soil pH (${v}). Ideal for most field crops.` };
      return { status: 'high', interpretation: `Alkaline/saline soil (pH ${v}). May cause iron, manganese, and zinc deficiency; consider gypsum.` };

    case 'organic_carbon':
      // %: < 0.5 low, 0.5-0.75 medium, > 0.75 high
      if (v < 0.5) return { status: 'low', interpretation: 'Low soil organic matter. Incorporate farmyard manure (FYM) or green manuring.' };
      if (v <= 0.75) return { status: 'normal', interpretation: 'Moderate organic carbon supporting healthy microbial biomass.' };
      return { status: 'high', interpretation: 'Good organic carbon content promoting moisture retention and soil structure.' };

    default:
      return { status: 'normal', interpretation: 'Within typical parameters.' };
  }
};
