import React, { useState } from 'react';
import { SAMPLE_TIMETABLE } from '../../hooks/useTimetable';
import { useCampusClock } from '../../hooks/useCampusClock';
import { Calendar, Clock, MapPin, User, CheckCircle } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const clock = useCampusClock();
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const [selectedDay, setSelectedDay] = useState(
    days.includes(clock.dayOfWeek) ? clock.dayOfWeek : 'MONDAY'
  );

  const slots = SAMPLE_TIMETABLE[selectedDay] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Master Academic Timetable • Semester 6 (CSE)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard Instructional Timetable with Automatic Substitute Day & Period Synchronization
          </p>
        </div>

        {/* Day selector tabs */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {days.map(d => {
            const isToday = clock.dayOfWeek === d;
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{d.slice(0, 3)}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map(slot => {
          const isLiveNow = clock.dayOfWeek === selectedDay && clock.currentPeriod === slot.periodNumber;
          return (
            <div 
              key={slot.id}
              className={`p-5 rounded-2xl border transition-all ${
                isLiveNow 
                  ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot.startTime} - {slot.endTime}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Period {slot.periodNumber}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-400">{slot.subjectCode}</span>
                <h4 className="text-base font-bold text-white leading-snug">{slot.subjectName}</h4>

                <div className="space-y-1 text-xs text-slate-400 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{slot.facultyName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Room: <strong className="text-slate-200">{slot.roomNumber}</strong> (Section {slot.section})</span>
                  </div>
                </div>
              </div>

              {isLiveNow && (
                <div className="mt-4 pt-3 border-t border-indigo-500/30 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Classroom Session Active</span>
                  </span>
                  <span>{clock.minutesRemainingInPeriod}m remaining</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
