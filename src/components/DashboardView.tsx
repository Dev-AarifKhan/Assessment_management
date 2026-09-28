import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  FileEdit, 
  Printer, 
  Sparkles,
  Calendar,
  School,
  Download
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { students, assessments, markEntries, config, setActiveTab, setSelectedAssessmentId } = useApp();

  const totalStudents = students.length;
  const activeAssessments = assessments.filter(a => a.academicSession === config.activeSession);
  
  // Calculate pass statistics
  const currentSessionMarks = markEntries.filter(m => m.academicSession === config.activeSession && m.status === 'Present');
  const passedMarks = currentSessionMarks.filter(m => m.result === 'Pass');
  const overallPassRate = currentSessionMarks.length > 0 
    ? Math.round((passedMarks.length / currentSessionMarks.length) * 100)
    : 85;

  const classCounts = {
    '9th': students.filter(s => s.className === '9th').length,
    '10th': students.filter(s => s.className === '10th').length,
    '11th': students.filter(s => s.className === '11th').length,
    '12th': students.filter(s => s.className === '12th').length,
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-indigo-700">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>Academic Session {config.activeSession} Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to {config.schoolName}
          </h2>
          <p className="mt-2 text-indigo-200 text-sm sm:text-base leading-relaxed">
            Comprehensive Assessment & Result Management Portal. Record student marks, monitor class pass percentage, generate watermarked subject award rolls, and export official JKBOSE marksheets.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('marks')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-sm shadow hover:bg-indigo-50 transition active:scale-95"
            >
              <FileEdit size={16} />
              <span>Enter Marks</span>
            </button>
            <button
              onClick={() => setActiveTab('class-award')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/40 transition active:scale-95"
            >
              <Printer size={16} />
              <span>Generate Award Roll (PDF)</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark / Emblem in background */}
        <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden">
          <img src="/school_logo.png" alt="" className="w-full h-full object-cover filter contrast-125" />
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalStudents}</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
              Across Classes 9th – 12th
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Assessments</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeAssessments.length}</h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 inline-block">
              Term 1, Unit Tests & Annual
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pass Percentage</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{overallPassRate}%</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
              Min Threshold: {config.passingPercentage}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Award Rolls Ready</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeAssessments.length}</h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
              With School Watermark
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Class Wise Breakdown & Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Enrollment Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Class Enrollment</h4>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Directory</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(classCounts).map(([cls, count]) => {
              const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
              return (
                <div key={cls} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Class {cls}</span>
                    <span>{count} Students ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Board Affiliation Standard</p>
            <p>Complies with Jammu & Kashmir Board of School Education (JKBOSE) secondary & higher secondary evaluation mandates.</p>
          </div>
        </div>

        {/* Active Examinations & Award Rolls */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Active Assessments & Tests</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any assessment to enter marks or print award roll</p>
            </div>
            <button
              onClick={() => setActiveTab('assessments')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeAssessments.map((a) => {
              const enrolledInClass = students.filter(s => s.className === a.className).length;
              const marksCount = markEntries.filter(m => m.assessmentId === a.assessmentId).length;
              const isCompleted = marksCount >= enrolledInClass && enrolledInClass > 0;

              return (
                <div key={a.assessmentId} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{a.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                        Class {a.className} • {a.subject}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Max: {a.maxMarks}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {a.assessmentDate}
                      </span>
                      <span>•</span>
                      <span>Graded: <strong className="text-slate-800 dark:text-slate-200">{marksCount}</strong> / {enrolledInClass} candidates</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAssessmentId(a.assessmentId);
                        setActiveTab('marks');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition"
                    >
                      Enter Marks
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssessmentId(a.assessmentId);
                        setActiveTab('class-award');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1"
                    >
                      <Award size={14} />
                      <span>Award Roll (PDF)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
