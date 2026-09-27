import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { AssessmentsView } from './components/AssessmentsView';
import { MarksEntryView } from './components/MarksEntryView';
import { ClassAwardRollView } from './components/ClassAwardRollView';
import { StudentMarksheetView } from './components/StudentMarksheetView';
import { IdCardView } from './components/IdCardView';
import { SettingsView } from './components/SettingsView';
import { VercelDeployInfo } from './components/VercelDeployInfo';

const MainContent: React.FC = () => {
  const { activeTab, theme } = useApp();
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
        {activeTab === 'id-cards' && <IdCardView />}
        {activeTab === 'settings' && <SettingsView onOpenVercelModal={() => setVercelModalOpen(true)} />}
      </main>

      <footer className="no-print mt-12 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Government Higher Secondary School Larnoo • Result & Examination Wing</p>
        <p className="mt-1">Affiliated to JKBOSE • Vercel Deployment & Android Hybrid Applet</p>
      </footer>

      <VercelDeployInfo isOpen={vercelModalOpen} onClose={() => setVercelModalOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
