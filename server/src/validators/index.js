import { z } from 'zod';

export const profileUpdateSchema = {
  body: z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone: z.string().optional().nullable(),
    state: z.string().min(2, 'State is required').max(100),
    district: z.string().min(2, 'District is required').max(100),
    village: z.string().optional().nullable(),
    preferred_language: z.enum(['en', 'hi', 'kn', 'te', 'ta', 'ml', 'mr', 'bn']).default('en'),
    farming_experience: z.number().int().min(0).max(80).default(0),
    total_agricultural_land: z.number().min(0).default(0),
    land_measurement_unit: z.enum(['acres', 'hectares', 'bigha', 'guntha']).default('acres'),
    farming_type: z.enum(['conventional', 'organic', 'natural', 'mixed']).default('conventional'),
  }),
};

export const plotCreateSchema = {
  body: z.object({
    plot_name: z.string().min(1, 'Plot name is required').max(100),
    area: z.number().positive('Plot area must be greater than 0'),
    area_unit: z.enum(['acres', 'hectares', 'bigha', 'guntha']).default('acres'),
    soil_type: z.string().min(1, 'Soil type is required').max(50),
    irrigation_source: z.string().min(1, 'Irrigation source is required').max(100),
    location: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
  }),
};

export const plotUpdateSchema = {
  params: z.object({
    id: z.string().uuid('Invalid plot ID format'),
  }),
  body: z.object({
    plot_name: z.string().min(1).max(100).optional(),
    area: z.number().positive().optional(),
    area_unit: z.enum(['acres', 'hectares', 'bigha', 'guntha']).optional(),
    soil_type: z.string().max(50).optional(),
    irrigation_source: z.string().max(100).optional(),
    location: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
  }),
};

export const plotIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid plot ID format'),
  }),
};

export const soilRecordCreateSchema = {
  body: z.object({
    plot_id: z.string().uuid('Invalid plot ID format').optional().nullable(),
    nitrogen: z.number().min(0, 'Nitrogen must be non-negative').optional().nullable(),
    phosphorus: z.number().min(0, 'Phosphorus must be non-negative').optional().nullable(),
    potassium: z.number().min(0, 'Potassium must be non-negative').optional().nullable(),
    ph: z.number().min(0).max(14, 'Soil pH must be between 0 and 14').optional().nullable(),
    moisture: z.number().min(0).max(100, 'Moisture percentage must be between 0 and 100').optional().nullable(),
    temperature: z.number().optional().nullable(),
    organic_carbon: z.number().min(0, 'Organic carbon must be non-negative').optional().nullable(),
    soil_texture: z.string().max(50).optional().nullable(),
    test_date: z.string().optional().nullable(),
  }),
};

export const cropRecommendationRequestSchema = {
  body: z.object({
    plot_id: z.string().uuid().optional().nullable(),
    season: z.enum(['Kharif', 'Rabi', 'Zaid', 'Annual', 'Whole Year']),
    water_availability: z.enum(['Low', 'Moderate', 'High', 'Assured Irrigation']),
    preferred_crop_category: z.enum(['All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Commercial']).default('All'),
    budget_preference: z.enum(['Low', 'Moderate', 'High']).default('Moderate'),
    farming_objective: z.enum(['Maximum Yield', 'Low Water Consumption', 'Organic / Sustainable', 'Commercial Profitability']).default('Maximum Yield'),
    language: z.enum(['en', 'hi', 'kn', 'te', 'ta', 'ml', 'mr', 'bn']).default('en'),
  }),
};

export const diseaseDiagnoseSchema = {
  body: z.object({
    crop_name: z.string().min(1, 'Crop name is required').max(100),
    plant_part: z.enum(['Leaf', 'Stem', 'Fruit', 'Root', 'Flower', 'Whole Plant']).default('Leaf'),
    symptoms: z.string().optional().nullable(),
    plot_id: z.string().uuid().optional().nullable(),
    language: z.enum(['en', 'hi', 'kn', 'te', 'ta', 'ml', 'mr', 'bn']).default('en'),
  }),
};

export const fertilizerAdvisorySchema = {
  body: z.object({
    crop_name: z.string().min(1, 'Crop name is required').max(100),
    growth_stage: z.enum(['Basal / Sowing', 'Vegetative', 'Flowering / Tillering', 'Fruit / Grain Filling', 'Maturity / Pre-harvest']),
    plot_id: z.string().uuid().optional().nullable(),
    farm_area: z.number().positive().optional().nullable(),
    area_unit: z.enum(['acres', 'hectares', 'bigha', 'guntha']).default('acres'),
    nitrogen: z.number().min(0).optional().nullable(),
    phosphorus: z.number().min(0).optional().nullable(),
    potassium: z.number().min(0).optional().nullable(),
    ph: z.number().min(0).max(14).optional().nullable(),
    language: z.enum(['en', 'hi', 'kn', 'te', 'ta', 'ml', 'mr', 'bn']).default('en'),
  }),
};

export const chatMessageSchema = {
  body: z.object({
    conversation_id: z.string().uuid().optional().nullable(),
    message: z.string().min(1, 'Message cannot be empty').max(2000),
    plot_id: z.string().uuid().optional().nullable(),
    language: z.enum(['en', 'hi', 'kn', 'te', 'ta', 'ml', 'mr', 'bn']).default('en'),
  }),
};

export const weatherRequestSchema = {
  query: z.object({
    latitude: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(-90).max(90)).optional(),
    longitude: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(-180).max(180)).optional(),
    plot_id: z.string().uuid().optional(),
  }),
};
