import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  CloudSun,
  FlaskConical,
  Bug,
  Droplets,
  Languages,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 text-slate-800">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-slate-900 text-xl tracking-tight">AgriPulse AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector compact />
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Next-Gen Agricultural Intelligence for Indian Farmers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Smarter Crops. Healthier Soils.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
            Higher Farm Yields.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          AgriPulse AI unifies soil parameters, hyper-local weather, ICAR agronomic benchmarks, and Google Gemini AI to provide actionable farming advisories in 8 Indian languages.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-2"
          >
            <span>Start Advisory Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition"
          >
            Explore Dashboard Demo
          </Link>
        </div>
      </section>

      {/* Key Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Comprehensive Decision Support for Every Stage
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            From pre-sowing crop selection to post-harvest soil enrichment, AgriPulse AI guides your agronomic decisions with scientific rigor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Crop Recommendations</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Scientific crop matching taking into account soil NPK, pH, available irrigation, season, and real-time weather forecasts.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ICAR-benchmarked suitability scores (0-100)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Water requirement & duration estimates</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <Bug className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Multimodal Disease Diagnosis</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Upload leaf or crop photographs. Gemini Vision inspects symptoms, checks image quality, and identifies pathogens safely.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Integrated Pest Management (IPM) guidelines</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Proactive organic & safe management steps</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">4R Fertilizer Advisory</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Calibrated nutrient management plans based on crop growth stages, soil test deficiencies, and verified agronomic dosages.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Right Source, Rate, Time, and Placement</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Prevents expensive nutrient over-application</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Multilingual Support Banner */}
      <section className="bg-emerald-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-3 bg-emerald-800/60 rounded-2xl text-emerald-300 mb-4">
            <Languages className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Available in 8 Indian Languages
          </h2>
          <p className="text-emerald-200/90 max-w-xl mx-auto text-sm mb-6">
            Designed for Bharat. Experience the full advisory and conversational AI in English, हिन्दी, ಕನ್ನಡ, తెలుగు, தமிழ், മലയാളം, मराठी, and বাংলা.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['English', 'हिन्दी (Hindi)', 'ಕನ್ನಡ (Kannada)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'മലയാളം (Malayalam)', 'मराठी (Marathi)', 'বাংলা (Bengali)'].map((l) => (
              <span key={l} className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold backdrop-blur-xs">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-slate-400">
        <p>&copy; 2026 AgriPulse AI. Built with precision for sustainable Indian agriculture.</p>
      </footer>
    </div>
  );
};
