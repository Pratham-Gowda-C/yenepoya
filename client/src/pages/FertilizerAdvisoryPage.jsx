import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Droplets,
  Sparkles,
  Layers,
  Clock,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Info,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const GROWTH_STAGES = [
  'Basal / Sowing',
  'Vegetative',
  'Flowering / Tillering',
  'Fruit / Grain Filling',
  'Maturity / Pre-harvest',
];

const CROPS = [
  'Rice (Paddy)',
  'Wheat',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Chickpea (Gram)',
  'Soybean',
  'Groundnut',
  'Tomato',
  'Mustard',
];

export const FertilizerAdvisoryPage = () => {
  const [cropName, setCropName] = useState('Rice (Paddy)');
  const [growthStage, setGrowthStage] = useState('Basal / Sowing');
  const [plotId, setPlotId] = useState('');
  const [farmArea, setFarmArea] = useState(1);
  const [areaUnit, setAreaUnit] = useState('acres');

  const [fertilizerPlan, setFertilizerPlan] = useState(null);

  // Fetch plots
  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  const recommendMutation = useMutation({
    mutationFn: (data) => api.recommendFertilizer(data),
    onSuccess: (res) => {
      setFertilizerPlan(res.data);
    },
  });

  const handlePlotSelect = (id) => {
    setPlotId(id);
    const p = plots?.find((item) => item.id === id);
    if (p) {
      setFarmArea(p.area);
      setAreaUnit(p.area_unit || 'acres');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    recommendMutation.mutate({
      crop_name: cropName,
      growth_stage: growthStage,
      plot_id: plotId || null,
      farm_area: Number(farmArea),
      area_unit: areaUnit,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <Droplets className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">4R Fertilizer Advisory Engine</h2>
          <p className="text-xs text-slate-500 font-medium">
            Calibrated nutrient dosages tailored to growth stages and ICAR agronomic packages
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Nutrient Planning Inputs
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Crop
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Crop Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {GROWTH_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Registered Plot
              </label>
              <select
                value={plotId}
                onChange={(e) => handlePlotSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Manual Area Entry</option>
                {plots?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plot_name} ({p.area} {p.area_unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cultivated Land Area
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-l-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="bigha">Bigha</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={recommendMutation.isPending}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 h-[42px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{recommendMutation.isPending ? 'Calculating Dosages...' : 'Calculate Fertilizer Dosages'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading */}
      {recommendMutation.isPending && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <LoadingSpinner text="Formulating split fertilizer dosages according to 4R nutrient stewardship..." size="lg" />
        </div>
      )}

      {/* Results */}
      {fertilizerPlan && !recommendMutation.isPending && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-1">
              Nutrient Management Plan
            </span>
            <h3 className="text-2xl font-black">{fertilizerPlan.crop_name} — {fertilizerPlan.growth_stage}</h3>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-2 max-w-2xl leading-relaxed">
              {fertilizerPlan.soil_assessment}
            </p>
          </div>

          {/* Fertilizer Options List */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">
              Recommended Fertilizer Applications
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fertilizerPlan.fertilizer_options?.map((fert, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h5 className="font-extrabold text-slate-900 text-base">{fert.name}</h5>
                      {fert.verified_rate && (
                        <div className="px-3 py-1 bg-blue-50 text-blue-800 font-black text-xs rounded-xl border border-blue-100 shrink-0">
                          {fert.verified_rate} {fert.rate_unit}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                      {fert.purpose}
                    </p>

                    <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-start space-x-2 text-slate-600">
                        <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">Application Timing: </span>
                          <span>{fert.application_timing}</span>
                        </div>
                      </div>

                      {fert.reference && (
                        <div className="flex items-start space-x-2 text-slate-400 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>Standard: {fert.reference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Precautions */}
          {fertilizerPlan.precautions?.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-3xl space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Environmental & Safety Considerations</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {fertilizerPlan.precautions.map((p, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
