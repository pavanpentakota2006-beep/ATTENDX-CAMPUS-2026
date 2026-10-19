import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useCampusClock } from '../../hooks/useCampusClock';
import { StatCard } from '../common/StatCard';
import { 
  Play, Square, RefreshCw, Users, CheckCircle, XCircle, 
  Clock, ShieldAlert, Sparkles, Check, X, QrCode
} from 'lucide-react';

interface FacultyDashboardProps {
  user: UserProfile;
}

interface StudentRosterItem {
  id: number;
  rollNo: string;
  name: string;
  scannedAt: string | null;
  status: 'PRESENT' | 'ABSENT' | 'FLAGGED';
  mode: string;
  distance: string;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user }) => {
  const clock = useCampusClock();
  const [sessionActive, setSessionActive] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('CS401 - Applied Machine Learning (LH-301)');
  const [qrToken, setQrToken] = useState('AX-2026-TOKEN-HMAC-89A12B');
  const [countdown, setCountdown] = useState(20);

  // Sample classroom roster
  const [roster, setRoster] = useState<StudentRosterItem[]>([
    { id: 1, rollNo: '22CS045', name: 'Rahul Sharma', scannedAt: '09:03:12 AM', status: 'PRESENT', mode: 'Dynamic QR', distance: '8.4m' },
    { id: 2, rollNo: '22CS089', name: 'Priya Patel', scannedAt: '09:04:02 AM', status: 'PRESENT', mode: 'Dynamic QR', distance: '11.2m' },
    { id: 3, rollNo: '22CS112', name: 'Amit Kumar', scannedAt: '09:04:18 AM', status: 'FLAGGED', mode: 'AI Proxy Rejected', distance: '185.0m' },
    { id: 4, rollNo: '22CS145', name: 'Sneha Reddy', scannedAt: '09:05:44 AM', status: 'PRESENT', mode: 'Dynamic QR', distance: '6.1m' },
    { id: 5, rollNo: '22CS155', name: 'Vikram Joshi', scannedAt: null, status: 'ABSENT', mode: 'Unregistered', distance: '—' },
    { id: 6, rollNo: '22CS188', name: 'Ankit Gupta', scannedAt: '09:07:11 AM', status: 'PRESENT', mode: 'Dynamic QR', distance: '14.0m' },
    { id: 7, rollNo: '22CS192', name: 'Megha Iyer', scannedAt: '09:08:00 AM', status: 'PRESENT', mode: 'Dynamic QR', distance: '5.8m' },
  ]);

  // Attendance correction requests
  const [disputes, setDisputes] = useState([
    { id: 1, student: 'Vikram Joshi (22CS155)', subject: 'CS401', reason: 'Phone camera lens damaged; physically present in 2nd row LH-301', status: 'PENDING' },
    { id: 2, student: 'Amit Kumar (22CS112)', subject: 'CS401', reason: 'Flagged for geo-distance anomaly due to hostel Wi-Fi jump', status: 'PENDING' }
  ]);

  // Auto-rotating QR token every 20 seconds
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Generate new token
          const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
          setQrToken(`AX-2026-ROT-${Date.now().toString().slice(-4)}-${randomSuffix}`);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const toggleStudentStatus = (id: number) => {
    setRoster(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
        return {
          ...s,
          status: nextStatus,
          scannedAt: nextStatus === 'PRESENT' ? clock.timeString : null,
          mode: nextStatus === 'PRESENT' ? 'Manual Faculty Override' : 'Absent'
        };
      }
      return s;
    }));
  };

  const handleDisputeAction = (id: number, approved: boolean) => {
    setDisputes(prev => prev.filter(d => d.id !== id));
    if (approved) {
      alert(`Correction Approved: Attendance granted.`);
    }
  };

  const presentCount = roster.filter(s => s.status === 'PRESENT').length;
  const attendanceRate = Math.round((presentCount / roster.length) * 100);

  return (
    <div className="space-y-8">
      {/* Faculty Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Faculty Control Center • {user.fullName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {user.employeeCode}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department of Computer Science & Engineering • Associate Professor
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {sessionActive ? (
            <button
              onClick={() => setSessionActive(false)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Conclude Session</span>
            </button>
          ) : (
            <button
              onClick={() => { setSessionActive(true); setCountdown(20); }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Lecture Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Session Status"
          value={sessionActive ? "RECORDING" : "IDLE"}
          subtitle={selectedSlot}
          icon={Clock}
          trend={sessionActive ? "Expiring QR Active (20s)" : "Paused"}
          trendColor={sessionActive ? "text-emerald-400" : "text-slate-400"}
          badge="Live Classroom"
        />
        <StatCard
          title="Class Attendance"
          value={`${attendanceRate}%`}
          subtitle={`${presentCount} / ${roster.length} Enrolled Present`}
          icon={Users}
          trend="+3 Scans in last min"
          badge="Section 6-A"
        />
        <StatCard
          title="AI Anomaly Interceptions"
          value={roster.filter(s => s.status === 'FLAGGED').length}
          subtitle="Proxy attempts blocked by Isolation Forest"
          icon={ShieldAlert}
          trendColor="text-rose-400"
          badge="CampusShield AI"
          gradient="from-rose-950/30 to-slate-900"
        />
        <StatCard
          title="Pending Disputes"
          value={disputes.length}
          subtitle="Student correction appeals awaiting review"
          icon={Sparkles}
          badge="Action Required"
        />
      </div>

      {/* Dynamic Expiring QR Section & Live Attendance Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic QR Display (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-center">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="text-left">
              <h3 className="font-bold text-white text-base">Dynamic Expiring QR</h3>
              <p className="text-xs text-slate-400 font-medium">Re-generates with cryptographic nonce</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              TTL: 20s
            </span>
          </div>

          {sessionActive ? (
            <div className="space-y-4">
              {/* QR Box with animated scanning laser */}
              <div className="relative mx-auto w-64 h-64 p-4 rounded-3xl bg-white flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                {/* Simulated high-density QR representation */}
                <div className="w-full h-full bg-slate-950 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between">
                    <div className="w-12 h-12 border-4 border-cyan-400 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-slate-950 rounded-sm"></div>
                    </div>
                    <div className="w-12 h-12 border-4 border-cyan-400 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-slate-950 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="my-auto text-center space-y-1">
                    <QrCode className="w-16 h-16 text-indigo-400 mx-auto animate-pulse" />
                    <span className="text-[10px] font-mono text-cyan-300 font-bold block truncate px-2">
                      {qrToken}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-12 h-12 border-4 border-cyan-400 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-slate-950 rounded-sm"></div>
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono text-right">
                      ATTENDX<br/>CAMPUS-26
                    </div>
                  </div>

                  {/* Laser scan line */}
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-bounce top-1/2"></div>
                </div>
              </div>

              {/* Countdown timer & progress bar */}
              <div className="space-y-1.5 max-w-xs mx-auto">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${countdown <= 3 ? 'animate-spin' : ''}`} />
                    <span>Auto-refreshing in:</span>
                  </span>
                  <span className={countdown <= 5 ? 'text-rose-400 text-sm' : 'text-cyan-400 text-sm'}>
                    {countdown}s
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Classroom Geo-Fence: <strong className="text-slate-200">LH-301 (Radius: 30m)</strong>. Scans outside this perimeter will be flagged.
              </p>
            </div>
          ) : (
            <div className="py-12 text-slate-400 space-y-3">
              <Square className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">Attendance session is currently closed.</p>
              <p className="text-xs">Click "Launch Live Lecture Session" above to project the expiring QR code for student check-in.</p>
            </div>
          )}
        </div>

        {/* Live Student Check-in Roster Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Classroom Attendance Roster</h3>
              <p className="text-xs text-slate-400 font-medium">Click status pill for instant manual override</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              {presentCount} Present
            </span>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Scan Time</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Status / Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {roster.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">{s.rollNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{s.scannedAt || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{s.distance}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggleStudentStatus(s.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                          s.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                            : s.status === 'FLAGGED'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to toggle Present/Absent"
                      >
                        {s.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Attendance Dispute Resolution Drawer */}
      {disputes.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Pending Attendance Correction Disputes</h3>
              <p className="text-xs text-slate-400 font-medium">Review and resolve student disputes with one click</p>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold border border-amber-500/30">
              {disputes.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {disputes.map(d => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{d.student}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono font-bold">
                      {d.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Reason: <span className="italic text-slate-400">"{d.reason}"</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDisputeAction(d.id, true)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleDisputeAction(d.id, false)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
