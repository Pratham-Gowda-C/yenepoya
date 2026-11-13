import React from 'react';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { Link, useNavigate } from 'react-router-dom';

export const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left section: mobile hamburger & breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Smart Crop Advisory
          </span>
          <h1 className="text-base font-bold text-slate-800">
            {t('welcome_farmer')} <span className="text-emerald-700">{displayName}</span>
          </h1>
        </div>
      </div>

      {/* Right section: language selector, notifications, user profile pill, logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Multilingual Selector */}
        <LanguageSelector />

        {/* User Profile Pill */}
        <Link
          to="/profile"
          className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
            {displayName.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden md:inline-block max-w-[120px] truncate">
            {displayName}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={t('logout')}
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
