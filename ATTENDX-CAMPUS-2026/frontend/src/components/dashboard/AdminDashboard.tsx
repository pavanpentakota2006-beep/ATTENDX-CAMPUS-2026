import React, { useState } from 'react';
import { UserProfile, CalendarEvent, AiAnomalyItem } from '../../types';
import { StatCard } from '../common/StatCard';
import { mockAnomalies } from '../../services/api';
import { 
  Shield, Calendar, Users, AlertOctagon, CheckCircle2, 
  Plus, Sparkles, Server, Clock, Database, Check
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserProfile;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [anomalies, setAnomalies] = useState<AiAnomalyItem[]>(mockAnomalies);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 1, date: '2026-10-19', title: 'Normal Academic Day', type: 'REGULAR', description: 'Standard instructional schedule' },
    { id: 2, date: '2026-10-24', title: 'Compensatory Working Saturday', type: 'SUBSTITUTE_WORKING_DAY', appliesToWeekday: 'TUESDAY', description: 'Compensatory instructional day (Follows Tuesday Schedule)' },
    { id: 3, date: '2026-11-01', title: 'State Formation Day', type: 'HOLIDAY', description: 'Campus closed' },
    { id: 4, date: '2026-11-15', title: 'Mid-Term Examinations Phase II', type: 'EXAMINATION', description: 'Autonomous evaluations' }
  ]);

  const [newDate, setNewDate] = useState('2026-10-31');
  const [newTitle, setNewTitle] = useState('Special Working Saturday (Follows Friday Timetable)');
  const [newType, setNewType] = useState<'SUBSTITUTE_WORKING_DAY' | 'HOLIDAY' | 'EXAMINATION'>('SUBSTITUTE_WORKING_DAY');
  const [newAppliesTo, setNewAppliesTo] = useState('FRIDAY');

  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: CalendarEvent = {
      id: Date.now(),
      date: newDate,
      title: newTitle,
      type: newType,
      appliesToWeekday: newType === 'SUBSTITUTE_WORKING_DAY' ? newAppliesTo : undefined,
      description: 'Campus admin calendar adjustment'
    };
    setCalendarEvents(prev => [...prev, event]);
    alert(`Calendar entry created: ${newTitle}`);
  };

  const handleResolveAnomaly = (id: number) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const unresolvedCount = anomalies.filter(a => !a.resolved).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Campus System Administrator • {user.fullName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Super Admin
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Core Academic Operations, Timetable Governance, and AI Fraud Mitigation
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>All Microservices Operational</span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campus Enrollment"
          value="1,450"
          subtitle="4 Departments • 24 Sections"
          icon={Users}
          badge="Live Roster"
        />
        <StatCard
          title="Concurrent Active Sessions"
          value="14"
          subtitle="Lectures & Labs in progress"
          icon={Clock}
          badge="IST Real-Time"
          trend="8 Smart Rooms Active"
        />
        <StatCard
          title="AI Anomaly Incidents"
          value={unresolvedCount}
          subtitle="Flagged by Isolation Forest"
          icon={AlertOctagon}
          trendColor="text-rose-400"
          badge="Fraud Prevention"
          gradient="from-rose-950/30 to-slate-900"
        />
        <StatCard
          title="Server & Database Health"
          value="99.98%"
          subtitle="Spring Boot + MySQL + FastAPI"
          icon={Server}
          badge="Cluster OK"
          gradient="from-indigo-950/40 to-slate-900"
        />
      </div>

      {/* Academic Calendar Manager */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Academic Calendar & Substitute Day Engine</h3>
            <p className="text-xs text-slate-400 font-medium">
              Manages holidays, examination windows, and compensatory working Saturdays
            </p>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg font-bold border border-indigo-500/30">
            {calendarEvents.length} Events Scheduled
          </span>
        </div>

        {/* Existing Calendar Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calendarEvents.map(ev => (
            <div key={ev.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">{ev.date}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{ev.title}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ev.type === 'HOLIDAY' 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : ev.type === 'SUBSTITUTE_WORKING_DAY'
                    ? 'bg-amber-500/20 text-amber-300'
                    : ev.type === 'EXAMINATION'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {ev.type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">{ev.description}</p>
              {ev.appliesToWeekday && (
                <div className="pt-1 text-[11px] text-amber-300 font-semibold">
                  ⚡ Automatic schedule override: Loads {ev.appliesToWeekday} Timetable
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Calendar Entry Form */}
        <form onSubmit={handleAddCalendarEvent} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Calendar Exception / Working Saturday</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Calendar Date</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Day Category</label>
              <select 
                value={newType} 
                onChange={e => setNewType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="SUBSTITUTE_WORKING_DAY">Substitute Working Saturday</option>
                <option value="HOLIDAY">Official Campus Holiday</option>
                <option value="EXAMINATION">Examination Day</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Timetable To Follow</label>
              <select 
                value={newAppliesTo} 
                onChange={e => setNewAppliesTo(e.target.value)}
                disabled={newType !== 'SUBSTITUTE_WORKING_DAY'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-40"
              >
                <option value="MONDAY">Monday Timetable</option>
                <option value="TUESDAY">Tuesday Timetable</option>
                <option value="WEDNESDAY">Wednesday Timetable</option>
                <option value="THURSDAY">Thursday Timetable</option>
                <option value="FRIDAY">Friday Timetable</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md"
              >
                Schedule Calendar Override
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Anomaly Detection Real-Time Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">AI Security Feed: Proxy & Telemetry Anomaly Detections</h3>
            <p className="text-xs text-slate-400 font-medium">
              Flagged in real-time by scikit-learn Isolation Forest based on GPS geo-fence and latency deltas
            </p>
          </div>
          <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg font-bold border border-rose-500/30">
            {unresolvedCount} Active Alerts
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.map(a => (
            <div 
              key={a.id} 
              className={`p-4 rounded-xl border transition ${
                a.resolved 
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{a.studentName} ({a.rollNumber})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.verdict === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {a.verdict}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Anomaly Score: <strong className="text-rose-400">{a.anomalyScore}</strong>
                    </span>
                    <span className="text-xs text-slate-400">{a.timestamp}</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-0.5">
                    {a.flagReasons.map((reason, idx) => (
                      <p key={idx} className="text-rose-300/90 font-medium">• {reason}</p>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono pt-1">
                    <span>GPS Classroom Distance: <strong>{a.distanceMeters}m</strong></span>
                    <span>Scan Latency: <strong>{a.scanDelaySeconds}s</strong></span>
                  </div>
                </div>

                <div>
                  {a.resolved ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Resolved by Admin</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveAnomaly(a.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition"
                    >
                      Resolve Incident
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
