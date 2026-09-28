import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Assessment, MarkEntry, SchoolConfig, UserRole, ActiveTab } from '../types';
import { initialConfig, initialStudents, initialAssessments, initialMarks } from '../data/initialData';

interface AppContextType {
  config: SchoolConfig;
  updateConfig: (newConfig: Partial<SchoolConfig>) => void;
  students: Student[];
  addStudent: (student: Student) => void;
  bulkAddStudents: (newStudents: Student[]) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (assessment: Assessment) => void;
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
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('ghss_assessments');
    return saved ? JSON.parse(saved) : initialAssessments;
  });

  const [markEntries, setMarkEntries] = useState<MarkEntry[]>(() => {
    const saved = localStorage.getItem('ghss_marks');
    return saved ? JSON.parse(saved) : initialMarks;
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
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('ASM-25-10-MATH-UT1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('GHSS-25-1001');

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
    setStudents(prev => [student, ...prev]);
  };

  const bulkAddStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      // Map existing by lowercase studentId
      const map = new Map<string, Student>();
      // Keep existing
      prev.forEach(s => map.set(s.studentId.trim().toLowerCase(), s));
      // Overwrite or append new students
      newStudents.forEach(s => map.set(s.studentId.trim().toLowerCase(), s));
      return Array.from(map.values());
    });
  };

  const updateStudent = (student: Student) => {
    setStudents(prev => prev.map(s => s.studentId === student.studentId ? student : s));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.studentId !== studentId));
  };

  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [assessment, ...prev]);
  };

  const updateAssessment = (assessment: Assessment) => {
    setAssessments(prev => prev.map(a => a.assessmentId === assessment.assessmentId ? assessment : a));
  };

  const saveMarkEntry = (entry: MarkEntry) => {
    setMarkEntries(prev => {
      const idx = prev.findIndex(m => m.markEntryId === entry.markEntryId || (m.assessmentId === entry.assessmentId && m.studentId === entry.studentId));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
  };

  const saveMultipleMarkEntries = (entries: MarkEntry[]) => {
    setMarkEntries(prev => {
      const copy = [...prev];
      entries.forEach(newEntry => {
        const idx = copy.findIndex(m => m.markEntryId === newEntry.markEntryId || (m.assessmentId === newEntry.assessmentId && m.studentId === newEntry.studentId));
        if (idx >= 0) {
          copy[idx] = newEntry;
        } else {
          copy.push(newEntry);
        }
      });
      return copy;
    });
  };

  const resetToDefaults = () => {
    setConfig(initialConfig);
    setStudents(initialStudents);
    setAssessments(initialAssessments);
    setMarkEntries(initialMarks);
    setRole('admin');
    setSelectedAssessmentId('ASM-25-10-MATH-UT1');
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
        assessments,
        addAssessment,
        updateAssessment,
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
