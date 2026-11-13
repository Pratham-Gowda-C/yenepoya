import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  History,
  Sprout,
  Bug,
  Droplets,
  FlaskConical,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('crop');

  // Fetch histories
  const { data: cropRecs, isLoading: cropLoading } = useQuery({
    queryKey: ['crop-recommendations-history'],
    queryFn: async () => {
      const res = await api.getCropRecommendations();
      return res.data || [];
    },
  });

  const { data: diseaseHistory, isLoading: diseaseLoading } = useQuery({
    queryKey: ['disease-history'],
    queryFn: async () => {
      const res = await api.getDiseaseHistory();
      return res.data || [];
    },
  });

  const { data: fertilizerHistory, isLoading: fertLoading } = useQuery({
    queryKey: ['fertilizer-history'],
    queryFn: async () => {
      const res = await api.getFertilizerHistory();
      return res.data || [];
    },
  });

  const tabs = [
    { id: 'crop', label: 'Crop Recommendations', icon: Sprout, count: cropRecs?.length || 0 },
    { id: 'disease', label: 'Disease Diagnoses', icon: Bug, count: diseaseHistory?.length || 0 },
    { id: 'fertilizer', label: 'Fertilizer Plans', icon: Droplets, count: fertilizerHistory?.length || 0 },
  ];

  const isLoading = cropLoading || diseaseLoading || fertLoading;

  if (isLoading) {
    return <LoadingSpinner text="Retrieving advisory history records..." size="lg" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Historical Advisory Archive</h2>
          <p className="text-xs text-slate-500 font-medium">
            Review past seasonal recommendations, disease reports, and fertilizer prescriptions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Crop Recommendations History */}
      {activeTab === 'crop' && (
        <div className="space-y-4">
          {(!cropRecs || cropRecs.length === 0) ? (
            <EmptyState
              icon={Sprout}
              title="No crop recommendations on record"
              description="Your previous crop evaluations will be securely archived here."
            />
          ) : (
            cropRecs.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Season: {rec.season || 'Kharif'}
                      </h4>
                      {rec.plots?.plot_name && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          Plot: {rec.plots.plot_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(rec.created_at).toLocaleString()}</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {rec.ai_model || 'Gemini-GenAI'}
                  </span>
                </div>

                {rec.source_metadata?.summary && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {rec.source_metadata.summary}
                  </p>
                )}

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Recommended Crops:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {rec.recommendations?.map((c, ci) => (
                      <div
                        key={ci}
                        className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">{c.crop_name}</span>
                          <span className="text-[10px] text-slate-400">Duration: {c.duration_days} days</span>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                          {c.suitability_score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Disease Diagnoses History */}
      {activeTab === 'disease' && (
        <div className="space-y-4">
          {(!diseaseHistory || diseaseHistory.length === 0) ? (
            <EmptyState
              icon={Bug}
              title="No disease diagnoses recorded"
              description="Upload crop leaf photographs to get started with instant pathogen identification."
            />
          ) : (
            diseaseHistory.map((d) => (
              <div
                key={d.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {d.crop_name} — {d.diagnosis?.possible_diagnoses?.[0]?.name || 'Pathology Report'}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(d.created_at).toLocaleString()}</span>
                    </span>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg uppercase tracking-wider">
                    {d.diagnosis?.possible_diagnoses?.[0]?.confidence || 'Medium'} Confidence
                  </span>
                </div>

                {d.image_path && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                    <img src={d.image_path} alt="Diagnosis specimen" className="w-full h-full object-cover" />
                  </div>
                )}

                {d.diagnosis?.possible_diagnoses?.[0]?.management_steps && (
                  <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-700 block">Recommended Action:</span>
                    <p className="text-slate-600">
                      {d.diagnosis.possible_diagnoses[0].management_steps[0]}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Fertilizer Plans History */}
      {activeTab === 'fertilizer' && (
        <div className="space-y-4">
          {(!fertilizerHistory || fertilizerHistory.length === 0) ? (
            <EmptyState
              icon={Droplets}
              title="No fertilizer plans generated yet"
              description="Calculate customized 4R nutrient doses for your plots."
            />
          ) : (
            fertilizerHistory.map((f) => (
              <div
                key={f.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {f.crop_name} ({f.growth_stage})
                    </h4>
                    <span className="text-xs text-slate-400 font-medium flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(f.created_at).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {f.fertilizer_data?.fertilizer_options?.map((opt, oi) => (
                    <div key={oi} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-800 block">{opt.name}</span>
                      <span className="text-blue-700 font-semibold mt-0.5 block">
                        Rate: {opt.verified_rate} {opt.rate_unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
