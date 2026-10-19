import React from 'react';
import { useCampusClock } from '../../hooks/useCampusClock';
import { Clock, Calendar, Zap, Sparkles, AlertCircle } from 'lucide-react';

export const CampusClockWidget: React.FC = () => {
  const clock = useCampusClock();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
      {/* Background glow orb */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Clock Left */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Live Campus Clock • India Standard Time (IST)
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {clock.timeString}
            </h1>
            <span className="text-sm font-semibold text-slate-400">UTC+05:30</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-300 font-medium">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{clock.dateString}</span>
          </div>
        </div>

        {/* Current Period Status Right */}
        <div className="w-full md:w-80 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Timetable Status
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              clock.currentPeriod 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-slate-800 text-slate-300'
            }`}>
              {clock.currentPeriod ? 'Lecture Active' : 'Break / Off'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{clock.periodLabel}</span>
          </div>

          {clock.currentPeriod && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Progress ({clock.periodProgressPct}%)</span>
                <span>{clock.minutesRemainingInPeriod} mins remaining</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${clock.periodProgressPct}%` }}
                ></div>
              </div>
            </div>
          )}

          {!clock.currentPeriod && (
            <p className="text-xs text-slate-400 mt-2">
              Next scheduled weekday lectures will reload automatically at 09:00 AM IST.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
