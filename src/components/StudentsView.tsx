import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { normalizeClassName } from '../utils/classUtils';
import { 
  Search, 
  UserPlus, 
  FileText, 
  CreditCard, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  FileSpreadsheet, 
  AlertTriangle, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { CLASSES_LIST } from '../data/initialData';
import { BulkImportStudentsModal } from './BulkImportStudentsModal';

export const StudentsView: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, bulkDeleteStudents, role, setSelectedStudentId, setActiveTab } = useApp();
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    parentage: '',
    className: '10th',
    rollNumber: '',
    stream: 'General',
    phone: '',
    gender: 'Male',
    academicSession: '2025-2026',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  // Dynamically compile all class options present in the school
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

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === 'All' || normalizeClassName(s.className) === normalizeClassName(selectedClass);
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.parentage.toLowerCase().includes(q);
    return matchesClass && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const manualId = formData.studentId.trim();
    if (!manualId) {
      alert('Please provide a Student ID (e.g. STU1, STU2, STU101)');
      return;
    }
    if (!formData.name || !formData.rollNumber) {
      alert('Please fill Name and Roll Number');
      return;
    }

    if (students.some(s => s.studentId.toLowerCase() === manualId.toLowerCase())) {
      alert(`Student ID "${manualId}" already exists! Please enter a unique Student ID.`);
      return;
    }

    const newStudent: Student = {
      ...formData,
      studentId: manualId,
    };

    addStudent(newStudent);
    setShowAddModal(false);
    setFormData({
      studentId: '',
      name: '',
      parentage: '',
      className: '10th',
      rollNumber: '',
      stream: 'General',
      phone: '',
      gender: 'Male',
      academicSession: '2025-2026',
      admissionDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editingStudent.name.trim() || !editingStudent.rollNumber.trim()) {
      alert('Please fill Name and Roll Number');
      return;
    }

    await updateStudent({
      ...editingStudent,
      name: editingStudent.name.trim(),
      parentage: editingStudent.parentage.trim(),
      rollNumber: editingStudent.rollNumber.trim(),
      stream: editingStudent.stream.trim() || 'General',
      phone: editingStudent.phone.trim(),
    });
    const updatedName = editingStudent.name.trim();
    setEditingStudent(null);
    setFeedbackToast(`Successfully updated information for ${updatedName}.`);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  // Bulk selection calculations
  const selectedFilteredCount = filteredStudents.filter(s => selectedStudentIds.has(s.studentId)).length;
  const isAllFilteredSelected = filteredStudents.length > 0 && selectedFilteredCount === filteredStudents.length;
  const isSomeFilteredSelected = selectedFilteredCount > 0 && selectedFilteredCount < filteredStudents.length;
  const totalSelectedCount = selectedStudentIds.size;

  const toggleSelectAllFiltered = () => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        filteredStudents.forEach(s => next.delete(s.studentId));
      } else {
        filteredStudents.forEach(s => next.add(s.studentId));
      }
      return next;
    });
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      filteredStudents.forEach(s => next.add(s.studentId));
      return next;
    });
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(new Set(students.map(s => s.studentId)));
  };

  const clearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  const handleConfirmBulkDelete = () => {
    const ids = Array.from(selectedStudentIds);
    if (ids.length === 0) return;

    bulkDeleteStudents(ids);
    const count = ids.length;
    clearSelection();
    setShowBulkDeleteModal(false);
    setFeedbackToast(`Successfully deleted ${count} student record${count > 1 ? 's' : ''} and all associated assessment marks.`);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-5">
      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 rounded"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Student Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enrolled candidates for Academic Session 2025-2026 across secondary & higher secondary streams
          </p>
        </div>

        {role === 'admin' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
            >
              <FileSpreadsheet size={16} />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition ${
                totalSelectedCount > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400 ring-offset-1'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-900/50'
              }`}
              title="Delete multiple students in bulk"
            >
              <Trash2 size={16} />
              <span>
                {totalSelectedCount > 0
                  ? `Bulk Delete (${totalSelectedCount})`
                  : 'Bulk Delete'}
              </span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow transition"
            >
              <UserPlus size={16} />
              <span>Add Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Items Bulk Action Banner */}
      {role === 'admin' && totalSelectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
              {totalSelectedCount}
            </span>
            <span className="font-semibold">
              student{totalSelectedCount > 1 ? 's' : ''} selected
            </span>
            {!isAllFilteredSelected && filteredStudents.length > 0 && (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="ml-2 text-xs text-indigo-700 dark:text-indigo-400 hover:underline font-semibold"
              >
                Select all {filteredStudents.length} in this view
              </button>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="ml-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({totalSelectedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedClass('All')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedClass === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Classes ({students.length})
          </button>
          {allClasses.map((cls) => {
            const count = students.filter(s => normalizeClassName(s.className) === normalizeClassName(cls)).length;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedClass === cls
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Class {cls} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                {role === 'admin' && (
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeFilteredSelected;
                      }}
                      onChange={toggleSelectAllFiltered}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer"
                      title={isAllFilteredSelected ? "Deselect all filtered" : "Select all filtered"}
                      aria-label="Select all filtered students"
                    />
                  </th>
                )}
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Parentage</th>
                <th className="py-3 px-4">Class & Stream</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 8 : 7} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-bold text-slate-700 dark:text-slate-300">No students enrolled yet</p>
                      <p className="text-xs text-slate-400">All test data has been cleared. Use &quot;Bulk Import&quot; to upload your student roster from Excel/CSV or click &quot;Enroll Student&quot; to add candidates manually.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 8 : 7} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudentIds.has(s.studentId);
                  return (
                    <tr 
                      key={s.studentId} 
                      className={`transition ${
                        isSelected 
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {role === 'admin' && (
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(s.studentId)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer"
                            aria-label={`Select student ${s.name}`}
                          />
                        </td>
                      )}
                      <td className="py-3 px-4 font-bold text-indigo-700 dark:text-indigo-400">
                        {s.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {s.name}
                        <span className="block text-[11px] text-slate-500 font-normal">{s.gender}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {s.parentage}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-semibold text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                          {s.className}
                        </span>
                        <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">{s.stream}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {s.studentId}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {s.phone}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingStudent({ ...s })}
                            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition"
                            title="Edit Student Information"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudentId(s.studentId);
                              setActiveTab('marksheet');
                            }}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
                            title="Generate Official Marksheet"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudentId(s.studentId);
                              setActiveTab('id-cards');
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition"
                            title="Print Student ID Card"
                          >
                            <CreditCard size={16} />
                          </button>
                          {role === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove student ${s.name}?`)) {
                                  deleteStudent(s.studentId);
                                  setSelectedStudentIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(s.studentId);
                                    return next;
                                  });
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                              title="Delete Student Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Student Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Student ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{editingStudent.studentId}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter student full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Father&apos;s Name (Parentage) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.parentage}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentage: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter father's / guardian's name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={editingStudent.className}
                    onChange={(e) => setEditingStudent({ ...editingStudent, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {allClasses.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.rollNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stream
                  </label>
                  <input
                    type="text"
                    value={editingStudent.stream}
                    onChange={(e) => setEditingStudent({ ...editingStudent, stream: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="General / Medical / Non-Med"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter contact phone number"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register New Student</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {/* Student ID Field (Manual STU1, STU2, etc.) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Student ID * <span className="text-slate-500 font-normal">(Manually provided, e.g. STU1, STU2...)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const maxNum = students.reduce((acc, s) => {
                        const m = s.studentId.match(/^STU(\d+)$/i);
                        return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
                      }, 0);
                      setFormData({ ...formData, studentId: `STU${maxNum + 1}` });
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    + Suggest Next (STU{students.reduce((acc, s) => {
                      const m = s.studentId.match(/^STU(\d+)$/i);
                      return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
                    }, 0) + 1})
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  placeholder="e.g. STU1, STU2, STU101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter student full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Father's Name (Parentage) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentage}
                    onChange={(e) => setFormData({ ...formData, parentage: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter father's / guardian's name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {CLASSES_LIST.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stream
                  </label>
                  <input
                    type="text"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="General / Medical / Non-Med"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter contact phone number"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import CSV / Excel Modal */}
      <BulkImportStudentsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />

      {/* Bulk Delete Confirmation & Management Modal */}
      {showBulkDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/70 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm flex-shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Bulk Delete Students
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    Permanent and destructive student record operation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {totalSelectedCount === 0 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">No students are currently selected</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Choose a quick selection option below or close this window to check individual student boxes in the directory table.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      disabled={filteredStudents.length === 0}
                      className="p-3.5 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800 transition disabled:opacity-50"
                    >
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Current View ({filteredStudents.length} students)
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select all students matching current class filter ({selectedClass}) & search
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={selectAllStudents}
                      disabled={students.length === 0}
                      className="p-3.5 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800 transition disabled:opacity-50"
                    >
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Entire School ({students.length} students)
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select every registered student across all classes & streams
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
                    <p className="font-bold">
                      Warning: You are about to permanently delete {totalSelectedCount} student{totalSelectedCount > 1 ? 's' : ''}.
                    </p>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                      All corresponding examination scores, marksheet entries, and award roll data for these students will also be wiped from the system.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                    <span>Selected Students to be Deleted ({totalSelectedCount})</span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Clear All Selections
                    </button>
                  </div>

                  {/* Scrollable list of students */}
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-1">
                    {students
                      .filter(s => selectedStudentIds.has(s.studentId))
                      .map(s => (
                        <div
                          key={s.studentId}
                          className="flex items-center justify-between py-2 px-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono w-14">
                              {s.rollNumber}
                            </span>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {s.name}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 ml-2">
                                (Class {s.className} • {s.stream})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-400">
                              {s.studentId}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSelectStudent(s.studentId)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition"
                              title="Remove from deletion selection"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={totalSelectedCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
                <span>
                  Permanently Delete {totalSelectedCount > 0 ? `(${totalSelectedCount})` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
