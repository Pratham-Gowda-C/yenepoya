-- AgriPulse AI Initial Database Schema Migration
-- Compatible with Supabase Cloud PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    state TEXT,
    district TEXT,
    village TEXT,
    preferred_language TEXT DEFAULT 'en',
    farming_experience INTEGER DEFAULT 0,
    total_agricultural_land NUMERIC DEFAULT 0,
    land_measurement_unit TEXT DEFAULT 'acres',
    farming_type TEXT DEFAULT 'conventional',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLOTS TABLE
CREATE TABLE IF NOT EXISTS public.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_name TEXT NOT NULL,
    area NUMERIC NOT NULL CHECK (area > 0),
    area_unit TEXT NOT NULL DEFAULT 'acres',
    soil_type TEXT,
    irrigation_source TEXT,
    location TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SOIL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.soil_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID REFERENCES public.plots(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nitrogen NUMERIC CHECK (nitrogen IS NULL OR nitrogen >= 0),
    phosphorus NUMERIC CHECK (phosphorus IS NULL OR phosphorus >= 0),
    potassium NUMERIC CHECK (potassium IS NULL OR potassium >= 0),
    ph NUMERIC CHECK (ph IS NULL OR (ph >= 0 AND ph <= 14)),
    moisture NUMERIC CHECK (moisture IS NULL OR (moisture >= 0 AND moisture <= 100)),
    temperature NUMERIC,
    organic_carbon NUMERIC CHECK (organic_carbon IS NULL OR organic_carbon >= 0),
    soil_texture TEXT,
    test_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CROP RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    season TEXT,
    input_snapshot JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    ai_model TEXT,
    source_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISEASE DIAGNOSES TABLE
CREATE TABLE IF NOT EXISTS public.disease_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    crop_name TEXT,
    image_path TEXT,
    symptoms TEXT,
    diagnosis JSONB NOT NULL,
    ai_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FERTILIZER PLANS TABLE
CREATE TABLE IF NOT EXISTS public.fertilizer_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    crop_name TEXT,
    growth_stage TEXT,
    fertilizer_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Agricultural Advisory Session',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WEATHER RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.weather_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    temperature NUMERIC,
    humidity NUMERIC,
    rainfall NUMERIC,
    wind_speed NUMERIC,
    weather_description TEXT,
    provider TEXT DEFAULT 'Open-Meteo',
    observed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE AND FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_plots_farmer_id ON public.plots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_soil_records_plot_id ON public.soil_records(plot_id);
CREATE INDEX IF NOT EXISTS idx_soil_records_farmer_id ON public.soil_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_farmer_id ON public.crop_recommendations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_diagnoses_farmer_id ON public.disease_diagnoses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_plans_farmer_id ON public.fertilizer_plans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_farmer_id ON public.chat_conversations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_farmer_id ON public.chat_messages(farmer_id);
CREATE INDEX IF NOT EXISTS idx_weather_records_farmer_id ON public.weather_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_weather_records_plot_id ON public.weather_records(plot_id);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ATTACH TRIGGERS
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_plots_updated_at ON public.plots;
CREATE TRIGGER trg_plots_updated_at
    BEFORE UPDATE ON public.plots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER trg_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, preferred_language)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Farmer'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;

-- ROW LEVEL SECURITY POLICIES

-- PROFILES
DROP POLICY IF EXISTS "Farmers can view own profile" ON public.profiles;
CREATE POLICY "Farmers can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Farmers can update own profile" ON public.profiles;
CREATE POLICY "Farmers can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Farmers can insert own profile" ON public.profiles;
CREATE POLICY "Farmers can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- PLOTS
DROP POLICY IF EXISTS "Farmers can view own plots" ON public.plots;
CREATE POLICY "Farmers can view own plots" ON public.plots
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own plots" ON public.plots;
CREATE POLICY "Farmers can insert own plots" ON public.plots
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update own plots" ON public.plots;
CREATE POLICY "Farmers can update own plots" ON public.plots
    FOR UPDATE USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own plots" ON public.plots;
CREATE POLICY "Farmers can delete own plots" ON public.plots
    FOR DELETE USING (auth.uid() = farmer_id);

-- SOIL RECORDS
DROP POLICY IF EXISTS "Farmers can view own soil records" ON public.soil_records;
CREATE POLICY "Farmers can view own soil records" ON public.soil_records
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own soil records" ON public.soil_records;
CREATE POLICY "Farmers can insert own soil records" ON public.soil_records
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update own soil records" ON public.soil_records;
CREATE POLICY "Farmers can update own soil records" ON public.soil_records
    FOR UPDATE USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own soil records" ON public.soil_records;
CREATE POLICY "Farmers can delete own soil records" ON public.soil_records
    FOR DELETE USING (auth.uid() = farmer_id);

-- CROP RECOMMENDATIONS
DROP POLICY IF EXISTS "Farmers can view own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Farmers can view own crop recommendations" ON public.crop_recommendations
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Farmers can insert own crop recommendations" ON public.crop_recommendations
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Farmers can delete own crop recommendations" ON public.crop_recommendations
    FOR DELETE USING (auth.uid() = farmer_id);

-- DISEASE DIAGNOSES
DROP POLICY IF EXISTS "Farmers can view own disease diagnoses" ON public.disease_diagnoses;
CREATE POLICY "Farmers can view own disease diagnoses" ON public.disease_diagnoses
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own disease diagnoses" ON public.disease_diagnoses;
CREATE POLICY "Farmers can insert own disease diagnoses" ON public.disease_diagnoses
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own disease diagnoses" ON public.disease_diagnoses;
CREATE POLICY "Farmers can delete own disease diagnoses" ON public.disease_diagnoses
    FOR DELETE USING (auth.uid() = farmer_id);

-- FERTILIZER PLANS
DROP POLICY IF EXISTS "Farmers can view own fertilizer plans" ON public.fertilizer_plans;
CREATE POLICY "Farmers can view own fertilizer plans" ON public.fertilizer_plans
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own fertilizer plans" ON public.fertilizer_plans;
CREATE POLICY "Farmers can insert own fertilizer plans" ON public.fertilizer_plans
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own fertilizer plans" ON public.fertilizer_plans;
CREATE POLICY "Farmers can delete own fertilizer plans" ON public.fertilizer_plans
    FOR DELETE USING (auth.uid() = farmer_id);

-- CHAT CONVERSATIONS
DROP POLICY IF EXISTS "Farmers can view own chat conversations" ON public.chat_conversations;
CREATE POLICY "Farmers can view own chat conversations" ON public.chat_conversations
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own chat conversations" ON public.chat_conversations;
CREATE POLICY "Farmers can insert own chat conversations" ON public.chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update own chat conversations" ON public.chat_conversations;
CREATE POLICY "Farmers can update own chat conversations" ON public.chat_conversations
    FOR UPDATE USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own chat conversations" ON public.chat_conversations;
CREATE POLICY "Farmers can delete own chat conversations" ON public.chat_conversations
    FOR DELETE USING (auth.uid() = farmer_id);

-- CHAT MESSAGES
DROP POLICY IF EXISTS "Farmers can view own chat messages" ON public.chat_messages;
CREATE POLICY "Farmers can view own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Farmers can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- WEATHER RECORDS
DROP POLICY IF EXISTS "Farmers can view own weather records" ON public.weather_records;
CREATE POLICY "Farmers can view own weather records" ON public.weather_records
    FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own weather records" ON public.weather_records;
CREATE POLICY "Farmers can insert own weather records" ON public.weather_records
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- STORAGE BUCKET FOR CROP IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Authenticated users can upload crop images" ON storage.objects;
CREATE POLICY "Authenticated users can upload crop images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can read crop images" ON storage.objects;
CREATE POLICY "Authenticated users can read crop images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'crop-images');

DROP POLICY IF EXISTS "Public can view crop images if bucket is public" ON storage.objects;
CREATE POLICY "Public can view crop images if bucket is public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'crop-images');


-- 10. REFERENCE CROPS DATA TABLE (ICAR & Agricultural Standards)
CREATE TABLE IF NOT EXISTS public.crop_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    optimal_season TEXT NOT NULL,
    suitable_soil_types TEXT[] NOT NULL,
    min_ph NUMERIC NOT NULL,
    max_ph NUMERIC NOT NULL,
    nitrogen_kg_per_ha NUMERIC NOT NULL,
    phosphorus_kg_per_ha NUMERIC NOT NULL,
    potassium_kg_per_ha NUMERIC NOT NULL,
    water_requirement_mm TEXT NOT NULL,
    duration_days_min INTEGER NOT NULL,
    duration_days_max INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crop_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read crop references" ON public.crop_references;
CREATE POLICY "Anyone can read crop references" ON public.crop_references
    FOR SELECT USING (true);

-- SEED DATA: ICAR-BENCHMARKED CROPS FOR INDIAN AGRO-CLIMATIC CONDITIONS
INSERT INTO public.crop_references (
    crop_name, category, optimal_season, suitable_soil_types, min_ph, max_ph,
    nitrogen_kg_per_ha, phosphorus_kg_per_ha, potassium_kg_per_ha,
    water_requirement_mm, duration_days_min, duration_days_max, description
) VALUES
('Rice (Paddy)', 'Cereals', 'Kharif', ARRAY['Clay', 'Clay Loam', 'Alluvial'], 5.5, 7.0, 100, 50, 50, '1200-1400 mm', 110, 150, 'High water demanding staple cereal suited for Kharif season.'),
('Wheat', 'Cereals', 'Rabi', ARRAY['Loamy', 'Clay Loam', 'Alluvial'], 6.0, 7.5, 120, 60, 40, '450-650 mm', 100, 140, 'Prime rabi cereal crop demanding cool temperatures during vegetative growth.'),
('Maize', 'Cereals', 'Kharif / Rabi', ARRAY['Loamy', 'Sandy Loam', 'Red Loam'], 5.8, 7.5, 120, 60, 40, '500-800 mm', 90, 120, 'Versatile cereal with good drought resilience compared to rice.'),
('Cotton', 'Commercial', 'Kharif', ARRAY['Black Cotton Soil', 'Deep Alluvial'], 6.0, 8.0, 100, 50, 50, '700-1100 mm', 150, 180, 'Deep-rooted commercial fiber crop suited for black soils with good moisture retention.'),
('Sugarcane', 'Commercial', 'Annual', ARRAY['Deep Loam', 'Clay Loam', 'Alluvial'], 6.5, 7.5, 250, 100, 120, '1500-2500 mm', 300, 360, 'Long duration heavy-feeder cash crop requiring assured irrigation.'),
('Chickpea (Gram)', 'Pulses', 'Rabi', ARRAY['Sandy Loam', 'Loamy', 'Clay Loam'], 6.0, 7.5, 20, 50, 20, '250-400 mm', 90, 120, 'Nitrogen-fixing pulse crop highly suitable for dryland and residual moisture.'),
('Soybean', 'Oilseeds', 'Kharif', ARRAY['Well-drained Loam', 'Black Soil'], 6.0, 7.5, 30, 60, 40, '450-700 mm', 90, 110, 'Dual-purpose oilseed and protein crop fixing atmospheric nitrogen.'),
('Groundnut', 'Oilseeds', 'Kharif / Zaid', ARRAY['Sandy Loam', 'Light Loam'], 6.0, 7.0, 25, 50, 75, '500-700 mm', 105, 125, 'Pod-bearing legume thriving in loose, well-aerated friable soils.'),
('Mustard', 'Oilseeds', 'Rabi', ARRAY['Loam', 'Sandy Loam', 'Alluvial'], 6.0, 7.5, 80, 40, 40, '300-450 mm', 105, 135, 'Prominent winter oilseed crop with modest moisture requirement.'),
('Tomato', 'Vegetables', 'Kharif / Rabi / Zaid', ARRAY['Sandy Loam', 'Rich Loam', 'Red Soil'], 6.0, 7.0, 150, 100, 100, '600-800 mm', 90, 130, 'High-value horticultural crop sensitive to water-logging and extreme frost.')
ON CONFLICT (crop_name) DO NOTHING;
