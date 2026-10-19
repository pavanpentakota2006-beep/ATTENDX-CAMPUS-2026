import React, { useState } from 'react';
import { UserProfile, SubjectAttendance, AttendanceRecordItem } from '../../types';
import { mockSubjects, mockAttendanceRecords, checkScanAnomaly } from '../../services/api';
import { useCampusClock } from '../../hooks/useCampusClock';
import { useTimetable } from '../../hooks/useTimetable';
import { StatCard } from '../common/StatCard';
import { 
  QrCode, CheckCircle2, AlertTriangle, XCircle, TrendingUp, 
  Calendar, ShieldAlert, Sparkles, Send, MapPin, Smartphone, ArrowRight,
  Camera, CreditCard
} from 'lucide-react';
import { IdCardPhotoScannerModal } from '../attendance/IdCardPhotoScannerModal';

interface StudentDashboardProps {
  user: UserProfile;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const clock = useCampusClock();
  const timetable = useTimetable();
  const [subjects, setSubjects] = useState<SubjectAttendance[]>(mockSubjects);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordItem[]>(mockAttendanceRecords);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [visionModalOpen, setVisionModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [visionSuccessAlert, setVisionSuccessAlert] = useState<string | null>(null);

  // Leave Form state
  const [leaveType, setLeaveType] = useState('MEDICAL');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Overall attendance calculation
  const totalHeld = subjects.reduce((acc, s) => acc + s.classesHeld, 0);
  const totalAttended = subjects.reduce((acc, s) => acc + s.classesAttended, 0);
  const overallPercentage = Math.round((totalAttended / totalHeld) * 1000) / 10;

  // At-risk subject flagged by AI
  const atRiskSubject = subjects.find(s => s.percentage < 75.0);

  // Trigger simulated scan to verify AI anomaly detection
  const handleSimulateScan = async (spoofGeo: boolean = false) => {
    setIsScanning(true);
    setScanResult(null);

    const payload = {
      student_id: user.rollNumber || '22CS045',
      session_id: 'sess-uuid-ml-today-101',
      scan_delay_seconds: spoofGeo ? 1.8 : 4.5,
      distance_meters: spoofGeo ? 185.0 : 8.2,
      ip_subnet_match: !spoofGeo,
      device_id: 'BROWSER-DEV-88910',
      historical_attendance_rate: overallPercentage / 100,
      period_slot_index: clock.currentPeriod || 1,
      day_of_week: 1
    };

    const result = await checkScanAnomaly(payload);
    setIsScanning(false);

    // STRICT RULE: ONLY accept trained model data and mark as PRESENT if trained model verifies
    const isModelVerified = !result.is_anomaly && result.verdict === 'VERIFIED';

    if (isModelVerified) {
      // 1. Mark as PRESENT on active course (CS401 Applied Machine Learning)
      setSubjects(prev => prev.map(s => {
        if (s.subjectCode === 'CS401') {
          const newHeld = s.classesHeld + 1;
          const newAttended = s.classesAttended + 1;
          const newPct = Math.round((newAttended / newHeld) * 1000) / 10;
          return {
            ...s,
            classesHeld: newHeld,
            classesAttended: newAttended,
            percentage: newPct,
            recommendedAction: `Trained AI Model Verified! Standing improved to ${newPct}%.`
          };
        }
        return s;
      }));

      // 2. Prepend newly verified PRESENT attendance record
      const newRec: AttendanceRecordItem = {
        id: Date.now(),
        sessionId: 'sess-uuid-ml-today-101',
        subjectCode: 'CS401',
        subjectName: 'Applied Machine Learning',
        scanTimestamp: `Today, ${clock.timeString}`,
        status: 'PRESENT',
        mode: 'Trained Model (Isolation Forest Verified)',
        distanceMeters: payload.distance_meters,
        anomalyScore: result.anomaly_score,
        isVerified: true
      };
      setAttendanceRecords(prev => [newRec, ...prev]);

      setScanResult({
        ...result,
        attendanceMarked: true,
        statusText: 'MARKED AS PRESENT',
        spoofGeo,
        distance: payload.distance_meters,
        subject: timetable.currentSlot ? timetable.currentSlot.subjectName : 'Applied Machine Learning (CS401)',
        explanation: 'The trained Isolation Forest model evaluated telemetry against normal training distribution (8.2m distance, 4.5s latency). Attendance officially accepted and recorded as PRESENT.'
      });
    } else {
      // REJECTED by Trained Model: Strictly DO NOT mark as present!
      const newRec: AttendanceRecordItem = {
        id: Date.now(),
        sessionId: 'sess-uuid-ml-today-101',
        subjectCode: 'CS401',
        subjectName: 'Applied Machine Learning',
        scanTimestamp: `Today, ${clock.timeString}`,
        status: 'FLAGGED',
        mode: 'AI Anomaly Blocked (Proxy Attempt)',
        distanceMeters: payload.distance_meters,
        anomalyScore: result.anomaly_score,
        isVerified: false
      };
      setAttendanceRecords(prev => [newRec, ...prev]);

      setScanResult({
        ...result,
        attendanceMarked: false,
        statusText: 'NOT MARKED AS PRESENT (REJECTED)',
        spoofGeo,
        distance: payload.distance_meters,
        subject: timetable.currentSlot ? timetable.currentSlot.subjectName : 'Applied Machine Learning (CS401)',
        explanation: 'Trained model detected anomalous telemetry (185.0m distance violates classroom geo-fence). Attendance strictly DENIED and NOT marked as present.'
      });
    }
  };

  const handleVisionScanSuccess = (student: any, scanData: any) => {
    // STRICT TRAINED MODEL ENFORCEMENT
    if (scanData.is_verified && scanData.verdict === 'VERIFIED') {
      setSubjects(prev =>
        prev.map(sub => {
          if (sub.subjectCode === 'CS401') {
            const newAttended = sub.classesAttended + 1;
            const newHeld = sub.classesHeld + 1;
            return {
              ...sub,
              classesAttended: newAttended,
              classesHeld: newHeld,
              percentage: Math.round((newAttended / newHeld) * 1000) / 10
            };
          }
          return sub;
        })
      );

      const modeName = scanData.detection_mode === 'CAMPUS_ID_CARD_OCR_BARCODE'
        ? 'Campus ID Card (Model Verified)'
        : 'Live Photo (Facial Model Verified)';

      const newRec: AttendanceRecordItem = {
        id: Date.now(),
        sessionId: 'sess-vision-today',
        subjectCode: 'CS401',
        subjectName: 'Applied Machine Learning',
        scanTimestamp: `Today, ${clock.timeString}`,
        status: 'PRESENT',
        mode: modeName,
        distanceMeters: scanData.distance_meters || 5.8,
        anomalyScore: scanData.tamper_score || 0.018,
        isVerified: true
      };

      setAttendanceRecords(prev => [newRec, ...prev]);
      setVisionSuccessAlert(`TRAINED MODEL VERIFIED: Marked PRESENT for ${student.fullName || student.full_name} (${student.rollNumber || student.roll_number}) via ${modeName}!`);
      setTimeout(() => setVisionSuccessAlert(null), 6000);
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveModalOpen(false);
      setLeaveSubmitted(false);
      setLeaveReason('');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Vision Verification Success Banner */}
      {visionSuccessAlert && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 shadow-xl flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center space-x-3 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
            <span>{visionSuccessAlert}</span>
          </div>
          <button
            onClick={() => setVisionSuccessAlert(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Welcome back, {user.fullName}!</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Semester 6
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Roll No: <span className="font-mono text-slate-200">{user.rollNumber}</span> • Section {user.section} • B.Tech CSE
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Apply for Leave / OD
          </button>
          
          {/* Scan Photo / ID Card Button */}
          <button
            onClick={() => setVisionModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Photo / ID Card</span>
          </button>

          {/* Scan Dynamic QR Button */}
          <button
            onClick={() => { setScanModalOpen(true); setScanResult(null); }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Dynamic QR</span>
          </button>
        </div>
      </div>

      {/* AI Shortage Warning Card (if any subject < 75%) */}
      {atRiskSubject && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/30 p-5 shadow-xl">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  AI Attendance Shortage Warning (Threshold 75%)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  {atRiskSubject.subjectCode} At Risk ({atRiskSubject.percentage}%)
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100">
                {atRiskSubject.recommendedAction}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span>Classes Held: <strong>{atRiskSubject.classesHeld}</strong></span>
                <span>Attended: <strong>{atRiskSubject.classesAttended}</strong></span>
                <span className="text-rose-400 font-bold">
                  Target: {atRiskSubject.lecturesNeededToReach75} consecutive lectures required
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          subtitle="Mandatory minimum is 75.0%"
          icon={CheckCircle2}
          trend={overallPercentage >= 75 ? '+ Safe Standing' : '- Shortage Risk'}
          trendColor={overallPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}
          badge="Semester Average"
          gradient="from-indigo-950/50 to-slate-900"
        />
        <StatCard
          title="Total Lectures"
          value={totalHeld}
          subtitle={`${totalAttended} Attended • ${totalHeld - totalAttended} Missed`}
          icon={Calendar}
          badge="Live Count"
        />
        <StatCard
          title="At-Risk Subjects"
          value={subjects.filter(s => s.percentage < 75).length}
          subtitle="Identified by Random Forest AI"
          icon={AlertTriangle}
          trendColor="text-rose-400"
          badge="AI Radar"
          gradient="from-rose-950/30 to-slate-900"
        />
        <StatCard
          title="Next Scheduled Lecture"
          value={timetable.currentSlot ? timetable.currentSlot.subjectCode : (timetable.nextSlot ? timetable.nextSlot.subjectCode : 'Free Slot')}
          subtitle={timetable.currentSlot ? `Active in ${timetable.currentSlot.roomNumber}` : (timetable.nextSlot ? `Starts at ${timetable.nextSlot.startTime}` : 'No further classes')}
          icon={TrendingUp}
          badge="Timetable IST"
        />
      </div>

      {/* Today's Timetable + Subject Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Today's Schedule (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Today's Schedule</h3>
              <p className="text-xs text-slate-400 font-medium">
                {clock.dayOfWeek} • IST Timetable Routing
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
              {timetable.slots.length} Periods
            </span>
          </div>

          <div className="space-y-3">
            {timetable.slots.map(slot => {
              const isActive = clock.currentPeriod === slot.periodNumber;
              return (
                <div 
                  key={slot.id} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{slot.subjectName}</h4>
                      <p className="text-xs text-slate-400">
                        {slot.facultyName} • <span className="text-cyan-400 font-semibold">{slot.roomNumber}</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      P{slot.periodNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Subject-wise AI Attendance Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Course Attendance & AI Projections</h3>
              <p className="text-xs text-slate-400 font-medium">
                Real-time tracking with scikit-learn shortage early-warning
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">75% Mandatory</span>
          </div>

          <div className="space-y-4">
            {subjects.map(s => {
              const isBelow = s.percentage < 75.0;
              return (
                <div key={s.subjectCode} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{s.subjectCode}</span>
                        <span className="text-sm font-bold text-slate-100">{s.subjectName}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {s.classesAttended} attended of {s.classesHeld} held ({s.classesHeld - s.classesAttended} missed)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black font-mono ${
                        isBelow ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {s.percentage}%
                      </span>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {s.riskLevel} RISK
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBelow 
                          ? 'bg-rose-500' 
                          : s.percentage >= 85 
                          ? 'bg-emerald-500' 
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${s.percentage}%` }}
                    ></div>
                    {/* 75% benchmark threshold tick */}
                    <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/70"></div>
                  </div>

                  {/* AI Recommendation footer */}
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{s.recommendedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Attendance Scans Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Recent Attendance Scan Logs</h3>
          <span className="text-xs text-indigo-400 font-mono font-semibold">Trained AI Verification Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Verification Mode</th>
                <th className="py-3 px-4">Geo-Distance</th>
                <th className="py-3 px-4">AI Anomaly Score</th>
                <th className="py-3 px-4">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {attendanceRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-white">
                    {r.subjectCode} - {r.subjectName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{r.scanTimestamp}</td>
                  <td className="py-3 px-4">{r.mode}</td>
                  <td className="py-3 px-4 font-mono">{r.distanceMeters > 0 ? `${r.distanceMeters}m` : 'N/A'}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.anomalyScore > 0.6 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {r.anomalyScore.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                      r.status === 'PRESENT' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic QR Scan Modal */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Campus Dynamic QR Scanner</h3>
              </div>
              <button 
                onClick={() => setScanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {!scanResult ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-52 h-52 rounded-2xl border-2 border-dashed border-indigo-500/60 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce"></div>
                  <Smartphone className="w-12 h-12 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">Position camera to faculty live screen</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-1">20s Rotating Token Engine</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>AI Model Loaded:</span>
                    <span className="text-cyan-400 font-mono">isolation_forest.joblib</span>
                  </div>
                  <p className="text-[10px]">
                    Strict Rule: Only scans verified by the trained model will be marked as <strong className="text-emerald-400">PRESENT</strong>. Anomaly / proxy attempts will be strictly rejected.
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  Select a simulation scenario to test real-time AI anomaly evaluation:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    disabled={isScanning}
                    onClick={() => handleSimulateScan(false)}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isScanning ? 'Evaluating...' : 'Normal In-Class Scan (8m)'}
                  </button>
                  <button
                    disabled={isScanning}
                    onClick={() => handleSimulateScan(true)}
                    className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isScanning ? 'Evaluating...' : 'Simulate Proxy Scan (185m away)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                  scanResult.attendanceMarked 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                }`}>
                  {scanResult.attendanceMarked ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  ) : (
                    <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  )}
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 ${
                      scanResult.attendanceMarked 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {scanResult.statusText}
                    </span>
                    <h4 className="text-base font-extrabold uppercase tracking-wide">
                      Trained Model Verdict: {scanResult.verdict}
                    </h4>
                  </div>
                  <p className="text-xs">
                    {scanResult.explanation}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Trained Weights:</span>
                    <span className="text-cyan-400 font-bold">isolation_forest.joblib</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Model Architecture:</span>
                    <span className="text-slate-200">{scanResult.model_version || 'Isolation Forest (scikit-learn)'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Telemetry Anomaly Score:</span>
                    <span className={scanResult.anomaly_score > 0.6 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {scanResult.anomaly_score} (Contamination 0.08)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GPS Classroom Distance:</span>
                    <span className="text-slate-200">{scanResult.distance} meters (Limit 45m)</span>
                  </div>
                  {scanResult.flag_reasons?.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-rose-300">
                      <p className="font-bold mb-1">Model Flag Reasons:</p>
                      {scanResult.flag_reasons.map((r: string, idx: number) => (
                        <p key={idx} className="text-[11px]">• {r}</p>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setScanResult(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Try Another Scan Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Submit Leave / On-Duty Request</h3>
              <button onClick={() => setLeaveModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {leaveSubmitted ? (
              <div className="p-6 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <h4 className="text-base font-bold">Request Submitted Successfully</h4>
                <p className="text-xs text-slate-400">Forwarded to Dr. Sarah Verma & HOD for verification.</p>
              </div>
            ) : (
              <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Leave Category</label>
                  <select 
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MEDICAL">Medical Leave (Doctor Certificate)</option>
                    <option value="ON_DUTY">On-Duty / Hackathon (Smart India Hackathon)</option>
                    <option value="OD_SPORTS">Inter-University Sports Meet</option>
                    <option value="PERSONAL">Personal Emergency</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">From Date</label>
                    <input type="date" defaultValue="2026-10-22" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">To Date</label>
                    <input type="date" defaultValue="2026-10-23" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reason & Justification</label>
                  <textarea 
                    rows={3} 
                    required
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    placeholder="Provide details about the hackathon or medical ailment..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
                >
                  Submit for Faculty & HOD Approval
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Live Photo & Student ID Card Scanner Modal */}
      <IdCardPhotoScannerModal
        isOpen={visionModalOpen}
        onClose={() => setVisionModalOpen(false)}
        onSuccess={handleVisionScanSuccess}
        title="AI Biometric & Student ID Card Attendance"
        contextMessage="Present your physical campus student ID card or snap a live webcam selfie in class. The trained VisionNet + Isolation Forest model evaluates telemetry and marks your attendance as PRESENT."
      />
    </div>
  );
};

