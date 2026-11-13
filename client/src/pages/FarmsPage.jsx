import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Droplets, Mountain, ArrowRight, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const FarmsPage = () => {
  const queryClient = useQueryClient();

  const { data: plots, isLoading, error } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const res = await api.getPlots();
      return res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deletePlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['plots']);
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete plot "${name}"? All associated soil records will also be removed.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Retrieving farm plots..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">My Farm Plots</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage your agricultural holdings, soil types, and irrigation infrastructures
            </p>
          </div>
        </div>

        <Link
          to="/farms/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plot</span>
        </Link>
      </div>

      {plots.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No farm plots registered yet"
          description="Register your first plot with soil type and irrigation details to enable hyper-targeted AI recommendations."
          action={
            <Link
              to="/farms/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Plot</span>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => (
            <div
              key={plot.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                      {plot.plot_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {plot.location || 'Location unassigned'}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl border border-emerald-100">
                    {plot.area} {plot.area_unit || 'acres'}
                  </span>
                </div>

                <div className="space-y-2.5 my-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Mountain className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-slate-400 font-medium">Soil Type:</span>
                    <span className="font-bold text-slate-700">{plot.soil_type || 'Unspecified'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-slate-400 font-medium">Irrigation:</span>
                    <span className="font-bold text-slate-700">{plot.irrigation_source || 'Rainfed'}</span>
                  </div>
                  {plot.latitude && plot.longitude && (
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{plot.latitude.toFixed(4)}° N, {plot.longitude.toFixed(4)}° E</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(plot.id, plot.plot_name)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Delete plot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/farms/${plot.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <span>Plot Details & Soil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
