import { env, hasSupabaseConfig, hasGeminiConfig } from '../config/env.js';

export const getHealth = (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      application: 'AgriPulse AI - Agricultural Decision Support Assistant',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      integrations: {
        supabase: hasSupabaseConfig ? 'connected' : 'development_fallback',
        gemini: hasGeminiConfig ? `configured (${env.GEMINI_MODEL})` : 'agronomic_rule_engine',
        weather: 'Open-Meteo Agronomic Service',
      },
    },
    message: 'AgriPulse AI backend service is healthy',
  });
};
