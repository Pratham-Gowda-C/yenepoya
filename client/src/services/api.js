import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor to inject Authorization Bearer token from Supabase session
apiClient.interceptors.request.use(async (config) => {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // Inject mock/dev farmer ID for seamless local operation
    const savedUser = localStorage.getItem('agripulse_dev_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.id) config.headers['x-farmer-id'] = u.id;
      } catch {}
    }
  }
  return config;
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = error.response?.data?.error || {
      code: error.code || 'NETWORK_ERROR',
      message: error.message || 'Network request failed',
    };
    return Promise.reject(customError);
  }
);

export const api = {
  // Profile
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data) => apiClient.put('/profile', data),

  // Plots
  getPlots: () => apiClient.get('/plots'),
  getPlot: (id) => apiClient.get(`/plots/${id}`),
  createPlot: (data) => apiClient.post('/plots', data),
  updatePlot: (id, data) => apiClient.put(`/plots/${id}`, data),
  deletePlot: (id) => apiClient.delete(`/plots/${id}`),

  // Soil
  getSoilRecords: (plotId) => apiClient.get(`/plots/${plotId}/soil-records`),
  createSoilRecord: (plotId, data) => apiClient.post(`/plots/${plotId}/soil-records`, data),
  analyzeSoil: (data) => apiClient.post('/soil/analyze', data),

  // Crop Recommendations
  requestCropRecommendations: (data) => apiClient.post('/crop-recommendations', data),
  getCropRecommendations: (plotId) => apiClient.get('/crop-recommendations', { params: { plot_id: plotId } }),
  getCropRecommendationById: (id) => apiClient.get(`/crop-recommendations/${id}`),

  // Disease
  diagnoseDisease: (formData) =>
    apiClient.post('/disease/diagnose', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDiseaseHistory: () => apiClient.get('/disease/history'),

  // Fertilizer
  recommendFertilizer: (data) => apiClient.post('/fertilizer/recommend', data),
  getFertilizerHistory: () => apiClient.get('/fertilizer/history'),

  // Weather
  getCurrentWeather: (params) => apiClient.get('/weather/current', { params }),
  getWeatherForecast: (params) => apiClient.get('/weather/forecast', { params }),
  getPlotWeather: (plotId) => apiClient.get(`/plots/${plotId}/weather`),

  // AI Chat
  getConversations: () => apiClient.get('/chat/conversations'),
  createConversation: (data) => apiClient.post('/chat/conversations', data),
  getConversationMessages: (id) => apiClient.get(`/chat/conversations/${id}`),
  sendMessage: (conversationId, data) => apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
  deleteConversation: (id) => apiClient.delete(`/chat/conversations/${id}`),

  // Health
  getHealth: () => apiClient.get('/health'),
};
