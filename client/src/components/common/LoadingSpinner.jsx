import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading agricultural data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 text-slate-500">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-emerald-600`} />
      {text && <p className="text-sm font-medium tracking-wide animate-pulse">{text}</p>}
    </div>
  );
};
