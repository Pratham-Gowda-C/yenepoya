import React from 'react';
import { FlaskConical, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SoilHealthCard = ({ soilRecord, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse h-64" />
    );
  }

  const hasData = Boolean(soilRecord);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Soil Health Index</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {hasData ? `Tested: ${soilRecord.test_date || 'Recent'}` : 'No test on record'}
              </span>
            </div>
          </div>
          <Link
            to="/soil-analysis"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1"
          >
            <span>Analyze</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {hasData ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Soil pH Reaction</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {soilRecord.ph ?? '--'}{' '}
                <span className="text-[11px] font-semibold text-emerald-600">
                  {soilRecord.ph >= 6.0 && soilRecord.ph <= 7.5 ? '(Optimal)' : '(Adjust)'}
                </span>
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Nitrogen (N)</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {soilRecord.nitrogen ?? '--'} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Phosphorus (P)</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {soilRecord.phosphorus ?? '--'} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Potassium (K)</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {soilRecord.potassium ?? '--'} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl text-center mb-4">
            <p className="text-xs text-slate-500 font-medium">
              No soil test data recorded yet. Enter your soil test values to receive automated nutrient deficiency insights.
            </p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100">
        <Link
          to="/soil-analysis"
          className="w-full text-center py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition block"
        >
          {hasData ? 'Run AI Soil Health Diagnostics' : 'Record First Soil Test'}
        </Link>
      </div>
    </div>
  );
};
