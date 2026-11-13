import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Settings,
  Globe,
  Lock,
  Server,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { LANGUAGES } from '../utils/translations';

export const SettingsPage = () => {
  const { user, resetPassword } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [passwordEmailSent, setPasswordEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch backend health status
  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await api.getHealth();
      return res.data;
    },
  });

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await resetPassword(user.email);
      setPasswordEmailSent(true);
      setTimeout(() => setPasswordEmailSent(false), 5000);
    } catch (err) {
      alert(err.message || 'Failed to send password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local application cache and reload?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Application Settings & Preferences</h2>
          <p className="text-xs text-slate-500 font-medium">
            Configure system language, security, and agricultural advisory preferences
          </p>
        </div>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-800 text-base">Advisory Language Selection</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Select your native language. All UI elements, AI agronomic summaries, and Kisan assistant messages will adapt to your choice.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                language === l.code
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-bold text-sm block">{l.native}</span>
              <span className="text-[11px] text-slate-400 font-medium">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Account Security Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-amber-600" />
          <h3 className="font-extrabold text-slate-800 text-base">Account Security & Credentials</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Signed in as</span>
            <span className="text-sm font-semibold text-slate-900">{user?.email || 'farmer@agripulse.ai'}</span>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition self-start sm:self-auto"
          >
            {resetLoading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </div>

        {passwordEmailSent && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Password reset instructions have been dispatched to your email.</span>
          </div>
        )}
      </div>

      {/* System Architecture & Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Server className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-slate-800 text-base">Engine Diagnostics & Integrations</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 font-semibold block">PostgreSQL / Supabase</span>
            <span className="font-bold text-slate-800 mt-1 block">
              {healthData?.integrations?.supabase || 'Active'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 font-semibold block">Google Gemini AI</span>
            <span className="font-bold text-slate-800 mt-1 block">
              {healthData?.integrations?.gemini || 'Configured'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 font-semibold block">Agronomic Weather</span>
            <span className="font-bold text-slate-800 mt-1 block">
              {healthData?.integrations?.weather || 'Open-Meteo'}
            </span>
          </div>
        </div>

        <div className="pt-3 flex justify-between items-center border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            AgriPulse AI v1.0.0 (Production Release)
          </span>
          <button
            type="button"
            onClick={handleClearCache}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local App Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
};
