import React, { useState } from 'react';
import { UserRole, UserProfile } from './types';
import { Header } from './components/common/Header';
import { StudentLayout } from './layouts/StudentLayout';
import { FacultyLayout } from './layouts/FacultyLayout';
import { HODLayout } from './layouts/HODLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { TimetablePage } from './pages/timetable/TimetablePage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { LayoutDashboard, Calendar, Cpu, Sparkles } from 'lucide-react';

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  STUDENT: {
    id: 5,
    username: 'stu_rahul',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@student.campus.edu',
    role: 'STUDENT',
    rollNumber: '22CS045',
    departmentCode: 'CSE',
    semester: 6,
    section: 'A'
  },
  FACULTY: {
    id: 3,
    username: 'faculty_sarah',
    fullName: 'Dr. Sarah Verma',
    email: 'sarah.verma@attendx.campus.edu',
    role: 'FACULTY',
    employeeCode: 'FAC-CSE-012',
    departmentCode: 'CSE'
  },
  HOD: {
    id: 2,
    username: 'hod_cse',
    fullName: 'Prof. K. Ramanathan',
    email: 'hod.cse@attendx.campus.edu',
    role: 'HOD',
    employeeCode: 'HOD-CSE-001',
    departmentCode: 'CSE'
  },
  ADMIN: {
    id: 1,
    username: 'admin',
    fullName: 'Campus Admin Office',
    email: 'admin@attendx.campus.edu',
    role: 'ADMIN',
    departmentCode: 'ADMIN'
  }
};

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('attendx_auth') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('attendx_role');
    return (savedRole as UserRole) || 'STUDENT';
  });
  const [activeUser, setActiveUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('attendx_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const savedRole = (localStorage.getItem('attendx_role') as UserRole) || 'STUDENT';
    return USER_PROFILES[savedRole] || USER_PROFILES.STUDENT;
  });
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TIMETABLE' | 'ANALYTICS'>('DASHBOARD');

  const handleLogin = (user: UserProfile) => {
    setActiveUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    localStorage.setItem('attendx_auth', 'true');
    localStorage.setItem('attendx_role', user.role);
    localStorage.setItem('attendx_active_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('attendx_auth');
    localStorage.removeItem('attendx_role');
    localStorage.removeItem('attendx_active_user');
    setActiveTab('DASHBOARD');
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const defaultUser = USER_PROFILES[role];
    setActiveUser(defaultUser);
    localStorage.setItem('attendx_role', role);
    localStorage.setItem('attendx_active_user', JSON.stringify(defaultUser));
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} userProfiles={USER_PROFILES} />;
  }

  const currentUser = activeUser;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Global Header */}
      <Header 
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        onLogout={handleLogout}
      />

      {/* Main Navigation Subheader */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
          <div className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'DASHBOARD'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{currentUser.role} Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('TIMETABLE')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'TIMETABLE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Master Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ANALYTICS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Analytics & ML Models</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Persona: <strong className="text-white">{currentUser.fullName}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'TIMETABLE' && <TimetablePage />}
        {activeTab === 'ANALYTICS' && <AnalyticsPage />}

        {activeTab === 'DASHBOARD' && (
          <>
            {currentRole === 'STUDENT' && <StudentLayout user={currentUser} />}
            {currentRole === 'FACULTY' && <FacultyLayout user={currentUser} />}
            {currentRole === 'HOD' && <HODLayout user={currentUser} />}
            {currentRole === 'ADMIN' && <AdminLayout user={currentUser} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            ATTENDX CAMPUS 2026: An AI-Powered Smart Attendance and Academic Monitoring System
          </p>
          <p className="text-[11px] text-slate-500">
            Real-Time Campus Clock · Intelligent Timetable · Secure Attendance · AI Analytics
          </p>
          <p className="text-[10px] text-slate-600">
            B.Tech Computer Science and Engineering Project • Full-Stack Web Development & Artificial Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
