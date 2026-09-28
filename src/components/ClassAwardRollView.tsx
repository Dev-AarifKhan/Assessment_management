import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ClassAwardRollView: React.FC = () => {
  const { 
    assessments, 
    students, 
    markEntries, 
    config, 
    selectedAssessmentId, 
    setSelectedAssessmentId,
    setActiveTab 
  } = useApp();

  const printAreaRef = useRef<HTMLDivElement>(null);

  const activeAssessment = assessments.find(a => a.assessmentId === selectedAssessmentId) || assessments[0];
  const classStudents = activeAssessment 
    ? students.filter(s => s.className === activeAssessment.className).sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber))
    : [];

  const handlePrint = () => {
    window.print();
  };

  if (!activeAssessment) {
    return (
      <div className="p-8 text-center text-slate-500">
        No active assessment selected.
      </div>
    );
  }

  // Calculate statistics
  const passThreshold = (activeAssessment.maxMarks * activeAssessment.passingPercentage) / 100;
  let enrolled = classStudents.length;
  let appeared = 0;
  let passed = 0;
  let failed = 0;
  let absent = 0;

  classStudents.forEach(st => {
    const entry = markEntries.find(m => m.assessmentId === activeAssessment.assessmentId && m.studentId === st.studentId);
    if (!entry || entry.status === 'Absent') {
      absent++;
    } else {
      appeared++;
      if (entry.obtainedMarks !== null && entry.obtainedMarks >= passThreshold) {
        passed++;
      } else {
        failed++;
      }
    }
  });

  const passPercentage = appeared > 0 ? ((passed / appeared) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Action Banner (hidden during print) */}
      <div className="no-print p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-indigo-600 dark:text-indigo-400" size={24} />
            <span>Classwise Subject Award Roll (Print & PDF)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official JKBOSE-compliant award sheet with school crest watermark and signature certification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeAssessment.assessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold"
          >
            {assessments.map(a => (
              <option key={a.assessmentId} value={a.assessmentId}>
                Class {a.className} • {a.subject} — {a.name}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition active:scale-95"
          >
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div 
        ref={printAreaRef}
        className="printable-page relative bg-white text-slate-900 p-8 sm:p-10 rounded-2xl border-2 border-slate-800 shadow-xl mx-auto max-w-4xl overflow-hidden"
        style={{ minHeight: '1000px', backgroundColor: '#ffffff', color: '#0f172a' }}
      >
        {/* WATERMARK: School Crest centered with calibrated subtle opacity */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ opacity: 0.08 }}
        >
          <img 
            src="/school_logo.png" 
            alt="School Crest Watermark" 
            className="w-[500px] h-[500px] object-contain filter grayscale"
          />
        </div>

        {/* Content Layer (z-10 ensures complete legibility above watermark) */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-slate-900 p-1 bg-white flex-shrink-0">
                <img 
                  src="/school_logo.png" 
                  alt="GHSS Larnoo Crest" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>

              <div className="text-center flex-1">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-600">
                  Government of Jammu & Kashmir • Department of School Education
                </p>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-0.5">
                  {config.schoolName}
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  {config.schoolAddress}
                </p>
                <p className="text-[11px] font-medium text-slate-600 italic">
                  {config.affiliation} • School Code: <strong>{config.schoolCode}</strong>
                </p>
                
                <div className="mt-2 inline-block px-4 py-1 bg-slate-100 border border-slate-800 rounded-md">
                  <h2 className="text-sm font-extrabold tracking-wider uppercase">
                    OFFICIAL SUBJECT AWARD ROLL — EXAMINATION WING
                  </h2>
                </div>
              </div>

              <div className="w-20 flex-shrink-0 text-right text-[10px] text-slate-500 font-mono">
                <div>REF: {activeAssessment.assessmentId.slice(0, 14)}</div>
                <div className="mt-1">SESSION:</div>
                <div className="font-bold text-slate-900">{activeAssessment.academicSession}</div>
              </div>
            </div>

            {/* Assessment Details Grid */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-300 text-xs font-medium">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Class & Stream:</span>
                <strong className="text-sm text-slate-900">Class {activeAssessment.className}</strong>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Subject:</span>
                <strong className="text-sm text-slate-900">{activeAssessment.subject}</strong>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Examination:</span>
                <strong className="text-sm text-slate-900">{activeAssessment.name}</strong>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Max / Pass Marks:</span>
                <strong className="text-sm text-slate-900">{activeAssessment.maxMarks} / {passThreshold} ({activeAssessment.passingPercentage}%)</strong>
              </div>
            </div>
          </div>

          {/* Candidate Marks Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse border border-slate-800 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-900 font-bold uppercase text-[10px] tracking-wider text-center">
                  <th className="py-2.5 px-2 border-r border-slate-400 w-10">S.No</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-left">Student Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-left">Parentage</th>
                  <th className="py-2.5 px-2 border-r border-slate-400 w-24">Student ID</th>
                  <th className="py-2.5 px-2 border-r border-slate-400 w-14">Roll No</th>
                  <th className="py-2.5 px-2 border-r border-slate-400 w-16">Max</th>
                  <th className="py-2.5 px-2 border-r border-slate-400 w-20">Obtained</th>
                  <th className="py-2.5 px-2 border-r border-slate-400 w-16">Status</th>
                  <th className="py-2.5 px-2 w-16">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {classStudents.map((st, index) => {
                  const entry = markEntries.find(m => m.assessmentId === activeAssessment.assessmentId && m.studentId === st.studentId);
                  const status = entry?.status || 'Absent';
                  const obtained = entry?.obtainedMarks !== null && entry?.obtainedMarks !== undefined ? entry.obtainedMarks : null;
                  const isPass = obtained !== null && obtained >= passThreshold;
                  const result = status === 'Absent' ? 'ABS' : isPass ? 'PASS' : 'FAIL';

                  return (
                    <tr key={st.studentId} className="border-b border-slate-300 text-center hover:bg-slate-50">
                      <td className="py-2 px-2 border-r border-slate-300 font-medium">{index + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-300 text-left font-bold text-slate-900">{st.name}</td>
                      <td className="py-2 px-3 border-r border-slate-300 text-left text-slate-700">{st.parentage}</td>
                      <td className="py-2 px-2 border-r border-slate-300 font-mono text-[10px] text-slate-600">{st.studentId}</td>
                      <td className="py-2 px-2 border-r border-slate-300 font-bold text-slate-900">{st.rollNumber}</td>
                      <td className="py-2 px-2 border-r border-slate-300 text-slate-600">{activeAssessment.maxMarks}</td>
                      <td className="py-2 px-2 border-r border-slate-300 font-black text-slate-900 text-sm">
                        {status === 'Absent' ? '-' : obtained !== null ? obtained : '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 font-semibold text-[11px]">
                        {status === 'Absent' ? <span className="text-amber-700">ABSENT</span> : 'PRESENT'}
                      </td>
                      <td className="py-2 px-2 font-black text-xs">
                        {status === 'Absent' ? (
                          <span className="text-amber-700">ABS</span>
                        ) : isPass ? (
                          <span className="text-emerald-700">PASS</span>
                        ) : (
                          <span className="text-rose-700">FAIL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statistical Abstract & Result Summary */}
          <div className="border border-slate-800 rounded p-3 bg-slate-50/70 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Performance Statistics Summary:
            </h4>
            <div className="grid grid-cols-6 gap-2 text-center">
              <div className="p-1 border border-slate-300 rounded bg-white">
                <span className="text-[10px] text-slate-500 uppercase block">Enrolled</span>
                <strong className="text-sm text-slate-900">{enrolled}</strong>
              </div>
              <div className="p-1 border border-slate-300 rounded bg-white">
                <span className="text-[10px] text-slate-500 uppercase block">Appeared</span>
                <strong className="text-sm text-slate-900">{appeared}</strong>
              </div>
              <div className="p-1 border border-slate-300 rounded bg-white">
                <span className="text-[10px] text-slate-500 uppercase block">Passed</span>
                <strong className="text-sm text-emerald-700">{passed}</strong>
              </div>
              <div className="p-1 border border-slate-300 rounded bg-white">
                <span className="text-[10px] text-slate-500 uppercase block">Failed</span>
                <strong className="text-sm text-rose-700">{failed}</strong>
              </div>
              <div className="p-1 border border-slate-300 rounded bg-white">
                <span className="text-[10px] text-slate-500 uppercase block">Absent</span>
                <strong className="text-sm text-amber-700">{absent}</strong>
              </div>
              <div className="p-1 border border-slate-300 rounded bg-white">
                <span className="text-[10px] text-slate-500 uppercase block">Pass %</span>
                <strong className="text-sm text-indigo-700">{passPercentage}%</strong>
              </div>
            </div>
          </div>

          {/* Signature Certification Block */}
          <div className="pt-6 border-t-2 border-slate-900 mt-4">
            <p className="text-[11px] text-slate-600 italic text-center mb-6">
              Certified that the marks recorded above are strictly as per the evaluated answer scripts and examination award rules of GHSS Larnoo.
            </p>
            
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-500"></div>
                <p className="font-bold text-slate-900">Signature of Subject Teacher</p>
                <p className="text-[10px] text-slate-500">Name & Designation</p>
              </div>

              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-500"></div>
                <p className="font-bold text-slate-900">Incharge Examination</p>
                <p className="text-[10px] text-slate-500">Examination Wing, GHSS Larnoo</p>
              </div>

              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-500"></div>
                <p className="font-bold text-slate-900">Principal / Head of Institution</p>
                <p className="text-[10px] text-slate-500">Seal & Signature</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
