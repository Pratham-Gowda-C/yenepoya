import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { QuickActions } from '../components/dashboard/QuickActions';
import { WeatherCard } from '../components/dashboard/WeatherCard';
import { FarmSummaryCard } from '../components/dashboard/FarmSummaryCard';
import { SoilHealthCard } from '../components/dashboard/SoilHealthCard';
import { RecommendationCard } from '../components/dashboard/RecommendationCard';
import { Sparkles, Calendar, Activity, ArrowRight, Sprout, Bug, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { t } = useLanguage();

  // 1. Fetch Farm Plots
  const { data: plotsData, isLoading: plotsLoading } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  // 2. Fetch Live Weather for primary plot or default coords
  const plots = plotsData || [];
  const primaryPlot = plots[0];

  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', primaryPlot?.id],
    queryFn: async () => {
      const res = await api.getCurrentWeather({
        latitude: primaryPlot?.latitude || 12.9716,
        longitude: primaryPlot?.longitude || 77.5946,
        plot_id: primaryPlot?.id,
      });
      return res.data;
    },
  });

  // 3. Fetch Latest Soil Record for primary plot
  const { data: soilRecords, isLoading: soilLoading } = useQuery({
    queryKey: ['soil-records', primaryPlot?.id],
    queryFn: async () => {
      if (!primaryPlot) return [];
      const res = await api.getSoilRecords(primaryPlot.id);
      return res.data || [];
    },
    enabled: Boolean(primaryPlot?.id),
  });

  // 4. Fetch Latest Crop Recommendations
  const { data: recData, isLoading: recLoading } = useQuery({
    queryKey: ['crop-recommendations'],
    queryFn: async () => {
      const res = await api.getCropRecommendations();
      return res.data || [];
    },
  });

  const latestSoil = soilRecords?.[0] || null;
  const latestRec = recData?.[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kisan Agronomic Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Crop Advisory & Diagnostics
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Monitor real-time microclimate alerts, soil nutrient balances, and AI-predicted seasonal suitability for your registered plots.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 z-10 shrink-0">
          <Link
            to="/crop-recommendations"
            className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>New Crop Advisory</span>
          </Link>
          <Link
            to="/disease-detection"
            className="px-5 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 border border-white/20 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2"
          >
            <Bug className="w-4 h-4 text-emerald-300" />
            <span>Scan Crop Leaf</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Weather & Farm Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeatherCard weather={weatherData} loading={weatherLoading} />
        </div>
        <div>
          <FarmSummaryCard plots={plots} loading={plotsLoading} />
        </div>
      </div>

      {/* Diagnostics & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SoilHealthCard soilRecord={latestSoil} loading={soilLoading} />
        <RecommendationCard recommendation={latestRec} loading={recLoading} />
      </div>

      {/* Recent Farm Advisory Activity Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Advisory Activity</h3>
              <span className="text-[11px] text-slate-400 font-medium">Recorded farm actions</span>
            </div>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-xs text-slate-800 block">
                {latestRec ? `Crop recommendation analyzed for ${latestRec.season || 'Kharif'}` : 'System initialized with verified ICAR benchmarks'}
              </span>
              <span className="text-[11px] text-slate-400">
                {latestRec?.created_at ? new Date(latestRec.created_at).toLocaleDateString() : 'Active session'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Complete
            </span>
          </div>

          <div className="py-3 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-xs text-slate-800 block">
                Weather-based evapotranspiration and irrigation guidance updated
              </span>
              <span className="text-[11px] text-slate-400">
                {weatherData?.observed_at ? new Date(weatherData.observed_at).toLocaleTimeString() : 'Live'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
