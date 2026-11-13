import { GoogleGenAI } from '@google/genai';
import { env, hasGeminiConfig } from './env.js';

let geminiClient = null;

if (hasGeminiConfig) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
    console.log(`✅ Google GenAI SDK initialized with model: ${env.GEMINI_MODEL}`);
  } catch (error) {
    console.error('❌ Failed to initialize Google GenAI SDK:', error.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not configured. Advisory services will use built-in agronomic intelligence fallback.');
}

export const ai = geminiClient;
export const defaultModel = env.GEMINI_MODEL || 'gemini-2.5-flash';
