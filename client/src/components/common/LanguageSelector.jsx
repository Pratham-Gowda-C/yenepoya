import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({ compact = false }) => {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={`bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition cursor-pointer font-medium ${
          compact ? 'text-xs py-1' : ''
        }`}
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native} ({l.name})
          </option>
        ))}
      </select>
    </div>
  );
};
