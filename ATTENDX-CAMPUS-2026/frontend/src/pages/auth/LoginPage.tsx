import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { useCampusClock } from '../../hooks/useCampusClock';
import { 
  GraduationCap, UserCheck, Users, Shield, Clock, Eye, EyeOff, 
  Lock, Mail, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap,
  Camera, CreditCard
} from 'lucide-react';
import { IdCardPhotoScannerModal } from '../../components/attendance/IdCardPhotoScannerModal';
import { REGISTERED_STUDENTS_LIST, RegisteredStudent } from '../../services/api';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  userProfiles: Record<UserRole, UserProfile>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, userProfiles }) => {
  const clock = useCampusClock();
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [emailOrId, setEmailOrId] = useState(REGISTERED_STUDENTS_LIST[0].email);
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  const studentToProfile = (s: RegisteredStudent | any): UserProfile => ({
    id: s.id,
    username: `stu_${(s.rollNumber || s.roll_number || '22cs045').toLowerCase()}`,
    fullName: s.fullName || s.full_name || 'Campus Student',
    email: s.email || `${(s.rollNumber || s.roll_number || '22cs045').toLowerCase()}@student.campus.edu`,
    role: 'STUDENT',
    rollNumber: s.rollNumber || s.roll_number || '22CS045',
    departmentCode: s.departmentCode || s.department_code || 'CSE',
    semester: s.semester || 6,
    section: s.section || 'A'
  });

  // Handle role tab change
  const handleRoleTabClick = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'STUDENT') {
      setEmailOrId(REGISTERED_STUDENTS_LIST[activeStudentIndex].email);
    } else {
      setEmailOrId(userProfiles[role].email);
    }
    setPassword('Password@123');
    setErrorMsg('');
  };

  const handleStudentSelect = (student: RegisteredStudent, index: number) => {
    setActiveStudentIndex(index);
    setSelectedRole('STUDENT');
    setEmailOrId(student.email);
    setPassword('Password@123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      if (password.length >= 6) {
        if (selectedRole === 'STUDENT') {
          const matched = REGISTERED_STUDENTS_LIST.find(
            s => s.rollNumber.toLowerCase() === emailOrId.toLowerCase().trim() ||
                 s.email.toLowerCase() === emailOrId.toLowerCase().trim()
          );
          if (matched) {
            onLogin(studentToProfile(matched));
            return;
          }
          if (emailOrId.trim()) {
            onLogin({
              id: 99,
              username: `stu_${emailOrId.toLowerCase()}`,
              fullName: `Student ${emailOrId.toUpperCase()}`,
              email: emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase()}@student.campus.edu`,
              role: 'STUDENT',
              rollNumber: emailOrId.toUpperCase(),
              departmentCode: 'CSE',
              semester: 6,
              section: 'A'
            });
            return;
          }
        }
        onLogin(userProfiles[selectedRole]);
      } else {
        setErrorMsg('Invalid institutional credentials. Please try again or use 1-Click Quick Demo.');
      }
    }, 450);
  };

  const handleQuickLogin = (role: UserRole, customStudent?: RegisteredStudent) => {
    setIsLoading(true);
    setSelectedRole(role);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'STUDENT' && customStudent) {
        onLogin(studentToProfile(customStudent));
      } else if (role === 'STUDENT') {
        onLogin(studentToProfile(REGISTERED_STUDENTS_LIST[activeStudentIndex]));
      } else {
        onLogin(userProfiles[role]);
      }
    }, 350);
  };

  const handleScannerSuccess = (student: RegisteredStudent) => {
    setScannerOpen(false);
    onLogin(studentToProfile(student));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
            <span className="font-extrabold text-white text-lg tracking-wider">AX</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg text-white tracking-tight">ATTENDX</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                CAMPUS 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Smart Attendance & Academic Monitoring</p>
          </div>
        </div>

        {/* Live IST Clock Badge */}
        <div className="flex items-center space-x-2.5 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner text-xs">
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold text-[11px] uppercase tracking-wider">IST</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono font-bold text-slate-200">{clock.timeString}</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">({clock.dayOfWeek.slice(0, 3)})</span>
        </div>
      </header>

      {/* Center Auth Card Container */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row items-center gap-10">
        
        {/* Left Side: System Credentials & Academic Identity */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Driven Institutional Access • Semester 6</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Secure Campus <br/>
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
                Identity & Attendance
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              High-precision academic gateway powered by scikit-learn Isolation Forest anomaly shield, 20-second dynamic expiring QR tokens, and real-time IST timetable routing.
            </p>
          </div>

          {/* Hero Scan Button: Take Photo or Scan ID Card */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 hover:border-emerald-400 text-left transition group shadow-lg shadow-emerald-950/40"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-emerald-300 flex items-center space-x-1.5">
                  <span>Scan Student ID Card or Take Live Photo</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AI Model Verified
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Hold up any student ID card or snap photo for instant sign in & attendance
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
          </button>

          {/* 1-Click Quick Demo Sign-In Cards */}
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center lg:justify-start space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant 1-Click Persona Login (Any Student):</span>
            </p>

            {/* Any Student Selector Cards */}
            <div className="grid grid-cols-2 gap-2">
              {REGISTERED_STUDENTS_LIST.slice(0, 4).map((stu, idx) => (
                <button
                  key={stu.rollNumber}
                  type="button"
                  onClick={() => handleQuickLogin('STUDENT', stu)}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-left transition group flex items-center space-x-2.5"
                >
                  <img
                    src={stu.photoUrl}
                    alt={stu.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700 group-hover:border-emerald-400 transition"
                  />
                  <div className="truncate">
                    <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                      <GraduationCap className="w-3 h-3" />
                      <span>Student</span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition truncate">
                      {stu.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {stu.rollNumber} • Sem {stu.semester}-{stu.section}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Faculty, HOD, Admin Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Faculty */}
              <button
                type="button"
                onClick={() => handleQuickLogin('FACULTY')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-indigo-400 text-[10px] font-bold mb-0.5">
                  <UserCheck className="w-3 h-3" />
                  <span>Faculty</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">Dr. Sarah Verma</div>
                <div className="text-[10px] text-slate-400 font-mono">FAC-CSE-012</div>
              </button>

              {/* HOD */}
              <button
                type="button"
                onClick={() => handleQuickLogin('HOD')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-purple-400 text-[10px] font-bold mb-0.5">
                  <Users className="w-3 h-3" />
                  <span>HOD</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">Prof. Ramanathan</div>
                <div className="text-[10px] text-slate-400 font-mono">HOD-CSE-001</div>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-bold mb-0.5">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">Campus Admin</div>
                <div className="text-[10px] text-slate-400 font-mono">SuperAdmin</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Sign-In Card */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Form Title & Role Selector */}
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white">Sign In to Campus Portal</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select your role to access dashboard</p>
              </div>

              {/* Role Selector Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {(['STUDENT', 'FACULTY', 'HOD', 'ADMIN'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleTabClick(r)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center ${
                      selectedRole === r
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r === 'STUDENT' ? 'Student' : r === 'FACULTY' ? 'Faculty' : r === 'HOD' ? 'HOD' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email or Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrId}
                    onChange={e => setEmailOrId(e.target.value)}
                    placeholder="e.g. rahul.sharma@student.campus.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Account Password
                  </label>
                  <span className="text-[11px] text-indigo-400 font-semibold cursor-pointer hover:underline">
                    Default: Password@123
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0" />
                  <span>Remember this device</span>
                </label>
                <span className="text-slate-500 text-[11px]">B.Tech CSE 2026</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating Identity...</span>
                ) : (
                  <>
                    <span>Enter {selectedRole} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Guarantee */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CampusShield AI: Model Validation Active</span>
            </div>

          </div>
        </div>

      </main>

      {/* AI Photo & Student ID Card Scanner Modal */}
      <IdCardPhotoScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={handleScannerSuccess}
        title="AI Vision Student Authentication & Attendance"
        contextMessage="Hold your campus student ID card or snap a live webcam photo. The trained AI model will verify your credentials, log you in, and record your attendance as PRESENT."
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/70 py-4 text-center text-xs text-slate-500">
        <p>ATTENDX CAMPUS 2026: An AI-Powered Smart Attendance and Academic Monitoring System</p>
      </footer>
    </div>
  );
};
