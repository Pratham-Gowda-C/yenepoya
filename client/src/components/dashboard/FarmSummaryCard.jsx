import React from 'react';
import { MapPin, Layers, Trees, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FarmSummaryCard = ({ plots = [], loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse h-64" />
    );
  }

  const totalArea = plots.reduce((acc, p) => acc + (Number(p.area) || 0), 0);
  const soilTypes = Array.from(new Set(plots.map((p) => p.soil_type).filter(Boolean)));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Farm Holdings Overview</h3>
              <span className="text-[11px] text-slate-400 font-medium">Registered Plots</span>
            </div>
          </div>
          <Link
            to="/farms"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Total Plots</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{plots.length}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Total Cultivated Area</span>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {totalArea.toFixed(1)} <span className="text-xs font-normal text-slate-500">acres</span>
            </p>
          </div>
        </div>

        {soilTypes.length > 0 && (
          <div className="mb-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
              Identified Soil Types
            </span>
            <div className="flex flex-wrap gap-1.5">
              {soilTypes.map((st) => (
                <span
                  key={st}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3">
        <Link
          to="/farms/new"
          className="w-full text-center py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition block"
        >
          + Add New Farm Plot
        </Link>
      </div>
    </div>
  );
};
