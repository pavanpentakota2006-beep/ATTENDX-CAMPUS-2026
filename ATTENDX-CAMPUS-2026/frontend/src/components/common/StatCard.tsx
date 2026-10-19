import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: string;
  trendColor?: string;
  badge?: string;
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendColor = 'text-emerald-400',
  badge,
  gradient = 'from-slate-900 to-slate-900/80'
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-slate-800 p-5 shadow-lg transition-all hover:border-slate-700/80`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-400 shadow-inner">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {trend && (
            <span className={`font-semibold ${trendColor}`}>
              {trend}
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
