# AgriPulse AI 🌾
### AI-Powered Agriculture Crop Advisory Assistant

AgriPulse AI is a full-stack decision-support system built for Indian farmers. It combines real-time weather telemetry, ICAR agronomic thresholds, soil test parameters, and Google Gemini AI to provide actionable guidance across crop selection, plant pathology, fertilizer scheduling, and irrigation.

---

## 🌟 Key Features

1. **Farmer Authentication & Multi-Plot Management**
   - Supabase Auth session persistence, password reset, and protected routes.
   - Register multiple farm plots with area, soil classification, irrigation infrastructure, and GPS coordinates.

2. **AI Crop Recommendation Engine**
   - Scientific matching evaluating NPK levels, soil pH, seasonal windows (Kharif, Rabi, Zaid), water budgets, and live temperature/humidity.
   - Suitability scores (0-100) with detailed agronomic explanations and key precautions.

3. **Multimodal Disease Diagnosis**
   - Upload leaf/crop photographs directly from field camera or files.
   - Gemini Vision analyzes visible lesion morphology and identifies fungal, bacterial, and viral pathogens safely without recommending dangerous pesticide mixtures.

4. **4R Fertilizer Planning**
   - Calibrated nutrient dosing according to Right Source, Right Rate, Right Time, and Right Place.
   - Formulates split doses for Basal, Vegetative, Flowering, and Fruit/Grain filling stages.

5. **Live Weather & Evapotranspiration Alerts**
   - Real-time weather, 7-day agricultural forecasts, surface wind speeds, precipitation probability, and foliar spray suitability indices powered by Open-Meteo.

6. **Conversational AI Kisan Assistant**
   - Context-aware chatbot that prioritizes the farmer's registered plots, soil records, and local weather.
   - Full multilingual support in **8 Indian languages**: English, हिन्दी, ಕನ್ನಡ, తెలుగు, தமிழ், മലയാളം, मराठी, and বাংলা.

7. **Historical Archive**
   - Persistent records of crop evaluations, soil analyses, disease diagnoses, and fertilizer plans.

---

## 🏗️ Architecture Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts, Lucide React.
- **Backend**: Node.js, Express.js REST API, Zod Schema Validation, Helmet, Rate Limiting, CORS, Multer.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) on all farmer tables.
- **AI SDK**: Official `@google/genai` with model fallback to ICAR agronomic rule engines.
- **Weather API**: Open-Meteo real-time agricultural telemetry.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Start both server and client in development
npm run dev
```

- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:5000/api/v1`

---

## 🧪 Testing

Run the automated backend test suite:
```bash
node server/src/scripts/testEndpoints.js
```

---

## 📄 Documentation
- [Setup & Configuration Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Database Schema & Migrations](docs/DATABASE.md)
