import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Printer, User } from 'lucide-react';
import { CLASSES_LIST } from '../data/initialData';
import { normalizeClassName } from '../utils/classUtils';

export const IdCardView: React.FC = () => {
  const { students, config } = useApp();
  const [selectedClass, setSelectedClass] = useState<string>('10th');

  const allClasses = Array.from(
    new Set([
      ...CLASSES_LIST,
      ...students.map(s => normalizeClassName(s.className)).filter(Boolean)
    ])
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  const classStudents = students.filter(s => normalizeClassName(s.className) === normalizeClassName(selectedClass));

  return (
    <div className="space-y-6">
      <div className="no-print p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-indigo-600 dark:text-indigo-400" size={24} />
            <span>Student Identity Cards</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Printable standardized student ID cards with official school crest and barcode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold"
          >
            {allClasses.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition"
          >
            <Printer size={16} />
            <span>Print All ID Cards</span>
          </button>
        </div>
      </div>

      {/* ID Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classStudents.map(st => (
          <div
            key={st.studentId}
            className="rounded-2xl border-2 border-indigo-950 bg-white text-slate-900 shadow-lg overflow-hidden flex flex-col justify-between"
            style={{ minHeight: '280px' }}
          >
            {/* Top School Bar */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-3 text-center border-b-2 border-amber-400">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5">
                  <img src="/school_logo.png" alt="" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-tight leading-tight">
                    {config.schoolName}
                  </h4>
                  <p className="text-[9px] text-indigo-200">
                    {config.schoolCode} • Session {st.academicSession}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Card Content */}
            <div className="p-4 flex gap-4 items-center">
              {/* Photo Box */}
              <div className="w-20 h-24 border border-slate-300 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                <User size={36} />
                <span className="text-[8px] uppercase font-semibold">Photo</span>
              </div>

              {/* Student Details */}
              <div className="space-y-1 text-xs">
                <h5 className="font-bold text-sm text-indigo-950 leading-tight">
                  {st.name}
                </h5>
                <p className="text-[11px] text-slate-600">
                  F: <span className="font-semibold text-slate-800">{st.parentage}</span>
                </p>
                <div className="flex gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Class</span>
                    <strong className="text-indigo-900">{st.className}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Roll No</span>
                    <strong className="text-indigo-900 font-bold">{st.rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Stream</span>
                    <span className="font-medium">{st.stream}</span>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-slate-500 pt-1">
                  ID: {st.studentId}
                </p>
              </div>
            </div>

            {/* Bottom Bar with Barcode simulation & Principal Signature */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[9px]">
              <div className="space-y-0.5">
                <div className="h-4 w-28 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-[7px] text-white tracking-widest font-mono">||| | |||| | |||</span>
                </div>
                <span className="text-[8px] text-slate-400 font-mono">{st.studentId}</span>
              </div>
              <div className="text-right">
                <div className="h-4 border-b border-slate-400 w-16"></div>
                <span className="font-bold text-slate-800">Principal Seal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
