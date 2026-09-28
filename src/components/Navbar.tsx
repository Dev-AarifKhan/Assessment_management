import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileEdit, 
  Award, 
  FileText, 
  CreditCard, 
  Settings, 
  Moon, 
  Sun, 
  ShieldCheck, 
  UserCheck, 
  CloudCheck
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenVercelModal: () => void }> = ({ onOpenVercelModal }) => {
  const { config, role, setRole, theme, setTheme, activeTab, setActiveTab } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'students', label: 'Students', icon: <Users size={18} /> },
    { id: 'assessments', label: 'Assessments', icon: <BookOpen size={18} /> },
    { id: 'marks', label: 'Marks Entry', icon: <FileEdit size={18} /> },
    { id: 'class-award', label: 'Award Roll (PDF)', icon: <Award size={18} /> },
    { id: 'marksheet', label: 'Marksheet (PDF)', icon: <FileText size={18} /> },
    { id: 'id-cards', label: 'ID Cards', icon: <CreditCard size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const isDark = theme === 'dark';

  return (
    <header className="no-print sticky top-0 z-50 transition-colors duration-200 border-b shadow-sm"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a'
      }}
    >
      {/* Top Banner / School Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-600 shadow-sm bg-white flex-shrink-0 flex items-center justify-center">
            <img 
              src="/school_logo.png" 
              alt="GHSS Larnoo Crest" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight leading-none text-indigo-700 dark:text-indigo-400">
                {config.schoolName}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {config.schoolCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {config.affiliation} • Session: <span className="font-semibold text-slate-700 dark:text-slate-200">{config.activeSession}</span>
            </p>
          </div>
        </div>

        {/* Right side controls: Role switch, Vercel Ready pill, Theme toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Vercel Deployment pill */}
          <button
            onClick={onOpenVercelModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 transition"
            title="Vercel Deployment Ready"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Vercel Ready</span>
            <span className="sm:hidden">Ready</span>
          </button>

          {/* Role Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                role === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <UserCheck size={14} />
              <span>Teacher</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            aria-label="Toggle High-Contrast Theme"
            title={isDark ? "Switch to High-Contrast Light Mode" : "Switch to High-Contrast Dark Mode"}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar Tabs */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-1.5 min-w-max">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
