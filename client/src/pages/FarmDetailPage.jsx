import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  MapPin,
  ArrowLeft,
  Droplets,
  Mountain,
  CloudSun,
  FlaskConical,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sprout,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const FarmDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showAddSoilModal, setShowAddSoilModal] = useState(false);

  const [soilForm, setSoilForm] = useState({
    nitrogen: 250,
    phosphorus: 20,
    potassium: 190,
    ph: 6.8,
    moisture: 35,
    temperature: 27,
    organic_carbon: 0.6,
    soil_texture: '',
    test_date: new Date().toISOString().split('T')[0],
  });

  // Fetch Plot details
  const { data: plot, isLoading: plotLoading } = useQuery({
    queryKey: ['plot', id],
    queryFn: async () => {
      const res = await api.getPlot(id);
      return res.data;
    },
  });

  // Fetch Plot-specific weather
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['plot-weather', id],
    queryFn: async () => {
      const res = await api.getPlotWeather(id);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // Fetch Soil records for this plot
  const { data: soilRecords, isLoading: soilLoading } = useQuery({
    queryKey: ['soil-records', id],
    queryFn: async () => {
      const res = await api.getSoilRecords(id);
      return res.data || [];
    },
    enabled: Boolean(id),
  });

  const addSoilMutation = useMutation({
    mutationFn: (data) => api.createSoilRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['soil-records', id]);
      setShowAddSoilModal(false);
    },
  });

  const handleAddSoil = (e) => {
    e.preventDefault();
    addSoilMutation.mutate({
      ...soilForm,
      nitrogen: soilForm.nitrogen ? Number(soilForm.nitrogen) : null,
      phosphorus: soilForm.phosphorus ? Number(soilForm.phosphorus) : null,
      potassium: soilForm.potassium ? Number(soilForm.potassium) : null,
      ph: soilForm.ph ? Number(soilForm.ph) : null,
      moisture: soilForm.moisture ? Number(soilForm.moisture) : null,
      temperature: soilForm.temperature ? Number(soilForm.temperature) : null,
      organic_carbon: soilForm.organic_carbon ? Number(soilForm.organic_carbon) : null,
    });
  };

  if (plotLoading) {
    return <LoadingSpinner text="Retrieving farm plot details..." />;
  }

  if (!plot) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Plot not found</h3>
        <Link to="/farms" className="text-emerald-600 text-sm mt-2 inline-block font-semibold">
          &larr; Back to Farms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/farms"
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-slate-900">{plot.plot_name}</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                {plot.area} {plot.area_unit || 'acres'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{plot.location || 'Location unassigned'}</p>
          </div>
        </div>

        <Link
          to="/crop-recommendations"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <Sprout className="w-4 h-4" />
          <span>Get Crop Advisory</span>
        </Link>
      </div>

      {/* Plot Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-2">
            <Mountain className="w-4 h-4 text-amber-500" />
            <span>Soil Characteristic</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{plot.soil_type || 'Unspecified'}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Root-zone texture profile</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>Irrigation Source</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{plot.irrigation_source || 'Rainfed'}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Primary water delivery system</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-2">
            <CloudSun className="w-4 h-4 text-emerald-500" />
            <span>Plot Microclimate</span>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {weather?.current ? `${weather.current.temperature}°C, ${weather.current.condition}` : 'Stable'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {weather?.advisory?.irrigation ? weather.advisory.irrigation.slice(0, 40) + '...' : 'Real-time observation'}
          </span>
        </div>
      </div>

      {/* Soil Test Records Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Plot Soil Test History</h3>
              <p className="text-xs text-slate-400">Nutrient benchmarks recorded for this land</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddSoilModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Soil Test</span>
          </button>
        </div>

        {soilRecords && soilRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Test Date</th>
                  <th className="py-3 px-4">Nitrogen (N)</th>
                  <th className="py-3 px-4">Phosphorus (P)</th>
                  <th className="py-3 px-4">Potassium (K)</th>
                  <th className="py-3 px-4">Soil pH</th>
                  <th className="py-3 px-4">Moisture</th>
                  <th className="py-3 px-4 rounded-r-xl">Organic C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {soilRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.test_date || 'Recent'}</span>
                    </td>
                    <td className="py-3 px-4">{r.nitrogen ? `${r.nitrogen} kg/ha` : '--'}</td>
                    <td className="py-3 px-4">{r.phosphorus ? `${r.phosphorus} kg/ha` : '--'}</td>
                    <td className="py-3 px-4">{r.potassium ? `${r.potassium} kg/ha` : '--'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{r.ph ?? '--'}</td>
                    <td className="py-3 px-4">{r.moisture ? `${r.moisture}%` : '--'}</td>
                    <td className="py-3 px-4">{r.organic_carbon ? `${r.organic_carbon}%` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-medium mb-3">
              No laboratory soil test has been recorded for this plot yet.
            </p>
            <button
              onClick={() => setShowAddSoilModal(true)}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition"
            >
              Record First Soil Test
            </button>
          </div>
        )}
      </div>

      {/* Add Soil Test Modal */}
      {showAddSoilModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-800 text-base">Record Soil Test Values</h3>
              <button
                onClick={() => setShowAddSoilModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSoil} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nitrogen (N) kg/ha</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={soilForm.nitrogen}
                    onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phosphorus (P) kg/ha</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={soilForm.phosphorus}
                    onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Potassium (K) kg/ha</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={soilForm.potassium}
                    onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Soil pH (0 - 14)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={soilForm.ph}
                    onChange={(e) => setSoilForm({ ...soilForm, ph: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Soil Moisture %</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={soilForm.moisture}
                    onChange={(e) => setSoilForm({ ...soilForm, moisture: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organic Carbon %</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={soilForm.organic_carbon}
                    onChange={(e) => setSoilForm({ ...soilForm, organic_carbon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">Soil Test Date</label>
                <input
                  type="date"
                  value={soilForm.test_date}
                  onChange={(e) => setSoilForm({ ...soilForm, test_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSoilModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSoilMutation.isPending}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  {addSoilMutation.isPending ? 'Saving...' : 'Save Soil Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
