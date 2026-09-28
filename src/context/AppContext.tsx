import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Assessment, MarkEntry, SchoolConfig, UserRole, ActiveTab } from '../types';
import { initialConfig } from '../data/initialData';
import { normalizeClassName } from '../utils/classUtils';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDoc
} from 'firebase/firestore';

interface AppContextType {
  config: SchoolConfig;
  updateConfig: (newConfig: Partial<SchoolConfig>) => Promise<void>;
  students: Student[];
  addStudent: (student: Student) => Promise<void>;
  bulkAddStudents: (newStudents: Student[]) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  bulkDeleteStudents: (studentIds: string[]) => Promise<void>;
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => Promise<void>;
  updateAssessment: (assessment: Assessment) => Promise<void>;
  deleteAssessment: (assessmentId: string) => Promise<void>;
  markEntries: MarkEntry[];
  saveMarkEntry: (entry: MarkEntry) => Promise<void>;
  saveMultipleMarkEntries: (entries: MarkEntry[]) => Promise<void>;
  role: UserRole;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedAssessmentId: string;
  setSelectedAssessmentId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  resetToDefaults: () => Promise<void>;
  loadingData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const role: UserRole = userProfile?.role || 'teacher';

  const [config, setConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('ghss_config');
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ghss_students');
    if (!saved) return [];
    try {
      const raw: Student[] = JSON.parse(saved);
      return raw.map(s => ({ ...s, className: normalizeClassName(s.className) }));
    } catch {
      return [];
    }
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('ghss_assessments');
    if (!saved) return [];
    try {
      const raw: Assessment[] = JSON.parse(saved);
      return raw.map(a => ({ ...a, className: normalizeClassName(a.className) }));
    } catch {
      return [];
    }
  });

  const [markEntries, setMarkEntries] = useState<MarkEntry[]>(() => {
    const saved = localStorage.getItem('ghss_marks');
    if (!saved) return [];
    try {
      const raw: MarkEntry[] = JSON.parse(saved);
      return raw.map(m => ({ ...m, className: normalizeClassName(m.className) }));
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ghss_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Sync with Firestore when authenticated
  useEffect(() => {
    if (!currentUser) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // 1. Sync School Config
    const configDocRef = doc(db, 'config', 'school');
    const unsubConfig = onSnapshot(configDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SchoolConfig;
        setConfig(data);
        localStorage.setItem('ghss_config', JSON.stringify(data));
      } else {
        // Initialize config document in Firestore if absent
        if (isAdmin) {
          setDoc(configDocRef, initialConfig).catch(console.error);
        }
      }
    }, (err) => console.warn('Config snapshot listener:', err));

    // 2. Sync Students
    const studentsColRef = collection(db, 'students');
    const unsubStudents = onSnapshot(studentsColRef, (snap) => {
      const list: Student[] = [];
      snap.forEach(d => {
        const st = d.data() as Student;
        list.push({ ...st, className: normalizeClassName(st.className) });
      });
      // Sort by class then roll number
      list.sort((a, b) => {
        const rollA = parseInt(a.rollNumber, 10) || 0;
        const rollB = parseInt(b.rollNumber, 10) || 0;
        return rollA - rollB;
      });
      setStudents(list);
      localStorage.setItem('ghss_students', JSON.stringify(list));
      setLoadingData(false);
    }, (err) => {
      console.warn('Students snapshot listener:', err);
      setLoadingData(false);
    });

    // 3. Sync Assessments
    const assessmentsColRef = collection(db, 'assessments');
    const unsubAssessments = onSnapshot(assessmentsColRef, (snap) => {
      const list: Assessment[] = [];
      snap.forEach(d => {
        const asm = d.data() as Assessment;
        list.push({ ...asm, className: normalizeClassName(asm.className) });
      });
      setAssessments(list);
      localStorage.setItem('ghss_assessments', JSON.stringify(list));
    }, (err) => console.warn('Assessments snapshot listener:', err));

    // 4. Sync Mark Entries
    const marksColRef = collection(db, 'marks');
    const unsubMarks = onSnapshot(marksColRef, (snap) => {
      const list: MarkEntry[] = [];
      snap.forEach(d => {
        const m = d.data() as MarkEntry;
        list.push({ ...m, className: normalizeClassName(m.className) });
      });
      setMarkEntries(list);
      localStorage.setItem('ghss_marks', JSON.stringify(list));
    }, (err) => console.warn('Marks snapshot listener:', err));

    return () => {
      unsubConfig();
      unsubStudents();
      unsubAssessments();
      unsubMarks();
    };
  }, [currentUser, isAdmin]);

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

  // Keep selected student ID in sync
  useEffect(() => {
    if (students.length > 0) {
      if (!selectedStudentId || !students.some(s => s.studentId === selectedStudentId)) {
        setSelectedStudentId(students[0].studentId);
      }
    } else {
      if (selectedStudentId !== '') {
        setSelectedStudentId('');
      }
    }
  }, [students, selectedStudentId]);

  // Theme synchronization
  useEffect(() => {
    localStorage.setItem('ghss_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Route protection: If teacher is on admin-only tabs, redirect to dashboard
  useEffect(() => {
    if (!isAdmin && (activeTab === 'users' || activeTab === 'settings' || activeTab === 'id-cards')) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  // MUTATIONS (Synchronized with Cloud Firestore)

  const updateConfig = async (newConfig: Partial<SchoolConfig>) => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Only an Administrator can update school configurations.");
    }
    const merged = { ...config, ...newConfig };
    setConfig(merged);
    localStorage.setItem('ghss_config', JSON.stringify(merged));
    await setDoc(doc(db, 'config', 'school'), {
      ...merged,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile?.uid || ''
    });
  };

  const addStudent = async (student: Student) => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Only an Administrator can enroll new students.");
    }
    const normalized = { ...student, className: normalizeClassName(student.className) };
    setStudents(prev => [normalized, ...prev]);
    await setDoc(doc(db, 'students', normalized.studentId), {
      ...normalized,
      createdAt: new Date().toISOString(),
      createdBy: userProfile?.uid || ''
    });
  };

  const bulkAddStudents = async (newStudents: Student[]) => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Only an Administrator can import students.");
    }
    
    // Optimistic local update
    setStudents(prev => {
      const map = new Map<string, Student>();
      prev.forEach(s => map.set(s.studentId.trim().toLowerCase(), s));
      newStudents.forEach(s => {
        const norm = { ...s, className: normalizeClassName(s.className) };
        map.set(norm.studentId.trim().toLowerCase(), norm);
      });
      return Array.from(map.values());
    });

    // Firestore batch write (chunks of 450 to stay within Firestore 500-op limit)
    const chunkSize = 400;
    for (let i = 0; i < newStudents.length; i += chunkSize) {
      const chunk = newStudents.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(s => {
        const norm = { ...s, className: normalizeClassName(s.className) };
        const ref = doc(db, 'students', norm.studentId);
        batch.set(ref, {
          ...norm,
          createdAt: new Date().toISOString(),
          createdBy: userProfile?.uid || ''
        });
      });
      await batch.commit();
    }
  };

  const updateStudent = async (student: Student) => {
    const normalized = { ...student, className: normalizeClassName(student.className) };
    setStudents(prev => prev.map(s => s.studentId === normalized.studentId ? normalized : s));
    await setDoc(doc(db, 'students', normalized.studentId), {
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile?.uid || ''
    }, { merge: true });

    // Also keep studentName and rollNumber synced in any existing markEntries for this student
    const studentMarks = markEntries.filter(m => m.studentId === normalized.studentId);
    if (studentMarks.length > 0) {
      setMarkEntries(prev =>
        prev.map(m =>
          m.studentId === normalized.studentId
            ? { ...m, studentName: normalized.name, rollNumber: normalized.rollNumber }
            : m
        )
      );
      const batch = writeBatch(db);
      studentMarks.forEach(m => {
        batch.set(
          doc(db, 'marks', m.markEntryId),
          {
            studentName: normalized.name,
            rollNumber: normalized.rollNumber,
            updatedAt: new Date().toISOString(),
            updatedBy: userProfile?.uid || ''
          },
          { merge: true }
        );
      });
      await batch.commit();
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Only an Administrator can delete candidate records.");
    }
    setStudents(prev => prev.filter(s => s.studentId !== studentId));
    setMarkEntries(prev => prev.filter(m => m.studentId !== studentId));
    await deleteDoc(doc(db, 'students', studentId));
  };

  const bulkDeleteStudents = async (studentIds: string[]) => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Only an Administrator can perform bulk deletion of students.");
    }
    const idSet = new Set(studentIds);
    setStudents(prev => prev.filter(s => !idSet.has(s.studentId)));
    setMarkEntries(prev => prev.filter(m => !idSet.has(m.studentId)));

    const chunkSize = 400;
    for (let i = 0; i < studentIds.length; i += chunkSize) {
      const chunk = studentIds.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(id => {
        batch.delete(doc(db, 'students', id));
      });
      await batch.commit();
    }
  };

  const addAssessment = async (assessment: Assessment) => {
    const normalized = { ...assessment, className: normalizeClassName(assessment.className) };
    setAssessments(prev => [normalized, ...prev]);
    setSelectedAssessmentId(normalized.assessmentId);
    await setDoc(doc(db, 'assessments', normalized.assessmentId), {
      ...normalized,
      createdAt: new Date().toISOString(),
      createdBy: userProfile?.uid || ''
    });
  };

  const updateAssessment = async (assessment: Assessment) => {
    const normalized = { ...assessment, className: normalizeClassName(assessment.className) };
    setAssessments(prev => prev.map(a => a.assessmentId === normalized.assessmentId ? normalized : a));
    await setDoc(doc(db, 'assessments', normalized.assessmentId), {
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile?.uid || ''
    }, { merge: true });
  };

  const deleteAssessment = async (assessmentId: string) => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Teachers cannot delete historical assessment records. Only an Administrator can delete assessments.");
    }
    setAssessments(prev => prev.filter(a => a.assessmentId !== assessmentId));
    setMarkEntries(prev => prev.filter(m => m.assessmentId !== assessmentId));
    if (selectedAssessmentId === assessmentId) {
      setSelectedAssessmentId('');
    }
    await deleteDoc(doc(db, 'assessments', assessmentId));
  };

  const saveMarkEntry = async (entry: MarkEntry) => {
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

    await setDoc(doc(db, 'marks', normalized.markEntryId), {
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile?.uid || ''
    });
  };

  const saveMultipleMarkEntries = async (entries: MarkEntry[]) => {
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

    const chunkSize = 400;
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(entry => {
        const normalized = { ...entry, className: normalizeClassName(entry.className) };
        const ref = doc(db, 'marks', normalized.markEntryId);
        batch.set(ref, {
          ...normalized,
          updatedAt: new Date().toISOString(),
          updatedBy: userProfile?.uid || ''
        });
      });
      await batch.commit();
    }
  };

  const resetToDefaults = async () => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Only an Administrator can reset system databases.");
    }
    setConfig(initialConfig);
    setStudents([]);
    setAssessments([]);
    setMarkEntries([]);
    setSelectedAssessmentId('');
    setSelectedStudentId('');
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
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        selectedAssessmentId,
        setSelectedAssessmentId,
        selectedStudentId,
        setSelectedStudentId,
        resetToDefaults,
        loadingData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
