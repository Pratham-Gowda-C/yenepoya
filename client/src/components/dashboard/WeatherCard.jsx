import React from 'react';
import { CloudSun, Droplets, Wind, Thermometer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WeatherCard = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse h-64 flex flex-col justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-slate-200 rounded w-1/2 mb-4" />
        <div className="h-16 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  const current = weather?.current || {};
  const advisory = weather?.advisory || {};

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Real-time Weather & Alerts</h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Observed: {weather?.observed_at ? new Date(weather.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </span>
          </div>
        </div>
        <Link
          to="/weather"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          7-Day Forecast &rarr;
        </Link>
      </div>

      {/* Main weather metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>Temperature</span>
          </div>
          <p className="text-xl font-extrabold text-slate-800">
            {current.temperature ?? '--'}°C
          </p>
          <span className="text-[10px] text-slate-400">Feels {current.feels_like ?? current.temperature}°C</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Humidity</span>
          </div>
          <p className="text-xl font-extrabold text-slate-800">
            {current.humidity ?? '--'}%
          </p>
          <span className="text-[10px] text-slate-400">Relative</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-500" />
            <span>Wind Speed</span>
          </div>
          <p className="text-xl font-extrabold text-slate-800">
            {current.wind_speed ?? '--'} <span className="text-xs font-normal">km/h</span>
          </p>
          <span className="text-[10px] text-slate-400">Surface wind</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <CloudSun className="w-3.5 h-3.5 text-indigo-500" />
            <span>Condition</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate" title={current.condition}>
            {current.condition || 'Clear'}
          </p>
          <span className="text-[10px] text-slate-400">Precip: {current.precipitation ?? 0} mm</span>
        </div>
      </div>

      {/* Agronomic Advisory Callout */}
      <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-3 ${
        advisory.warning ? 'bg-amber-50 text-amber-900 border border-amber-200/80' : 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
      }`}>
        {advisory.warning ? (
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        )}
        <div>
          <span className="font-bold block mb-0.5">
            {advisory.warning ? 'Weather Warning Alert' : 'Irrigation Advisory'}
          </span>
          <p className="leading-relaxed">
            {advisory.warning || advisory.irrigation || 'Weather conditions are optimal for general crop maintenance.'}
          </p>
        </div>
      </div>
    </div>
  );
};
