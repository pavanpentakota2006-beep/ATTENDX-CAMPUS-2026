import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { useCampusClock } from '../../hooks/useCampusClock';
import { Clock, Bell, Shield, GraduationCap, Users, UserCheck, Sparkles, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onRoleChange, activeTab, setActiveTab, onLogout }) => {
  const clock = useCampusClock();
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { role: 'FACULTY', label: 'Faculty', icon: UserCheck, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { role: 'HOD', label: 'HOD', icon: Users, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { role: 'ADMIN', label: 'Admin', icon: Shield, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Project Name */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
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
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              AI-Powered Smart Attendance & Academic Monitoring
            </p>
          </div>
        </div>

        {/* Live Campus Clock IST Widget */}
        <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">IST</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="text-right">
            <div className="text-sm font-extrabold text-slate-100 font-mono tracking-tight">
              {clock.timeString}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {clock.dayOfWeek.slice(0, 3)}, {clock.dateString.split(', ')[1]}
            </div>
          </div>
          <div className="hidden md:block">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
              clock.currentPeriod 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {clock.currentPeriod ? `Period ${clock.currentPeriod}` : 'Outside Hours'}
            </span>
          </div>
        </div>

        {/* Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Role Switcher pills */}
          <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            {roles.map(r => {
              const Icon = r.icon;
              const isActive = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => onRoleChange(r.role)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? `${r.color} border shadow-sm font-bold`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  title={`Switch to ${r.label} View`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Campus Alerts</h4>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">3 New</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                    <p className="font-semibold text-rose-300">CS402 Shortage Warning</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Your attendance is 67.9%. AI suggests attending next 8 classes.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                    <p className="font-semibold text-cyan-300">Working Saturday (24 Oct)</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Compensatory instructional day follows Tuesday schedule.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {currentUser.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-200">{currentUser.fullName}</div>
              <div className="text-[10px] font-semibold text-indigo-400">{currentUser.role} • {currentUser.departmentCode}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold transition"
            title="Log Out of Session"
          >
            <span>Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};
