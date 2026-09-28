import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { AssessmentsView } from './components/AssessmentsView';
import { MarksEntryView } from './components/MarksEntryView';
import { ClassAwardRollView } from './components/ClassAwardRollView';
import { StudentMarksheetView } from './components/StudentMarksheetView';
import { IdCardView } from './components/IdCardView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { VercelDeployInfo } from './components/VercelDeployInfo';
import { Loader2, ShieldAlert } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, theme } = useApp();
  const { isAdmin } = useAuth();
  const [vercelModalOpen, setVercelModalOpen] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar onOpenVercelModal={() => setVercelModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'students' && <StudentsView />}
        {activeTab === 'assessments' && <AssessmentsView />}
        {activeTab === 'marks' && <MarksEntryView />}
        {activeTab === 'class-award' && <ClassAwardRollView />}
        {activeTab === 'marksheet' && <StudentMarksheetView />}
        
        {/* Admin-Protected Modules */}
        {activeTab === 'id-cards' && (
          isAdmin ? <IdCardView /> : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ShieldAlert size={36} className="text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-base">Restricted Module</h3>
              <p className="text-xs text-slate-500 mt-1">Generating ID cards is reserved for School Administrators.</p>
            </div>
          )
        )}

        {activeTab === 'users' && (
          isAdmin ? <UserManagementView /> : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ShieldAlert size={36} className="text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-base">Restricted Module</h3>
              <p className="text-xs text-slate-500 mt-1">User management is accessible only to Administrators.</p>
            </div>
          )
        )}

        {activeTab === 'settings' && (
          isAdmin ? <SettingsView onOpenVercelModal={() => setVercelModalOpen(true)} /> : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ShieldAlert size={36} className="text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-base">Restricted Module</h3>
              <p className="text-xs text-slate-500 mt-1">School settings configuration is reserved for Administrators.</p>
            </div>
          )
        )}
      </main>

      <footer className="no-print mt-12 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 Govt. Higher Secondary School Larnoo | Student Assessment & Result Management System | All Rights Reserved</p>
      </footer>

      <VercelDeployInfo isOpen={vercelModalOpen} onClose={() => setVercelModalOpen(false)} />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-2 mb-4 flex items-center justify-center animate-pulse">
          <img src="/school_logo.png" alt="School Emblem" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <Loader2 size={18} className="animate-spin" />
          <span>Verifying Institutional Security Credentials...</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Connecting to GHSS Larnoo Cloud Database</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
};

export default App;
