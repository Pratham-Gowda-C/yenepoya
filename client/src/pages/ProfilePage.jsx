import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Phone, MapPin, Award, Layers, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LANGUAGES } from '../utils/translations';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { setLanguage: setGlobalLanguage } = useLanguage();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    state: 'Karnataka',
    district: 'Mandya',
    village: '',
    preferred_language: 'en',
    farming_experience: 5,
    total_agricultural_land: 2,
    land_measurement_unit: 'acres',
    farming_type: 'conventional',
  });

  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.getProfile();
      return res.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || user?.user_metadata?.full_name || '',
        phone: profile.phone || '',
        state: profile.state || 'Karnataka',
        district: profile.district || 'Mandya',
        village: profile.village || '',
        preferred_language: profile.preferred_language || 'en',
        farming_experience: profile.farming_experience ?? 5,
        total_agricultural_land: profile.total_agricultural_land ?? 2,
        land_measurement_unit: profile.land_measurement_unit || 'acres',
        farming_type: profile.farming_type || 'conventional',
      });
    }
  }, [profile, user]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateProfile(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['profile']);
      setSuccessMsg('Profile information updated successfully!');
      setErrorMsg(null);
      if (formData.preferred_language) {
        setGlobalLanguage(formData.preferred_language);
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update profile');
      setSuccessMsg(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...formData,
      farming_experience: Number(formData.farming_experience),
      total_agricultural_land: Number(formData.total_agricultural_land),
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading farmer profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Farmer Profile Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Keep your farming experience, location, and soil context updated for precision AI advisory
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Personal & Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'farmer@agripulse.ai'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Advisory Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Geographic Location */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Farm Geographic Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Karnataka"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                District
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Mandya"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Village / Taluk
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Keregodu"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Agricultural Background */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Agricultural Background
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="80"
                value={formData.farming_experience}
                onChange={(e) => setFormData({ ...formData, farming_experience: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Land
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.total_agricultural_land}
                onChange={(e) => setFormData({ ...formData, total_agricultural_land: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Measurement Unit
              </label>
              <select
                value={formData.land_measurement_unit}
                onChange={(e) => setFormData({ ...formData, land_measurement_unit: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="bigha">Bigha</option>
                <option value="guntha">Guntha</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Farming Practice
              </label>
              <select
                value={formData.farming_type}
                onChange={(e) => setFormData({ ...formData, farming_type: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="conventional">Conventional</option>
                <option value="organic">Organic</option>
                <option value="natural">Natural Farming (ZBNF)</option>
                <option value="mixed">Mixed Farming</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-sm transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
