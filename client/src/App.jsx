import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layout & Guards
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Protected Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { FarmsPage } from './pages/FarmsPage';
import { AddFarmPage } from './pages/AddFarmPage';
import { FarmDetailPage } from './pages/FarmDetailPage';
import { SoilAnalysisPage } from './pages/SoilAnalysisPage';
import { CropRecommendationsPage } from './pages/CropRecommendationsPage';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage';
import { FertilizerAdvisoryPage } from './pages/FertilizerAdvisoryPage';
import { WeatherPage } from './pages/WeatherPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes cache
      retry: 1,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/farms" element={<FarmsPage />} />
                <Route path="/farms/new" element={<AddFarmPage />} />
                <Route path="/farms/:id" element={<FarmDetailPage />} />
                <Route path="/soil-analysis" element={<SoilAnalysisPage />} />
                <Route path="/crop-recommendations" element={<CropRecommendationsPage />} />
                <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
                <Route path="/fertilizer-advisory" element={<FertilizerAdvisoryPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
