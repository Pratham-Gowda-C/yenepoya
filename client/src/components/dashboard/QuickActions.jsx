import React from 'react';
import { Sprout, Bug, Droplets, BotMessageSquare, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  const actions = [
    {
      title: 'Crop Advisory',
      subtitle: 'Personalized crop fit',
      href: '/crop-recommendations',
      icon: Sprout,
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      title: 'Diagnose Disease',
      subtitle: 'Upload leaf photo',
      href: '/disease-detection',
      icon: Bug,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Fertilizer Plan',
      subtitle: '4R nutrient dosages',
      href: '/fertilizer-advisory',
      icon: Droplets,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Kisan AI Chat',
      subtitle: 'Ask in local language',
      href: '/ai-assistant',
      icon: BotMessageSquare,
      gradient: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.href}
            to={act.href}
            className="group relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${act.gradient} flex items-center justify-center text-white shadow-md shadow-slate-200 group-hover:scale-105 transition-transform duration-200 shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{act.subtitle}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
