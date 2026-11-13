import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LayoutDashboard,
  MapPin,
  FlaskConical,
  Sprout,
  Bug,
  Droplets,
  CloudSun,
  BotMessageSquare,
  History,
  User,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('farms'), href: '/farms', icon: MapPin },
    { name: t('soil_analysis'), href: '/soil-analysis', icon: FlaskConical },
    { name: t('crop_recommendations'), href: '/crop-recommendations', icon: Sprout, highlight: true },
    { name: t('disease_detection'), href: '/disease-detection', icon: Bug },
    { name: t('fertilizer_advisory'), href: '/fertilizer-advisory', icon: Droplets },
    { name: t('weather'), href: '/weather', icon: CloudSun },
    { name: t('ai_assistant'), href: '/ai-assistant', icon: BotMessageSquare, badge: 'AI' },
    { name: t('history'), href: '/history', icon: History },
    { name: t('profile'), href: '/profile', icon: User },
    { name: t('settings'), href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <NavLink to="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">AgriPulse</span>
              <span className="text-emerald-600 text-xs font-bold uppercase ml-1 px-1.5 py-0.5 bg-emerald-50 rounded-md border border-emerald-200">
                AI
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-emerald-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Pro / Help Box */}
        <div className="p-4 m-3 bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kisan Assistant</span>
          </div>
          <p className="text-xs text-emerald-100 font-medium mb-3">
            Get instant crop and pest diagnosis in your local language.
          </p>
          <NavLink
            to="/ai-assistant"
            className="inline-block text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            Chat with AI
          </NavLink>
        </div>
      </aside>
    </>
  );
};
