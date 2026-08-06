import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatUsd, formatVes } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  usdAmount: number;
  vesAmount?: number;
  icon: LucideIcon;
  colorScheme: 'emerald' | 'amber' | 'rose' | 'blue';
  subtitle?: string;
  progressPercent?: number;
}

export function KpiCard({
  title,
  usdAmount,
  vesAmount,
  icon: Icon,
  colorScheme,
  subtitle,
  progressPercent,
}: KpiCardProps) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-800/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-white',
      vesColor: 'text-emerald-400',
    },
    amber: {
      border: 'border-emerald-800/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      valueColor: 'text-amber-400',
      vesColor: 'text-slate-400',
    },
    rose: {
      border: 'border-emerald-800/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      valueColor: 'text-rose-400',
      vesColor: 'text-slate-400',
    },
    blue: {
      border: 'border-emerald-800/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      valueColor: 'text-gradient-emerald',
      vesColor: 'text-slate-400',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div className={`bg-slate-900/90 border ${scheme.border} rounded-2xl p-5 shadow-xl glass-card-hover relative overflow-hidden`}>
      <div className="flex items-center justify-between text-slate-400 mb-3">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-400">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${scheme.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={`text-2xl font-black ${scheme.valueColor}`}>
        {progressPercent !== undefined ? `${progressPercent}%` : formatUsd(usdAmount)}
      </div>
      {vesAmount !== undefined && (
        <div className={`text-xs font-bold ${scheme.vesColor} mt-1`}>
          Eqv: {formatVes(vesAmount)}
        </div>
      )}
      {subtitle && <div className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</div>}

      {progressPercent !== undefined && (
        <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
