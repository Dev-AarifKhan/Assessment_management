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

export const initialAssessments: Assessment[] = [];

export const initialMarks: MarkEntry[] = [];

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
