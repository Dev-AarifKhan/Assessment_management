import { Student, Assessment, MarkEntry, SchoolConfig } from '../types';

export const initialConfig: SchoolConfig = {
  schoolName: "Government Higher Secondary School Larnoo",
  schoolCode: "GHSS-LRN",
  schoolAddress: "Larnoo, Anantnag, Jammu & Kashmir - 192202",
  affiliation: "Affiliated to Jammu and Kashmir Board of School Education (JKBOSE)",
  passingPercentage: 35.0,
  activeSession: "2025-2026",
};

export const initialStudents: Student[] = [
  // Class 10th - 2025-2026
  {
    studentId: "GHSS-25-1001",
    name: "Sahil Ahmad Wani",
    parentage: "Mohammad Shafi Wani",
    className: "10th",
    rollNumber: "1",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9419012345",
    gender: "Male",
    admissionDate: "2024-03-10"
  },
  {
    studentId: "GHSS-25-1002",
    name: "Mehvish Jan",
    parentage: "Ghulam Hassan Rather",
    className: "10th",
    rollNumber: "2",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9419054321",
    gender: "Female",
    admissionDate: "2024-03-12"
  },
  {
    studentId: "GHSS-25-1003",
    name: "Faizan Bashir",
    parentage: "Bashir Ahmad Dar",
    className: "10th",
    rollNumber: "3",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9797098765",
    gender: "Male",
    admissionDate: "2024-03-15"
  },
  {
    studentId: "GHSS-25-1004",
    name: "Insha Rehman",
    parentage: "Abdul Rehman Bhat",
    className: "10th",
    rollNumber: "4",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9622011223",
    gender: "Female",
    admissionDate: "2024-03-18"
  },
  {
    studentId: "GHSS-25-1005",
    name: "Zubair Farooq",
    parentage: "Farooq Ahmad Malik",
    className: "10th",
    rollNumber: "5",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9906033445",
    gender: "Male",
    admissionDate: "2024-03-20"
  },
  {
    studentId: "GHSS-25-1006",
    name: "Sabreena Gul",
    parentage: "Gul Mohammad Lone",
    className: "10th",
    rollNumber: "6",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9596044556",
    gender: "Female",
    admissionDate: "2024-03-22"
  },
  // Class 12th
  {
    studentId: "GHSS-25-1201",
    name: "Aaqib Javed",
    parentage: "Javed Ahmad Mir",
    className: "12th",
    rollNumber: "1",
    academicSession: "2025-2026",
    stream: "Medical",
    phone: "9419123456",
    gender: "Male",
    admissionDate: "2023-04-05"
  },
  {
    studentId: "GHSS-25-1202",
    name: "Nowsheen Akhter",
    parentage: "Mohammad Yousuf Shah",
    className: "12th",
    rollNumber: "2",
    academicSession: "2025-2026",
    stream: "Non-Medical",
    phone: "9622654321",
    gender: "Female",
    admissionDate: "2023-04-06"
  },
  {
    studentId: "GHSS-25-1203",
    name: "Muzamil Shafi",
    parentage: "Mohammad Shafi Khanday",
    className: "12th",
    rollNumber: "3",
    academicSession: "2025-2026",
    stream: "Arts",
    phone: "9797112233",
    gender: "Male",
    admissionDate: "2023-04-10"
  },
  // Class 9th
  {
    studentId: "GHSS-25-0901",
    name: "Owais Manzoor",
    parentage: "Manzoor Ahmad Najar",
    className: "9th",
    rollNumber: "1",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9906123456",
    gender: "Male",
    admissionDate: "2025-03-01"
  },
  {
    studentId: "GHSS-25-0902",
    name: "Tabasum Parveen",
    parentage: "Nazir Ahmad Chopan",
    className: "9th",
    rollNumber: "2",
    academicSession: "2025-2026",
    stream: "General",
    phone: "9596987654",
    gender: "Female",
    admissionDate: "2025-03-02"
  },
  // Class 10th - Historical 2024-2025
  {
    studentId: "GHSS-24-1001",
    name: "Bilal Ahmad Padder",
    parentage: "Ghulam Qadir Padder",
    className: "10th",
    rollNumber: "1",
    academicSession: "2024-2025",
    stream: "General",
    phone: "9419998877",
    gender: "Male",
    admissionDate: "2023-03-15"
  },
  {
    studentId: "GHSS-24-1002",
    name: "Snober Mushtaq",
    parentage: "Mushtaq Ahmad Lone",
    className: "10th",
    rollNumber: "2",
    academicSession: "2024-2025",
    stream: "General",
    phone: "9797554433",
    gender: "Female",
    admissionDate: "2023-03-16"
  }
];

export const initialAssessments: Assessment[] = [
  {
    assessmentId: "ASM-25-10-MATH-UT1",
    name: "Unit Test 1 (T1)",
    type: "Theory",
    subject: "Mathematics",
    className: "10th",
    academicSession: "2025-2026",
    assessmentDate: "2025-05-15",
    maxMarks: 50,
    passingPercentage: 35.0
  },
  {
    assessmentId: "ASM-25-10-ENG-MT",
    name: "Mid-Term Examination",
    type: "Theory",
    subject: "English",
    className: "10th",
    academicSession: "2025-2026",
    assessmentDate: "2025-09-20",
    maxMarks: 100,
    passingPercentage: 35.0
  },
  {
    assessmentId: "ASM-25-10-SCI-UT1",
    name: "Unit Test 1 (T1)",
    type: "Theory",
    subject: "Science",
    className: "10th",
    academicSession: "2025-2026",
    assessmentDate: "2025-05-18",
    maxMarks: 50,
    passingPercentage: 35.0
  },
  {
    assessmentId: "ASM-25-12-PHY-UT1",
    name: "Periodic Assessment 1",
    type: "Practical",
    subject: "Physics",
    className: "12th",
    academicSession: "2025-2026",
    assessmentDate: "2025-06-10",
    maxMarks: 30,
    passingPercentage: 35.0
  },
  {
    assessmentId: "ASM-24-10-MATH-ANNUAL",
    name: "Annual Board Examination",
    type: "Theory",
    subject: "Mathematics",
    className: "10th",
    academicSession: "2024-2025",
    assessmentDate: "2024-11-15",
    maxMarks: 100,
    passingPercentage: 35.0
  }
];

export const initialMarks: MarkEntry[] = [
  {
    markEntryId: "ME-01",
    assessmentId: "ASM-25-10-MATH-UT1",
    studentId: "GHSS-25-1001",
    academicSession: "2025-2026",
    className: "10th",
    subject: "Mathematics",
    maxMarks: 50,
    obtainedMarks: 44,
    status: "Present",
    result: "Pass",
    remarks: "Excellent performance"
  },
  {
    markEntryId: "ME-02",
    assessmentId: "ASM-25-10-MATH-UT1",
    studentId: "GHSS-25-1002",
    academicSession: "2025-2026",
    className: "10th",
    subject: "Mathematics",
    maxMarks: 50,
    obtainedMarks: 48,
    status: "Present",
    result: "Pass",
    remarks: "Class topper"
  },
  {
    markEntryId: "ME-03",
    assessmentId: "ASM-25-10-MATH-UT1",
    studentId: "GHSS-25-1003",
    academicSession: "2025-2026",
    className: "10th",
    subject: "Mathematics",
    maxMarks: 50,
    obtainedMarks: 14,
    status: "Present",
    result: "Fail",
    remarks: "Needs remedial support"
  },
  {
    markEntryId: "ME-04",
    assessmentId: "ASM-25-10-MATH-UT1",
    studentId: "GHSS-25-1004",
    academicSession: "2025-2026",
    className: "10th",
    subject: "Mathematics",
    maxMarks: 50,
    obtainedMarks: 36.5,
    status: "Present",
    result: "Pass",
    remarks: "Good"
  },
  {
    markEntryId: "ME-05",
    assessmentId: "ASM-25-10-MATH-UT1",
    studentId: "GHSS-25-1005",
    academicSession: "2025-2026",
    className: "10th",
    subject: "Mathematics",
    maxMarks: 50,
    obtainedMarks: null,
    status: "Absent",
    result: "Absent",
    remarks: "Absent on medical grounds"
  },
  {
    markEntryId: "ME-06",
    assessmentId: "ASM-25-10-MATH-UT1",
    studentId: "GHSS-25-1006",
    academicSession: "2025-2026",
    className: "10th",
    subject: "Mathematics",
    maxMarks: 50,
    obtainedMarks: 29,
    status: "Present",
    result: "Pass",
    remarks: "Satisfactory"
  },
  // English
  {
    markEntryId: "ME-07",
    assessmentId: "ASM-25-10-ENG-MT",
    studentId: "GHSS-25-1001",
    academicSession: "2025-2026",
    className: "10th",
    subject: "English",
    maxMarks: 100,
    obtainedMarks: 82,
    status: "Present",
    result: "Pass",
    remarks: "Very good expression"
  },
  {
    markEntryId: "ME-08",
    assessmentId: "ASM-25-10-ENG-MT",
    studentId: "GHSS-25-1002",
    academicSession: "2025-2026",
    className: "10th",
    subject: "English",
    maxMarks: 100,
    obtainedMarks: 91,
    status: "Present",
    result: "Pass",
    remarks: "Outstanding"
  },
  {
    markEntryId: "ME-09",
    assessmentId: "ASM-25-10-ENG-MT",
    studentId: "GHSS-25-1003",
    academicSession: "2025-2026",
    className: "10th",
    subject: "English",
    maxMarks: 100,
    obtainedMarks: 48,
    status: "Present",
    result: "Pass",
    remarks: "Passes minimum threshold"
  },
  {
    markEntryId: "ME-10",
    assessmentId: "ASM-25-10-ENG-MT",
    studentId: "GHSS-25-1004",
    academicSession: "2025-2026",
    className: "10th",
    subject: "English",
    maxMarks: 100,
    obtainedMarks: 78,
    status: "Present",
    result: "Pass",
    remarks: "Commendable"
  }
];

export const CLASSES_LIST = ["9th", "10th", "11th", "12th"];
export const SESSIONS_LIST = ["2025-2026", "2024-2025", "2023-2024"];
export const SUBJECTS_LIST = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Science",
  "Social Science",
  "Urdu",
  "Kashmiri",
  "Computer Science",
  "Environmental Science",
  "Economics",
  "Political Science",
  "History"
];
