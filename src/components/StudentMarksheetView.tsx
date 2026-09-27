import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Printer, ArrowLeft } from 'lucide-react';

export const StudentMarksheetView: React.FC = () => {
  const { students, assessments, markEntries, config, selectedStudentId, setSelectedStudentId } = useApp();

  const activeStudent = students.find(s => s.studentId === selectedStudentId) || students[0];

  const studentMarks = activeStudent
    ? markEntries.filter(m => m.studentId === activeStudent.studentId)
    : [];

  const handlePrint = () => {
    window.print();
  };

  if (!activeStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student selected.
      </div>
    );
  }

  // Calculate totals
  let totalMax = 0;
  let totalObtained = 0;
  let failedSubjectsCount = 0;
  let hasPending = false;

  studentMarks.forEach(m => {
    totalMax += m.maxMarks;
    if (m.obtainedMarks !== null && m.status === 'Present') {
      totalObtained += m.obtainedMarks;
      const passMark = (m.maxMarks * config.passingPercentage) / 100;
      if (m.obtainedMarks < passMark) {
        failedSubjectsCount++;
      }
    } else {
      failedSubjectsCount++;
      if (m.status !== 'Absent') hasPending = true;
    }
  });

  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
  const pctNum = Number(percentage);

  let overallResult = 'PASSED';
  let division = '1st Division';
  if (failedSubjectsCount > 0) {
    overallResult = 'RE-APPEAR';
    division = 'Needs Improvement';
  } else if (pctNum >= 75) {
    overallResult = 'DISTINCTION';
    division = 'Distinction with Honors';
  } else if (pctNum >= 60) {
    overallResult = 'FIRST DIVISION';
    division = '1st Division';
  } else if (pctNum >= 45) {
    overallResult = 'SECOND DIVISION';
    division = '2nd Division';
  } else {
    overallResult = 'THIRD DIVISION';
    division = '3rd Division';
  }

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden during print) */}
      <div className="no-print p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
            <span>Official Student Marksheet & Transcript</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Printable certificate with watermark, candidate credentials and subject breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeStudent.studentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold"
          >
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>
                Roll {s.rollNumber} — {s.name} (Class {s.className})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition active:scale-95"
          >
            <Printer size={16} />
            <span>Print Marksheet (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div 
        className="printable-page relative bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border-4 border-double border-slate-800 shadow-2xl mx-auto max-w-4xl overflow-hidden"
        style={{ minHeight: '960px', backgroundColor: '#ffffff', color: '#0f172a' }}
      >
        {/* WATERMARK: School Crest in center */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ opacity: 0.08 }}
        >
          <img 
            src="/school_crest.jpg" 
            alt="" 
            className="w-[500px] h-[500px] object-contain filter grayscale"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-between">
              <div className="w-20 h-20 rounded-full border-2 border-slate-900 p-1 bg-white flex-shrink-0">
                <img src="/school_crest.jpg" alt="" className="w-full h-full object-cover rounded-full" />
              </div>

              <div className="flex-1 px-4">
                <p className="text-[11px] uppercase tracking-widest font-extrabold text-slate-600">
                  Government of Jammu and Kashmir • Department of School Education
                </p>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  {config.schoolName}
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  {config.schoolAddress}
                </p>
                <p className="text-[11px] text-slate-600 italic">
                  {config.affiliation} • School Code: <strong>{config.schoolCode}</strong>
                </p>

                <div className="mt-3 inline-block px-5 py-1 border-2 border-slate-900 bg-slate-100 rounded-md">
                  <h2 className="text-sm font-black uppercase tracking-widest">
                    CUMULATIVE STUDENT PERFORMANCE MARKSHEET
                  </h2>
                </div>
              </div>

              <div className="w-20 flex-shrink-0">
                {/* Photo box */}
                <div className="w-20 h-24 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-1 bg-slate-50">
                  <span>Affix Candidate Photo</span>
                </div>
              </div>
            </div>

            {/* Candidate Identity Card Header */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-300 text-left text-xs">
              <div className="space-y-1">
                <p><span className="text-slate-500">Student Name:</span> <strong className="text-slate-900 text-sm">{activeStudent.name}</strong></p>
                <p><span className="text-slate-500">Parentage:</span> <strong className="text-slate-900">{activeStudent.parentage}</strong></p>
              </div>
              <div className="space-y-1">
                <p><span className="text-slate-500">Class & Stream:</span> <strong className="text-slate-900">Class {activeStudent.className} ({activeStudent.stream})</strong></p>
                <p><span className="text-slate-500">Roll Number:</span> <strong className="text-slate-900 font-bold text-sm">{activeStudent.rollNumber}</strong></p>
              </div>
              <div className="space-y-1">
                <p><span className="text-slate-500">Student ID / Reg:</span> <strong className="text-slate-900 font-mono">{activeStudent.studentId}</strong></p>
                <p><span className="text-slate-500">Academic Session:</span> <strong className="text-slate-900">{activeStudent.academicSession}</strong></p>
              </div>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse border-2 border-slate-800 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-800 font-bold uppercase text-[10px] text-slate-900 text-center tracking-wider">
                  <th className="py-2.5 px-3 border-r border-slate-400 w-12">S.No</th>
                  <th className="py-2.5 px-4 border-r border-slate-400 text-left">Subject</th>
                  <th className="py-2.5 px-4 border-r border-slate-400 text-left">Examination Title</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 w-20">Max Marks</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 w-24">Marks Obtained</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 w-20">Pass Marks</th>
                  <th className="py-2.5 px-3 w-20">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {studentMarks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No assessment marks recorded yet for this student.
                    </td>
                  </tr>
                ) : (
                  studentMarks.map((m, idx) => {
                    const passMark = (m.maxMarks * config.passingPercentage) / 100;
                    const isPresent = m.status === 'Present';
                    const isPass = isPresent && m.obtainedMarks !== null && m.obtainedMarks >= passMark;

                    return (
                      <tr key={m.markEntryId} className="border-b border-slate-300 text-center hover:bg-slate-50">
                        <td className="py-2 px-3 border-r border-slate-300">{idx + 1}</td>
                        <td className="py-2 px-4 border-r border-slate-300 text-left font-bold text-slate-900">{m.subject}</td>
                        <td className="py-2 px-4 border-r border-slate-300 text-left text-slate-700">{m.assessmentId}</td>
                        <td className="py-2 px-3 border-r border-slate-300">{m.maxMarks}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-black text-slate-900 text-sm">
                          {!isPresent ? 'ABS' : m.obtainedMarks !== null ? m.obtainedMarks : '-'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-600">{passMark}</td>
                        <td className="py-2 px-3 font-bold">
                          {!isPresent ? (
                            <span className="text-amber-700">ABS</span>
                          ) : isPass ? (
                            <span className="text-emerald-700">PASS</span>
                          ) : (
                            <span className="text-rose-700">FAIL</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {studentMarks.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-800 font-bold text-slate-900 text-center">
                    <td colSpan={3} className="py-3 px-4 text-right border-r border-slate-400 uppercase tracking-wider text-xs">
                      Aggregate Totals:
                    </td>
                    <td className="py-3 px-3 border-r border-slate-400 text-sm">{totalMax}</td>
                    <td className="py-3 px-3 border-r border-slate-400 text-base font-black text-indigo-900">{totalObtained}</td>
                    <td colSpan={2} className="py-3 px-3 text-sm font-black text-emerald-800">
                      {percentage}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Final Result Card */}
          <div className="border-2 border-slate-800 rounded-xl p-4 bg-slate-50 text-xs">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Overall Percentage</span>
                <strong className="text-lg font-black text-indigo-900">{percentage}%</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Result Classification</span>
                <strong className={`text-base font-black ${failedSubjectsCount === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {overallResult}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Division Awarded</span>
                <strong className="text-sm font-bold text-slate-800">{division}</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Promotion Status</span>
                <strong className="text-sm font-bold text-slate-800">
                  {failedSubjectsCount === 0 ? 'Eligible for Next Class' : 'Remedial Required'}
                </strong>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t-2 border-slate-900 mt-4">
            <div className="grid grid-cols-3 gap-8 text-center text-xs">
              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <p className="font-bold text-slate-900">Class Teacher</p>
                <p className="text-[10px] text-slate-500">GHSS Larnoo</p>
              </div>

              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <p className="font-bold text-slate-900">Controller of Examinations</p>
                <p className="text-[10px] text-slate-500">Examination Wing</p>
              </div>

              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <p className="font-bold text-slate-900">Principal</p>
                <p className="text-[10px] text-slate-500">Official Seal & Signature</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
