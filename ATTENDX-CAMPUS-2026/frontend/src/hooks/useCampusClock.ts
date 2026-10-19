import { useState, useEffect } from 'react';

export interface CampusClockState {
  currentTime: Date;
  timeString: string;       // "10:15:32 AM"
  dateString: string;       // "Monday, 19 October 2026"
  dayOfWeek: string;        // "MONDAY"
  currentPeriod: number | null; // 1, 2, 3, etc. or null
  periodLabel: string;      // "Period 2: 10:00 - 10:55" or "Lunch Break" or "Campus Closed"
  periodProgressPct: number;// 0 - 100%
  minutesRemainingInPeriod: number;
  isInstructionalHours: boolean;
  isDateRollover: boolean;
}

// College schedule definition for IST periods
export const CAMPUS_PERIODS = [
  { period: 1, start: '09:00', end: '09:55', label: 'Period 1 (09:00 - 09:55)' },
  { period: 2, start: '10:00', end: '10:55', label: 'Period 2 (10:00 - 10:55)' },
  { period: 3, start: '11:15', end: '12:10', label: 'Period 3 (11:15 - 12:10)' },
  { period: 4, start: '13:00', end: '13:55', label: 'Period 4 (13:00 - 13:55)' },
  { period: 5, start: '14:00', end: '14:55', label: 'Period 5 (14:00 - 14:55)' },
  { period: 6, start: '15:00', end: '16:00', label: 'Period 6 / Lab (15:00 - 16:00)' },
];

export function useCampusClock(): CampusClockState {
  const [clock, setClock] = useState<CampusClockState>(() => computeClockState(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(computeClockState(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return clock;
}

function computeClockState(now: Date): CampusClockState {
  // Use IST timezone representation
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const dayOfWeek = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long'
  }).format(now).toUpperCase();

  const timeString = istFormatter.format(now);
  const dateString = dateFormatter.format(now);

  // Minutes since midnight
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const currentTotalMinutes = hours * 60 + minutes + (seconds / 60);

  let currentPeriod: number | null = null;
  let periodLabel = 'Campus Outside Instructional Hours';
  let periodProgressPct = 0;
  let minutesRemainingInPeriod = 0;
  let isInstructional = false;

  for (const p of CAMPUS_PERIODS) {
    const [sH, sM] = p.start.split(':').map(Number);
    const [eH, eM] = p.end.split(':').map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    if (currentTotalMinutes >= startMins && currentTotalMinutes <= endMins) {
      currentPeriod = p.period;
      periodLabel = `Active: ${p.label}`;
      const elapsed = currentTotalMinutes - startMins;
      const totalDuration = endMins - startMins;
      periodProgressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      minutesRemainingInPeriod = Math.max(0, Math.round(endMins - currentTotalMinutes));
      isInstructional = true;
      break;
    }
  }

  // Intermissions
  if (!currentPeriod) {
    if (currentTotalMinutes >= 9 * 60 && currentTotalMinutes < 16 * 60) {
      if (currentTotalMinutes >= 12 * 60 + 10 && currentTotalMinutes < 13 * 60) {
        periodLabel = 'Lunch & Refreshment Interval (12:10 - 13:00)';
      } else {
        periodLabel = 'Session Transition Break';
      }
      isInstructional = true;
    }
  }

  return {
    currentTime: now,
    timeString,
    dateString,
    dayOfWeek,
    currentPeriod,
    periodLabel,
    periodProgressPct,
    minutesRemainingInPeriod,
    isInstructionalHours: isInstructional,
    isDateRollover: hours === 0 && minutes === 0 && seconds <= 5
  };
}
