# AgriPulse AI — Installation & Setup Guide

## Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node v24.21.0)
- **npm**: v9.0.0 or higher
- **Supabase Account**: (Free tier at [supabase.com](https://supabase.com))
- **Google AI Studio Key**: (For Gemini 2.5 Flash at [aistudio.google.com](https://aistudio.google.com))

---

## 1. Quick Start (Development Mode)

From the project root:

```bash
# 1. Install all dependencies (root, backend server, and frontend client)
npm run install:all

# 2. Run both Backend & Frontend concurrently
npm run dev
```

The application will start:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`

---

## 2. Environment Configuration

### Backend: `server/.env`
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Cloud PostgreSQL
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Weather Integration (Open-Meteo is default; zero-key needed)
WEATHER_API_BASE_URL=https://api.open-meteo.com/v1
```

### Frontend: `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 3. Database Migration

Apply the schema to your Supabase PostgreSQL database:

```bash
npm run migrate
```

Or copy `supabase/migrations/001_initial_schema.sql` into the Supabase SQL Editor.

---

## 4. Running Tests

Run the backend end-to-end test suite:

```bash
node server/src/scripts/testEndpoints.js
```
