import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { MapPin, Navigation, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const COMMON_SOILS = [
  'Clay Loam',
  'Alluvial Soil',
  'Black Cotton Soil',
  'Red Loam',
  'Sandy Loam',
  'Laterite Soil',
  'Clay',
  'Sandy',
  'Saline / Alkaline Soil',
];

const COMMON_IRRIGATION = [
  'Canal & Borewell',
  'Borewell with Drip',
  'Open Well',
  'Borewell (Flood)',
  'Canal Water',
  'Sprinkler System',
  'Rainfed (Monsoon Dependent)',
  'Tank / Pond Irrigation',
];

export const AddFarmPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    plot_name: '',
    area: 1.5,
    area_unit: 'acres',
    soil_type: 'Clay Loam',
    irrigation_source: 'Canal & Borewell',
    location: '',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => api.createPlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['plots']);
      navigate('/farms');
    },
    onError: (err) => {
      setError(err.message || 'Failed to create farm plot');
    },
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setLocating(false);
        alert('Could not determine GPS coordinates. You can type them manually or leave them as regional default.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      ...formData,
      area: Number(formData.area),
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/farms"
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Register New Farm Plot</h2>
          <p className="text-xs text-slate-500 font-medium">
            Define boundaries, soil characteristics, and irrigation sources for this plot
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Plot Name *
            </label>
            <input
              type="text"
              required
              value={formData.plot_name}
              onChange={(e) => setFormData({ ...formData, plot_name: e.target.value })}
              placeholder="e.g. North Canal Field / Survey No 42"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Plot Area *
            </label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                min="0.05"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-l-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={formData.area_unit}
                onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                className="px-2 py-2 text-xs font-semibold bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="bigha">Bigha</option>
                <option value="guntha">Guntha</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Soil Type *
            </label>
            <select
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {COMMON_SOILS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Irrigation Source *
            </label>
            <select
              value={formData.irrigation_source}
              onChange={(e) => setFormData({ ...formData, irrigation_source: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {COMMON_IRRIGATION.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Plot Location / Landmark
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Near village lake, Mandya Taluk"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* GPS Coordinates & Device Geolocation */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              GPS Coordinates (Used for hyper-local weather alerts)
            </span>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locating}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>{locating ? 'Locating...' : 'Use My GPS Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Latitude (-90 to +90)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Longitude (-180 to +180)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            to="/farms"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{createMutation.isPending ? 'Saving Plot...' : 'Save Farm Plot'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
