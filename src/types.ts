export interface Student {
  studentId: string;
  name: string;
  parentage: string;
  className: string;
  rollNumber: string;
  academicSession: string;
  stream: string;
  phone: string;
  gender: string;
  admissionDate: string;
}

export interface Assessment {
  assessmentId: string;
  name: string;
  type: string;
  subject: string;
  className: string;
  academicSession: string;
  assessmentDate: string;
  maxMarks: number;
  passingPercentage: number;
}

export interface MarkEntry {
  markEntryId: string;
  assessmentId: string;
  studentId: string;
  academicSession: string;
  className: string;
  subject: string;
  maxMarks: number;
  obtainedMarks: number | null;
  status: 'Present' | 'Absent' | 'Medical';
  result: 'Pass' | 'Fail' | 'Absent';
  remarks: string;
}

export interface SchoolConfig {
  schoolName: string;
  schoolCode: string;
  schoolAddress: string;
  affiliation: string;
  passingPercentage: number;
  activeSession: string;
}

export type UserRole = 'admin' | 'teacher';
export type ActiveTab = 'dashboard' | 'students' | 'assessments' | 'marks' | 'class-award' | 'marksheet' | 'id-cards' | 'settings';
