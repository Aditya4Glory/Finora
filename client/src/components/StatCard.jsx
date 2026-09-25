import React from 'react';
import { formatCurrency } from '../utils/formatters';

const StatCard = ({
  title,
  amount,
  isCurrency = true,
  icon: Icon,
  trend,
  colorScheme = 'emerald', // 'emerald', 'rose', 'blue', 'slate'
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      iconBg: 'bg-rose-100 text-rose-600',
      border: 'border-rose-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100 text-blue-600',
      border: 'border-blue-100',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      iconBg: 'bg-slate-100 text-slate-600',
      border: 'border-slate-200',
    },
  };

  const scheme = colorStyles[colorScheme] || colorStyles.slate;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          {isCurrency ? formatCurrency(amount) : Number(amount || 0).toLocaleString()}
        </div>
      </div>

      {trend && (
        <div className="mt-3 text-xs text-slate-400 font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatCard;
