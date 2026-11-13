import React from 'react';
import { Sprout, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecommendationCard = ({ recommendation, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse h-64" />
    );
  }

  const recList = recommendation?.recommendations || [];
  const topCrops = recList.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Top Crop Recommendations</h3>
            <span className="text-[11px] text-slate-400 font-medium">AI Suitability Scores</span>
          </div>
        </div>
        <Link
          to="/crop-recommendations"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {topCrops.length > 0 ? (
        <div className="space-y-3">
          {topCrops.map((c, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between transition"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-800 text-sm">{c.crop_name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {c.season || 'Kharif'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                  {c.suitability_explanation}
                </p>
              </div>
              <div className="text-right pl-3 shrink-0">
                <div className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                  {c.suitability_score}%
                </div>
                <span className="block text-[10px] text-slate-400 mt-0.5">Suitability</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-slate-50 rounded-xl text-center">
          <p className="text-xs text-slate-500 font-medium mb-3">
            No crop recommendations generated yet. Run the recommendation engine to discover high-yielding crops tailored to your soil & climate.
          </p>
          <Link
            to="/crop-recommendations"
            className="inline-block py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Generate Recommendations
          </Link>
        </div>
      )}
    </div>
  );
};
