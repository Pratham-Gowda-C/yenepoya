import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  SprayCan,
  MapPin,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const WeatherPage = () => {
  const [selectedPlotId, setSelectedPlotId] = useState('');

  // Fetch plots
  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  const selectedPlot = plots?.find((p) => p.id === selectedPlotId) || plots?.[0];

  const { data: weather, isLoading } = useQuery({
    queryKey: ['weather-full', selectedPlot?.id],
    queryFn: async () => {
      const res = await api.getCurrentWeather({
        latitude: selectedPlot?.latitude || 12.9716,
        longitude: selectedPlot?.longitude || 77.5946,
        plot_id: selectedPlot?.id,
      });
      return res.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Retrieving real-time agronomic weather telemetry..." size="lg" />;
  }

  const current = weather?.current || {};
  const advisory = weather?.advisory || {};
  const forecast = weather?.forecast || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Plot Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Agricultural Weather Station</h2>
            <p className="text-xs text-slate-500 font-medium">
              Provider: {weather?.provider || 'Open-Meteo'} • Observed: {weather?.observed_at ? new Date(weather.observed_at).toLocaleString() : 'Live'}
            </p>
          </div>
        </div>

        {plots && plots.length > 0 && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-xs"
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plot_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hero Weather Card */}
      <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200 block mb-1">
              Current Field Conditions
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl sm:text-6xl font-black">{current.temperature}°C</span>
              <span className="text-sm font-semibold text-sky-100">Feels like {current.feels_like}°C</span>
            </div>
            <p className="text-lg font-bold text-sky-100 mt-2">{current.condition}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
              <span className="text-sky-200 font-medium block">Relative Humidity</span>
              <span className="text-xl font-black mt-0.5 block">{current.humidity}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
              <span className="text-sky-200 font-medium block">Precipitation</span>
              <span className="text-xl font-black mt-0.5 block">{current.precipitation} mm</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
              <span className="text-sky-200 font-medium block">Surface Wind</span>
              <span className="text-xl font-black mt-0.5 block">{current.wind_speed} km/h</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
              <span className="text-sky-200 font-medium block">Wind Direction</span>
              <span className="text-xl font-black mt-0.5 block">{current.wind_direction}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Operations Advisory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Irrigation Guidance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Irrigation Management Alert</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {advisory.irrigation}
          </p>
          {advisory.warning && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{advisory.warning}</span>
            </div>
          )}
        </div>

        {/* Chemical Spraying Suitability */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Foliar Spraying Suitability</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {advisory.spraying_suitability}
          </p>
          <span className="text-[11px] text-slate-400 block">
            Safe foliar spraying window requires wind speeds &lt; 15 km/h to prevent agrochemical drift onto non-target flora.
          </span>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          7-Day Agricultural Forecast
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center space-y-2 transition"
            >
              <span className="text-xs font-bold text-slate-700 block">
                {idx === 0 ? 'Today' : new Date(f.date).toLocaleDateString([], { weekday: 'short' })}
              </span>
              <span className="text-[10px] text-slate-400 block">{f.date}</span>

              <div className="my-1">
                <span className="text-sm font-black text-slate-900 block">{Math.round(f.maxTemp)}°</span>
                <span className="text-xs text-slate-400 block">{Math.round(f.minTemp)}°</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[10px] space-y-0.5">
                <span className="text-blue-600 font-semibold block">{f.rainProbability}% Rain</span>
                <span className="text-slate-500 font-medium block truncate" title={f.condition}>
                  {f.condition}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
