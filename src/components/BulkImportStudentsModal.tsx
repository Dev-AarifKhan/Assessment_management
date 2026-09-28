import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { 
  Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, 
  X, FileText, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';

interface BulkImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStudentRow {
  raw: any;
  student: Student | null;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

export const BulkImportStudentsModal: React.FC<BulkImportStudentsModalProps> = ({ isOpen, onClose }) => {
  const { students, bulkAddStudents, config } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{ total: number; success: number } | null>(null);

  if (!isOpen) return null;

  // Generate Sample Data for Template Download
  const generateSampleData = () => [
    {
      "StudentId": "STU101",
      "Name": "Mohammad Umar Lone",
      "Parentage": "Abdul Rashid Lone",
      "Class": "10th",
      "RollNumber": "15",
      "Stream": "General",
      "Phone": "9419011223",
      "Gender": "Male",
      "Session": config.activeSession || "2025-2026"
    },
    {
      "StudentId": "STU102",
      "Name": "Zainab Fatima",
      "Parentage": "Showkat Ahmad Rather",
      "Class": "10th",
      "RollNumber": "16",
      "Stream": "General",
      "Phone": "9419099887",
      "Gender": "Female",
      "Session": config.activeSession || "2025-2026"
    },
    {
      "StudentId": "STU103",
      "Name": "Danish Nazir Bhat",
      "Parentage": "Nazir Ahmad Bhat",
      "Class": "12th",
      "RollNumber": "04",
      "Stream": "Medical",
      "Phone": "9797055443",
      "Gender": "Male",
      "Session": config.activeSession || "2025-2026"
    },
    {
      "StudentId": "STU104",
      "Name": "Iqra Bashir",
      "Parentage": "Bashir Ahmad Wani",
      "Class": "11th",
      "RollNumber": "09",
      "Stream": "Non-Medical",
      "Phone": "9622088776",
      "Gender": "Female",
      "Session": config.activeSession || "2025-2026"
    }
  ];

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    const data = generateSampleData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students_Template");

    if (format === 'csv') {
      XLSX.writeFile(wb, "GHSS_Larnoo_Students_Template.csv");
    } else {
      XLSX.writeFile(wb, "GHSS_Larnoo_Students_Template.xlsx");
    }
  };

  // Helper to extract value with various header name aliases
  const getField = (row: any, aliases: string[]): string => {
    for (const key of Object.keys(row)) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const alias of aliases) {
        if (normalizedKey === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          const val = row[key];
          return val !== undefined && val !== null ? String(val).trim() : '';
        }
      }
    }
    return '';
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setImportSummary(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        alert("The uploaded file contains no data rows.");
        setIsProcessing(false);
        return;
      }

      const existingIds = new Set(students.map(s => s.studentId.trim().toLowerCase()));

      const parsed: ParsedStudentRow[] = rawJson.map((row: any, idx: number) => {
        const studentId = getField(row, ['studentid', 'student id', 'id', 'admissionno', 'regno', 'stuid']);
        const name = getField(row, ['name', 'studentname', 'student name', 'fullname', 'candidate name']);
        const parentage = getField(row, ['parentage', 'fathername', 'father name', 'fathers name', 'guardian', 'father']);
        let className = getField(row, ['class', 'classname', 'class name', 'grade']);
        const rollNumber = getField(row, ['rollnumber', 'roll number', 'rollno', 'roll no', 'roll']);
        let stream = getField(row, ['stream', 'discipline', 'subject stream']);
        const phone = getField(row, ['phone', 'mobile', 'contact', 'cell', 'phonenumber']);
        let gender = getField(row, ['gender', 'sex']);
        const session = getField(row, ['session', 'academicsession', 'academic session', 'year']) || config.activeSession || '2025-2026';

        // Format class e.g. "10" -> "10th"
        if (/^\d+$/.test(className)) {
          className = `${className}th`;
        } else if (!className) {
          className = '10th';
        }

        // Format gender
        if (/^f/i.test(gender)) {
          gender = 'Female';
        } else {
          gender = 'Male';
        }

        if (!stream) {
          stream = (className === '11th' || className === '12th') ? 'Arts' : 'General';
        }

        const errors: string[] = [];
        if (!studentId) errors.push('Student ID is required (e.g. STU1, STU2)');
        if (!name) errors.push('Name is required');
        if (!parentage) errors.push('Parentage is required');
        if (!rollNumber) errors.push('Roll Number is required');

        const isDuplicate = existingIds.has(studentId.toLowerCase());

        const isValid = errors.length === 0;

        const studentObj: Student | null = isValid ? {
          studentId,
          name,
          parentage,
          className,
          rollNumber,
          stream,
          phone,
          gender,
          academicSession: session,
          admissionDate: new Date().toISOString().split('T')[0]
        } : null;

        return {
          raw: row,
          student: studentObj,
          isValid,
          errors,
          isDuplicate
        };
      });

      setParsedRows(parsed);
    } catch (err: any) {
      console.error(err);
      alert("Failed to parse file: " + (err.message || 'Invalid format'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCommitImport = () => {
    const validStudents = parsedRows
      .filter(r => r.isValid && r.student !== null)
      .map(r => r.student as Student);

    if (validStudents.length === 0) {
      alert("No valid student rows to import.");
      return;
    }

    bulkAddStudents(validStudents);
    setImportSummary({
      total: parsedRows.length,
      success: validStudents.length
    });

    // Reset after small delay or allow user to see confirmation
    setTimeout(() => {
      onClose();
      // Reset state for next use
      setParsedRows([]);
      setFileName('');
      setImportSummary(null);
    }, 1800);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isValid && r.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                Bulk Add Students (CSV / Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload a spreadsheet to bulk import students into the school database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Success Banner */}
          {importSummary && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
              <CheckCircle size={22} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  Successfully imported {importSummary.success} student records!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Database updated. Closing modal...
                </p>
              </div>
            </div>
          )}

          {/* Download Sample Templates Section */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <FileText size={14} /> Need a template with the correct column headers?
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">
                Download a pre-formatted template with sample student entries (StudentId, Name, Parentage, Class, RollNumber, Stream, Phone, Gender, Session).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadTemplate('xlsx')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Download size={13} />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Download size={13} />
                <span>CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Dropzone Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {fileName ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{fileName}</span>
                ) : (
                  <>Drag & drop your CSV or Excel file here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span></>
                )}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </p>
            </div>
          </div>

          {/* Parsed Results & Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              
              {/* Summary Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Total in File: </span>
                    <span className="font-bold text-slate-900 dark:text-white">{parsedRows.length}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Valid: </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{validCount}</span>
                  </div>
                  {duplicateCount > 0 && (
                    <div>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Existing ID (Will Update): </span>
                      <span className="font-bold text-amber-700 dark:text-amber-300">{duplicateCount}</span>
                    </div>
                  )}
                  {invalidCount > 0 && (
                    <div>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Errors: </span>
                      <span className="font-bold text-rose-700 dark:text-rose-300">{invalidCount}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                >
                  <RefreshCw size={12} />
                  <span>Clear & Upload Different File</span>
                </button>
              </div>

              {/* Preview Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider sticky top-0 z-10 text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Parentage</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3">Roll</th>
                        <th className="py-2.5 px-3">Stream</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedRows.map((row, index) => {
                        const s = row.student;
                        return (
                          <tr 
                            key={index}
                            className={`transition ${
                              !row.isValid 
                                ? 'bg-rose-50/60 dark:bg-rose-950/20' 
                                : row.isDuplicate
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20'
                                  : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-2 px-3 whitespace-nowrap">
                              {row.isValid ? (
                                row.isDuplicate ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                    <AlertTriangle size={10} /> Update ID
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                    <CheckCircle size={10} /> Ready
                                  </span>
                                )
                              ) : (
                                <span 
                                  title={row.errors.join(', ')}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 cursor-help"
                                >
                                  <AlertCircle size={10} /> Invalid
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                              {s?.studentId || <span className="text-rose-500 italic">Missing</span>}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                              {s?.name || <span className="text-rose-500 italic">Missing</span>}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                              {s?.parentage || <span className="text-rose-500 italic">Missing</span>}
                            </td>
                            <td className="py-2 px-3 font-medium">
                              Class {s?.className || '-'}
                            </td>
                            <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                              {s?.rollNumber || '-'}
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                              {s?.stream || 'General'}
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                              {s?.phone || '-'}
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {s?.academicSession || config.activeSession}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {invalidCount > 0 && (
                <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle size={14} /> Note: {invalidCount} invalid rows with missing Student ID or mandatory data will be skipped automatically during import.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {parsedRows.length > 0 ? (
              <span>Ready to add <strong className="text-slate-900 dark:text-white">{validCount}</strong> students to academic database</span>
            ) : (
              <span>Select or drop a CSV or Excel file to begin</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleCommitImport}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md transition"
            >
              <span>Bulk Add {validCount > 0 ? `(${validCount}) Students` : ''}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
