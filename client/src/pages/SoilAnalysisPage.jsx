import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  FlaskConical,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Save,
  Check,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SoilAnalysisPage = () => {
  const [plotId, setPlotId] = useState('');
  const [formData, setFormData] = useState({
    nitrogen: 240,
    phosphorus: 18,
    potassium: 210,
    ph: 6.8,
    moisture: 38,
    temperature: 26,
    organic_carbon: 0.65,
    soil_texture: 'Clay Loam',
    test_date: new Date().toISOString().split('T')[0],
    save_record: true,
  });

  const [analysisResult, setAnalysisResult] = useState(null);

  // Load farmer plots for dropdown
  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: (data) => api.analyzeSoil(data),
    onSuccess: (res) => {
      setAnalysisResult(res.data);
    },
  });

  const handlePlotSelect = (selectedId) => {
    setPlotId(selectedId);
    const selectedPlot = plots?.find((p) => p.id === selectedId);
    if (selectedPlot?.soil_type) {
      setFormData((prev) => ({ ...prev, soil_texture: selectedPlot.soil_type }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeMutation.mutate({
      ...formData,
      plot_id: plotId || null,
      nitrogen: formData.nitrogen !== '' ? Number(formData.nitrogen) : null,
      phosphorus: formData.phosphorus !== '' ? Number(formData.phosphorus) : null,
      potassium: formData.potassium !== '' ? Number(formData.potassium) : null,
      ph: formData.ph !== '' ? Number(formData.ph) : null,
      moisture: formData.moisture !== '' ? Number(formData.moisture) : null,
      temperature: formData.temperature !== '' ? Number(formData.temperature) : null,
      organic_carbon: formData.organic_carbon !== '' ? Number(formData.organic_carbon) : null,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Banner */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mridapariksha — Soil Health Analysis</h2>
          <p className="text-xs text-slate-500 font-medium">
            Benchmark macro and micronutrients against ICAR agronomic thresholds
          </p>
        </div>
      </div>

      {/* Main Grid: Form on left, Analysis on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Soil Test Parameters
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assign to Plot (Optional)
              </label>
              <select
                value={plotId}
                onChange={(e) => handlePlotSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">General / Unassigned Sample</option>
                {plots?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plot_name} ({p.area} {p.area_unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nitrogen (N) kg/ha</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                  placeholder="e.g. 240"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phosphorus (P) kg/ha</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                  placeholder="e.g. 18"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Potassium (K) kg/ha</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                  placeholder="e.g. 210"
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
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                  placeholder="e.g. 6.8"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Moisture %</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.moisture}
                  onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                  placeholder="e.g. 38"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Organic Carbon %</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={formData.organic_carbon}
                  onChange={(e) => setFormData({ ...formData, organic_carbon: e.target.value })}
                  placeholder="e.g. 0.65"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Soil Texture</label>
                <input
                  type="text"
                  value={formData.soil_texture}
                  onChange={(e) => setFormData({ ...formData, soil_texture: e.target.value })}
                  placeholder="Clay Loam / Sandy"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Test Date</label>
                <input
                  type="date"
                  value={formData.test_date}
                  onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={analyzeMutation.isPending}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzeMutation.isPending ? 'Analyzing Soil Report...' : 'Run Soil Health Diagnostics'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Diagnostic Results */}
        <div className="lg:col-span-7 space-y-5">
          {analyzeMutation.isPending && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
              <LoadingSpinner text="Evaluating soil fertility with ICAR agronomic thresholds..." size="lg" />
            </div>
          )}

          {!analyzeMutation.isPending && !analysisResult && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Ready for Soil Diagnostics</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Provide your laboratory soil test values on the left. The engine will assess nutrient balance, identify deficiencies, and formulate soil health restoration steps.
              </p>
            </div>
          )}

          {!analyzeMutation.isPending && analysisResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              {/* Header Status */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Fertility Profile
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Soil Health Diagnosis
                  </h3>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                    analysisResult.soil_health_status === 'good'
                      ? 'bg-emerald-100 text-emerald-800'
                      : analysisResult.soil_health_status === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {analysisResult.soil_health_status} Status
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {analysisResult.summary}
              </p>

              {/* Parameter Cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Parameter-by-Parameter Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.parameters?.map((param, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{param.name}</span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            param.status === 'normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : param.status === 'low'
                              ? 'bg-amber-100 text-amber-800'
                              : param.status === 'high'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {param.status}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {param.value !== null ? `${param.value} ${param.unit}` : 'Unmeasured'}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {param.interpretation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues & Recommendations */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {analysisResult.potential_issues?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Identified Nutrient Deficiencies & Imbalances</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {analysisResult.potential_issues.map((issue, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Agronomic Soil Management Recommendations</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
