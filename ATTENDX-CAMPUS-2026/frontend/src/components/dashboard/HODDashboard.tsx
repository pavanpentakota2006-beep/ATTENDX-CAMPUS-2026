import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { StatCard } from '../common/StatCard';
import { mockLeaves } from '../../services/api';
import { 
  Users, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, 
  Send, Check, X, FileText, Sparkles, Building, CalendarCheck 
} from 'lucide-react';

interface HODDashboardProps {
  user: UserProfile;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({ user }) => {
  const [leaves, setLeaves] = useState(mockLeaves);
  const [warningSentStudent, setWarningSentStudent] = useState<string | null>(null);

  // At risk student roster for department
  const [atRiskStudents, setAtRiskStudents] = useState([
    { id: 1, rollNo: '22CS112', name: 'Amit Kumar', section: '6-A', currentPct: 62.4, shortageProb: 0.88, lecturesNeeded: 9, status: 'HIGH_RISK' },
    { id: 2, rollNo: '22CS155', name: 'Vikram Joshi', section: '6-A', currentPct: 69.1, shortageProb: 0.65, lecturesNeeded: 6, status: 'HIGH_RISK' },
    { id: 3, rollNo: '22CS204', name: 'Deepak Verma', section: '6-B', currentPct: 71.0, shortageProb: 0.45, lecturesNeeded: 4, status: 'MEDIUM_RISK' },
    { id: 4, rollNo: '22CS218', name: 'Ananya Deshmukh', section: '6-C', currentPct: 58.0, shortageProb: 0.94, lecturesNeeded: 12, status: 'CRITICAL' },
  ]);

  const handleLeaveAction = (id: number, status: 'APPROVED' | 'REJECTED') => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleSendWarning = (rollNo: string) => {
    setWarningSentStudent(rollNo);
    setTimeout(() => setWarningSentStudent(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* HOD Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Head of Department Dashboard • {user.fullName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              HOD - {user.departmentCode}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department of Computer Science & Engineering • Academic Monitoring & AI Intelligence
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
            Semester 6 • 380 Students Enrolled
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dept Attendance Rate"
          value="83.4%"
          subtitle="CSE Department Overall"
          icon={TrendingUp}
          trend="+1.2% this month"
          trendColor="text-emerald-400"
          badge="Healthy Average"
          gradient="from-purple-950/40 to-slate-900"
        />
        <StatCard
          title="At-Risk Students"
          value={atRiskStudents.length}
          subtitle="Predicted by AI to drop <75%"
          icon={AlertTriangle}
          trend="4 Immediate Action"
          trendColor="text-rose-400"
          badge="Shortage Radar"
          gradient="from-rose-950/30 to-slate-900"
        />
        <StatCard
          title="Faculty Class Conduction"
          value="97.2%"
          subtitle="142 of 146 classes conducted"
          icon={CalendarCheck}
          trend="4 Substitutions"
          badge="High Compliance"
        />
        <StatCard
          title="Pending Leave & OD Requests"
          value={leaves.filter(l => l.status === 'PENDING').length}
          subtitle="Awaiting HOD approval"
          icon={FileText}
          badge="Review Required"
        />
      </div>

      {/* Section Comparison Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Section-Wise Attendance Performance</h3>
            <p className="text-xs text-slate-400 font-medium">B.Tech CSE - 6th Semester</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Target: ≥80%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Section 6-A</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">85.2%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85.2%' }}></div>
            </div>
            <p className="text-[11px] text-slate-400">62 Students • 2 at shortage risk</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Section 6-B</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">81.8%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '81.8%' }}></div>
            </div>
            <p className="text-[11px] text-slate-400">60 Students • 5 at shortage risk</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Section 6-C</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">83.0%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '83.0%' }}></div>
            </div>
            <p className="text-[11px] text-slate-400">64 Students • 4 at shortage risk</p>
          </div>
        </div>
      </div>

      {/* AI At-Risk Student Radar Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">AI Early Warning: Students At Risk of Debarment</h3>
            <p className="text-xs text-slate-400 font-medium">
              Calculated by scikit-learn Random Forest model on attendance trajectories
            </p>
          </div>
          <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg font-bold border border-rose-500/30">
            {atRiskStudents.length} Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Current Attendance</th>
                <th className="py-3 px-4">AI Shortage Probability</th>
                <th className="py-3 px-4">Lectures Needed for 75%</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {atRiskStudents.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">{s.rollNo}</td>
                  <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-4">{s.section}</td>
                  <td className="py-3 px-4">
                    <span className="text-rose-400 font-bold font-mono text-sm">{s.currentPct}%</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                      {(s.shortageProb * 100).toFixed(0)}% Risk
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-300">
                    {s.lecturesNeeded} consecutive lectures
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSendWarning(s.rollNo)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                    >
                      {warningSentStudent === s.rollNo ? 'Warning Dispatched!' : 'Send Alert Notice'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Leave & On-Duty Approval Requests */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Department Leave & On-Duty (OD) Approvals</h3>
            <p className="text-xs text-slate-400 font-medium">Medical, sports, and technical hackathon leaves</p>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg font-bold border border-indigo-500/30">
            {leaves.length} Requests
          </span>
        </div>

        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{l.studentName} ({l.rollNumber})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300">
                    {l.leaveType}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{l.fromDate} to {l.toDate}</span>
                </div>
                <p className="text-xs text-slate-300">
                  Reason: <span className="italic text-slate-400">"{l.reason}"</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {l.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleLeaveAction(l.id, 'APPROVED')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve OD</span>
                    </button>
                    <button
                      onClick={() => handleLeaveAction(l.id, 'REJECTED')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    l.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {l.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
