import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Assessment, MarkEntry, SchoolConfig, UserRole, ActiveTab } from '../types';
import { initialConfig, initialStudents, initialAssessments, initialMarks } from '../data/initialData';
import { normalizeClassName } from '../utils/classUtils';

interface AppContextType {
  config: SchoolConfig;
  updateConfig: (newConfig: Partial<SchoolConfig>) => void;
  students: Student[];
  addStudent: (student: Student) => void;
  bulkAddStudents: (newStudents: Student[]) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  bulkDeleteStudents: (studentIds: string[]) => void;
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (assessment: Assessment) => void;
  deleteAssessment: (assessmentId: string) => void;
  markEntries: MarkEntry[];
  saveMarkEntry: (entry: MarkEntry) => void;
  saveMultipleMarkEntries: (entries: MarkEntry[]) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedAssessmentId: string;
  setSelectedAssessmentId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('ghss_config');
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ghss_students');
    const raw: Student[] = saved ? JSON.parse(saved) : initialStudents;
    return raw.map(s => ({
      ...s,
      className: normalizeClassName(s.className)
    }));
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('ghss_assessments');
    if (!saved) return [];
    try {
      const parsed: Assessment[] = JSON.parse(saved);
      const dummyIds = new Set([
        'ASM-25-10-MATH-UT1',
        'ASM-25-10-ENG-MT',
        'ASM-25-10-SCI-UT1',
        'ASM-25-12-PHY-UT1',
        'ASM-24-10-MATH-ANNUAL'
      ]);
      return parsed
        .filter(a => !dummyIds.has(a.assessmentId))
        .map(a => ({ ...a, className: normalizeClassName(a.className) }));
    } catch {
      return [];
    }
  });

  const [markEntries, setMarkEntries] = useState<MarkEntry[]>(() => {
    const saved = localStorage.getItem('ghss_marks');
    if (!saved) return [];
    try {
      const parsed: MarkEntry[] = JSON.parse(saved);
      const dummyIds = new Set([
        'ASM-25-10-MATH-UT1',
        'ASM-25-10-ENG-MT',
        'ASM-25-10-SCI-UT1',
        'ASM-25-12-PHY-UT1',
        'ASM-24-10-MATH-ANNUAL'
      ]);
      return parsed
        .filter(m => !dummyIds.has(m.assessmentId))
        .map(m => ({ ...m, className: normalizeClassName(m.className) }));
    } catch {
      return [];
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('ghss_role');
    return (saved as UserRole) || 'admin';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ghss_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('GHSS-25-1001');

  // Keep selected assessment ID in sync
  useEffect(() => {
    if (assessments.length > 0) {
      if (!selectedAssessmentId || !assessments.some(a => a.assessmentId === selectedAssessmentId)) {
        setSelectedAssessmentId(assessments[0].assessmentId);
      }
    } else {
      if (selectedAssessmentId !== '') {
        setSelectedAssessmentId('');
      }
    }
  }, [assessments, selectedAssessmentId]);

  useEffect(() => {
    localStorage.setItem('ghss_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('ghss_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ghss_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('ghss_marks', JSON.stringify(markEntries));
  }, [markEntries]);

  useEffect(() => {
    localStorage.setItem('ghss_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('ghss_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const updateConfig = (newConfig: Partial<SchoolConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const addStudent = (student: Student) => {
    const normalized = { ...student, className: normalizeClassName(student.className) };
    setStudents(prev => [normalized, ...prev]);
  };

  const bulkAddStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      // Map existing by lowercase studentId
      const map = new Map<string, Student>();
      // Keep existing with normalized className
      prev.forEach(s => map.set(s.studentId.trim().toLowerCase(), { ...s, className: normalizeClassName(s.className) }));
      // Overwrite or append new students with normalized className
      newStudents.forEach(s => {
        const norm = { ...s, className: normalizeClassName(s.className) };
        map.set(norm.studentId.trim().toLowerCase(), norm);
      });
      return Array.from(map.values());
    });
  };

  const updateStudent = (student: Student) => {
    const normalized = { ...student, className: normalizeClassName(student.className) };
    setStudents(prev => prev.map(s => s.studentId === normalized.studentId ? normalized : s));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.studentId !== studentId));
    setMarkEntries(prev => prev.filter(m => m.studentId !== studentId));
  };

  const bulkDeleteStudents = (studentIds: string[]) => {
    const idSet = new Set(studentIds);
    setStudents(prev => prev.filter(s => !idSet.has(s.studentId)));
    setMarkEntries(prev => prev.filter(m => !idSet.has(m.studentId)));
  };

  const addAssessment = (assessment: Assessment) => {
    const normalized = { ...assessment, className: normalizeClassName(assessment.className) };
    setAssessments(prev => [normalized, ...prev]);
    setSelectedAssessmentId(normalized.assessmentId);
  };

  const updateAssessment = (assessment: Assessment) => {
    const normalized = { ...assessment, className: normalizeClassName(assessment.className) };
    setAssessments(prev => prev.map(a => a.assessmentId === normalized.assessmentId ? normalized : a));
  };

  const deleteAssessment = (assessmentId: string) => {
    setAssessments(prev => prev.filter(a => a.assessmentId !== assessmentId));
    setMarkEntries(prev => prev.filter(m => m.assessmentId !== assessmentId));
    if (selectedAssessmentId === assessmentId) {
      setSelectedAssessmentId('');
    }
  };

  const saveMarkEntry = (entry: MarkEntry) => {
    const normalized = { ...entry, className: normalizeClassName(entry.className) };
    setMarkEntries(prev => {
      const idx = prev.findIndex(m => m.markEntryId === normalized.markEntryId || (m.assessmentId === normalized.assessmentId && m.studentId === normalized.studentId));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = normalized;
        return copy;
      }
      return [...prev, normalized];
    });
  };

  const saveMultipleMarkEntries = (entries: MarkEntry[]) => {
    setMarkEntries(prev => {
      const copy = [...prev];
      entries.forEach(newEntry => {
        const normalized = { ...newEntry, className: normalizeClassName(newEntry.className) };
        const idx = copy.findIndex(m => m.markEntryId === normalized.markEntryId || (m.assessmentId === normalized.assessmentId && m.studentId === normalized.studentId));
        if (idx >= 0) {
          copy[idx] = normalized;
        } else {
          copy.push(normalized);
        }
      });
      return copy;
    });
  };

  const resetToDefaults = () => {
    setConfig(initialConfig);
    setStudents(initialStudents.map(s => ({ ...s, className: normalizeClassName(s.className) })));
    setAssessments([]);
    setMarkEntries([]);
    setRole('admin');
    setSelectedAssessmentId('');
    setSelectedStudentId('GHSS-25-1001');
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        config,
        updateConfig,
        students,
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        bulkDeleteStudents,
        assessments,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        markEntries,
        saveMarkEntry,
        saveMultipleMarkEntries,
        role,
        setRole,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        selectedAssessmentId,
        setSelectedAssessmentId,
        selectedStudentId,
        setSelectedStudentId,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
