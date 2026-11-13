import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Sprout,
  Sparkles,
  Droplets,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Info,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CropRecommendationsPage = () => {
  const queryClient = useQueryClient();

  const [plotId, setPlotId] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [waterAvailability, setWaterAvailability] = useState('Moderate');
  const [preferredCategory, setPreferredCategory] = useState('All');
  const [budgetPreference, setBudgetPreference] = useState('Moderate');
  const [farmingObjective, setFarmingObjective] = useState('Maximum Yield');

  const [recommendationResult, setRecommendationResult] = useState(null);

  // Load farmer plots
  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  const recommendMutation = useMutation({
    mutationFn: (data) => api.requestCropRecommendations(data),
    onSuccess: (res) => {
      setRecommendationResult(res.data);
      queryClient.invalidateQueries(['crop-recommendations']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    recommendMutation.mutate({
      plot_id: plotId || null,
      season,
      water_availability: waterAvailability,
      preferred_crop_category: preferredCategory,
      budget_preference: budgetPreference,
      farming_objective: farmingObjective,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">AI Crop Recommendation Engine</h2>
          <p className="text-xs text-slate-500 font-medium">
            Personalized crop matching based on soil chemistry, seasonal window, and water budget
          </p>
        </div>
      </div>

      {/* Advisory Criteria Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Cultivation Criteria
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Farm Plot
              </label>
              <select
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">General Assessment (No Plot Selected)</option>
                {plots?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plot_name} — {p.soil_type} ({p.area} {p.area_unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Agricultural Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Kharif">Kharif (Monsoon / Summer: Jun - Oct)</option>
                <option value="Rabi">Rabi (Winter: Oct - Mar)</option>
                <option value="Zaid">Zaid (Summer: Mar - Jun)</option>
                <option value="Annual">Annual / Multi-season</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Water Availability
              </label>
              <select
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low (Drought prone / Rainfed only)</option>
                <option value="Moderate">Moderate (Intermittent irrigation / Borewell)</option>
                <option value="High">High (Ample canal water)</option>
                <option value="Assured Irrigation">Assured Irrigation (24x7 Drip/Canal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Category
              </label>
              <select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Categories</option>
                <option value="Cereals">Cereals (Paddy, Wheat, Maize)</option>
                <option value="Pulses">Pulses (Chickpea, Arhar, Moong)</option>
                <option value="Oilseeds">Oilseeds (Soybean, Mustard, Groundnut)</option>
                <option value="Vegetables">Vegetables (Tomato, Chili, Onion)</option>
                <option value="Commercial">Commercial (Cotton, Sugarcane)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Budget Allocation
              </label>
              <select
                value={budgetPreference}
                onChange={(e) => setBudgetPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low Input Cost</option>
                <option value="Moderate">Moderate Capital</option>
                <option value="High">High Investment (High Yield Target)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Farming Objective
              </label>
              <select
                value={farmingObjective}
                onChange={(e) => setFarmingObjective(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Maximum Yield">Maximum Yield Output</option>
                <option value="Low Water Consumption">Low Water Consumption</option>
                <option value="Organic / Sustainable">Organic / Soil Conservation</option>
                <option value="Commercial Profitability">Commercial Profitability</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={recommendMutation.isPending}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{recommendMutation.isPending ? 'Generating Crop Fit...' : 'Generate Crop Recommendations'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {recommendMutation.isPending && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <LoadingSpinner text="Evaluating soil nutrients, seasonal climate, and ICAR crop suitability..." size="lg" />
        </div>
      )}

      {/* Results Display */}
      {recommendationResult && !recommendMutation.isPending && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Agronomic Evaluation Summary</span>
            </div>
            <p className="text-sm sm:text-base text-emerald-50 font-medium leading-relaxed max-w-3xl">
              {recommendationResult.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-emerald-200">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-white">Target Season:</span>
                <span>{season}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-white">Data Quality:</span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-300">
                  {recommendationResult.data_quality}
                </span>
              </div>
            </div>
          </div>

          {/* Missing info notice if any */}
          {recommendationResult.missing_information?.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start space-x-3">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block mb-1">Unmeasured Variables:</span>
                <p className="text-slate-600">
                  {recommendationResult.missing_information.join(' • ')}. Recommendations rely on regional soil baselines for unmeasured nutrients.
                </p>
              </div>
            </div>
          )}

          {/* Recommended Crop Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-800">
              Ranked Crop Candidates ({recommendationResult.recommendations?.length || 0})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendationResult.recommendations?.map((crop, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xl font-extrabold text-slate-900">{crop.crop_name}</h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                            {crop.season}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium block mt-0.5">
                          Est. Duration: {crop.duration_days} days
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-sm inline-block">
                          {crop.suitability_score}%
                        </div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          Suitability
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-3">
                      {crop.suitability_explanation}
                    </p>

                    <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-start space-x-2 text-slate-600">
                        <Layers className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">Soil Fit: </span>
                          <span>{crop.soil_compatibility}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-slate-600">
                        <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">Water Demand: </span>
                          <span>{crop.water_requirement}</span>
                        </div>
                      </div>
                    </div>

                    {crop.precautions?.length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-slate-700 block text-[11px]">Key Agronomic Precautions:</span>
                        {crop.precautions.map((p, pi) => (
                          <div key={pi} className="flex items-start space-x-1.5 text-slate-600 text-[11px]">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-slate-100 text-slate-500 text-[11px] rounded-2xl text-center leading-relaxed font-medium">
            {recommendationResult.disclaimer || 'Suitability scores are model-generated estimates. Consult local agricultural authorities before planting.'}
          </div>
        </div>
      )}
    </div>
  );
};
