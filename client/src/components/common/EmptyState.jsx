import React from 'react';
import { Sprout } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No records found',
  description = 'Get started by adding your first record.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
