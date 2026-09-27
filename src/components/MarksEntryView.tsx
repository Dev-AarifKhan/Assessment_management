import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MarkEntry } from '../types';
import { Save, Award, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const MarksEntryView: React.FC = () => {
  const { 
    assessments, 
    students, 
    markEntries, 
    saveMultipleMarkEntries, 
    selectedAssessmentId, 
    setSelectedAssessmentId,
    setActiveTab,
    config
  } = useApp();

  const activeAssessment = assessments.find(a => a.assessmentId === selectedAssessmentId) || assessments[0];

  // Candidates in this class
  const classStudents = activeAssessment 
    ? students.filter(s => s.className === activeAssessment.className)
    : [];

  // Local draft rows for interactive editing
  const [draftMarks, setDraftMarks] = useState<{ [studentId: string]: {
    obtainedMarks: string;
    status: 'Present' | 'Absent' | 'Medical';
    remarks: string;
  } }>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize draft when active assessment changes
  useEffect(() => {
    if (!activeAssessment) return;
    const initialDraft: typeof draftMarks = {};
    classStudents.forEach(st => {
      const existing = markEntries.find(m => m.assessmentId === activeAssessment.assessmentId && m.studentId === st.studentId);
      if (existing) {
        initialDraft[st.studentId] = {
          obtainedMarks: existing.obtainedMarks !== null ? existing.obtainedMarks.toString() : '',
          status: existing.status,
          remarks: existing.remarks || ''
        };
      } else {
        initialDraft[st.studentId] = {
          obtainedMarks: '',
          status: 'Present',
          remarks: ''
        };
      }
    });
    setDraftMarks(initialDraft);
  }, [activeAssessment?.assessmentId, students]);

  if (!activeAssessment) {
    return (
      <div className="p-8 text-center text-slate-500">
        No active assessments found. Please create an assessment first.
      </div>
    );
  }

  const handleMarksChange = (studentId: string, val: string) => {
    const num = Number(val);
    if (val !== '' && (isNaN(num) || num < 0 || num > activeAssessment.maxMarks)) {
      return; // prevent out of range
    }
    setDraftMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtainedMarks: val,
        status: val === '' ? prev[studentId]?.status || 'Present' : 'Present'
      }
    }));
  };

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Medical') => {
    setDraftMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        obtainedMarks: status === 'Absent' ? '' : prev[studentId]?.obtainedMarks || ''
      }
    }));
  };

  const handleSave = () => {
    const passThreshold = (activeAssessment.maxMarks * activeAssessment.passingPercentage) / 100;
    const entriesToSave: MarkEntry[] = classStudents.map(st => {
      const draft = draftMarks[st.studentId] || { obtainedMarks: '', status: 'Present', remarks: '' };
      const numVal = draft.status === 'Present' && draft.obtainedMarks !== '' ? Number(draft.obtainedMarks) : null;
      
      let result: 'Pass' | 'Fail' | 'Absent' = 'Absent';
      if (draft.status === 'Present') {
        if (numVal !== null) {
          result = numVal >= passThreshold ? 'Pass' : 'Fail';
        } else {
          result = 'Fail';
        }
      }

      return {
        markEntryId: `ME-${activeAssessment.assessmentId}-${st.studentId}`,
        assessmentId: activeAssessment.assessmentId,
        studentId: st.studentId,
        academicSession: activeAssessment.academicSession,
        className: activeAssessment.className,
        subject: activeAssessment.subject,
        maxMarks: activeAssessment.maxMarks,
        obtainedMarks: numVal,
        status: draft.status,
        result: result,
        remarks: draft.remarks
      };
    });

    saveMultipleMarkEntries(entriesToSave);
    setToastMessage('Marks successfully saved & updated!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations for summary pills
  const passThreshold = (activeAssessment.maxMarks * activeAssessment.passingPercentage) / 100;
  let gradedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let absentCount = 0;

  classStudents.forEach(st => {
    const draft = draftMarks[st.studentId];
    if (draft) {
      if (draft.status === 'Absent') {
        absentCount++;
      } else if (draft.obtainedMarks !== '') {
        gradedCount++;
        if (Number(draft.obtainedMarks) >= passThreshold) {
          passedCount++;
        } else {
          failedCount++;
        }
      }
    }
  });

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-sm font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Assessment Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Marks Entry & Grading Sheet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select examination and enter candidate scores. Instant validation and passing calculation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('class-award')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 font-semibold text-xs transition"
          >
            <Award size={15} />
            <span>Generate Award Roll</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition"
          >
            <Save size={16} />
            <span>Save Marks</span>
          </button>
        </div>
      </div>

      {/* Assessment Selector Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Select Assessment:
            </label>
            <select
              value={activeAssessment.assessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full sm:max-w-md px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {assessments.map(a => (
                <option key={a.assessmentId} value={a.assessmentId}>
                  Class {a.className} • {a.subject} — {a.name} (Max: {a.maxMarks})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Enrolled: </span>
              <strong className="text-slate-900 dark:text-white">{classStudents.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span>Graded: </span>
              <strong>{gradedCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span>Passed: </span>
              <strong>{passedCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <span>Failed: </span>
              <strong>{failedCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <span>Absent: </span>
              <strong>{absentCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Marks Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16">Roll</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4 w-32">Attendance</th>
                <th className="py-3 px-4 w-40">Obtained / {activeAssessment.maxMarks}</th>
                <th className="py-3 px-4 w-28">Result</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No students registered in Class {activeAssessment.className}.
                  </td>
                </tr>
              ) : (
                classStudents.map((st) => {
                  const draft = draftMarks[st.studentId] || { obtainedMarks: '', status: 'Present', remarks: '' };
                  const isAbsent = draft.status === 'Absent';
                  const marksNum = Number(draft.obtainedMarks);
                  const isGraded = draft.obtainedMarks !== '' && !isNaN(marksNum);
                  const isPassed = isGraded && marksNum >= passThreshold;

                  return (
                    <tr key={st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                        {st.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {st.studentId} • F: {st.parentage}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={draft.status}
                          onChange={(e) => handleStatusChange(st.studentId, e.target.value as any)}
                          className={`w-full px-2 py-1 rounded-lg text-xs font-semibold border ${
                            draft.status === 'Absent' 
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300' 
                              : 'bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Medical">Medical</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min="0"
                            max={activeAssessment.maxMarks}
                            step="0.5"
                            disabled={isAbsent}
                            placeholder={isAbsent ? 'ABS' : '0.0'}
                            value={isAbsent ? '' : draft.obtainedMarks}
                            onChange={(e) => handleMarksChange(st.studentId, e.target.value)}
                            className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-900"
                          />
                          <span className="ml-2 text-xs font-semibold text-slate-400">/{activeAssessment.maxMarks}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isAbsent ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            ABSENT
                          </span>
                        ) : isGraded ? (
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300'
                          }`}>
                            {isPassed ? 'PASS' : 'FAIL'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Good, Needs remedial"
                          value={draft.remarks}
                          onChange={(e) => setDraftMarks(prev => ({
                            ...prev,
                            [st.studentId]: {
                              ...prev[st.studentId],
                              remarks: e.target.value
                            }
                          }))}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer save prompt */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Passing rule: <strong className="text-slate-700 dark:text-slate-200">{activeAssessment.passingPercentage}% ({passThreshold} / {activeAssessment.maxMarks} marks)</strong>
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow transition active:scale-95"
          >
            <Save size={16} />
            <span>Save & Lock All Marks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
