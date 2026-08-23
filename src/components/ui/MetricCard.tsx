import React from 'react';
import { clsx } from 'clsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color?: 'sky' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  sky: 'text-sky-400 bg-sky-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  rose: 'text-rose-400 bg-rose-500/10',
};

export function MetricCard({ label, value, sub, icon, trend, color = 'sky' }: MetricCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6 flex items-start gap-4">
      {icon && (
        <div className={clsx('p-3 rounded-xl', colorMap[color])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-1 font-mono tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        {trend && (
          <p className={clsx('text-xs mt-1 font-medium', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}