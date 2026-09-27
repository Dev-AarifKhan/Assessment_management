import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assessment } from '../types';
import { BookOpen, PlusCircle, Calendar, Award, FileEdit, CheckCircle2 } from 'lucide-react';
import { CLASSES_LIST, SUBJECTS_LIST } from '../data/initialData';

export const AssessmentsView: React.FC = () => {
  const { assessments, addAssessment, config, students, markEntries, role, setActiveTab, setSelectedAssessmentId } = useApp();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Theory',
    subject: 'Mathematics',
    className: '10th',
    assessmentDate: new Date().toISOString().split('T')[0],
    maxMarks: 50,
    passingPercentage: config.passingPercentage
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please provide an assessment name');
      return;
    }

    const newId = `ASM-25-${formData.className}-${formData.subject.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const newAssessment: Assessment = {
      ...formData,
      assessmentId: newId,
      academicSession: config.activeSession
    };

    addAssessment(newAssessment);
    setShowAddModal(false);
    setFormData({
      name: '',
      type: 'Theory',
      subject: 'Mathematics',
      className: '10th',
      assessmentDate: new Date().toISOString().split('T')[0],
      maxMarks: 50,
      passingPercentage: config.passingPercentage
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Assessments & Examination Wing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official periodic tests, mid-term examinations, and annual award rolls for Session {config.activeSession}
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow transition"
          >
            <PlusCircle size={16} />
            <span>Create Assessment</span>
          </button>
        )}
      </div>

      {/* Grid of assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((a) => {
          const classStudents = students.filter(s => s.className === a.className);
          const entries = markEntries.filter(m => m.assessmentId === a.assessmentId);
          const evaluatedCount = entries.length;
          const passedCount = entries.filter(m => m.result === 'Pass').length;
          const passPct = evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0;

          return (
            <div
              key={a.assessmentId}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Class {a.className} • {a.subject}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {a.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {a.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Date of Examination:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar size={13} />
                      {a.assessmentDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Maximum Marks:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{a.maxMarks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pass Criteria:</span>
                    <span>{a.passingPercentage}% ({Math.ceil((a.maxMarks * a.passingPercentage) / 100)} marks)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Grading Progress:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {evaluatedCount} / {classStudents.length} Students
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${evaluatedCount >= classStudents.length ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${classStudents.length > 0 ? (evaluatedCount / classStudents.length) * 100 : 0}%` }}
                    />
                  </div>
                  {evaluatedCount > 0 && (
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Pass Rate: {passPct}% ({passedCount} Passed)
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAssessmentId(a.assessmentId);
                    setActiveTab('marks');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
                >
                  <FileEdit size={14} />
                  <span>Enter Marks</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAssessmentId(a.assessmentId);
                    setActiveTab('class-award');
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                  title="Generate Official Award Roll PDF"
                >
                  <Award size={14} />
                  <span>Award Roll</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Assessment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Examination / Assessment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Unit Test 2, Golden Test, Mid-Term"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {CLASSES_LIST.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {SUBJECTS_LIST.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Internal Assessment">Internal</option>
                    <option value="Comprehensive">Comprehensive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
