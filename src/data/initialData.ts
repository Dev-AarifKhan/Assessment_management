import { Student, Assessment, MarkEntry, SchoolConfig } from '../types';

export const initialConfig: SchoolConfig = {
  schoolName: "Government Higher Secondary School Larnoo",
  schoolCode: "UDISE: 01061601505",
  schoolAddress: "Larnoo, Anantnag, Jammu & Kashmir - 192202",
  affiliation: "Email: ghsslarnoo@gmail.com Website: https://hss-larnoo.onrender.com",
  passingPercentage: 33.0,
  activeSession: "2025-2026",
};

export const initialStudents: Student[] = [];

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
  "Education",
  "Sociology",
  "Urdu",
  "Kashmiri",
  "Computer Science",
  "IT/ITeS (Vocational)",
  "Tourism & Hospitality (Vocational)",
  "Environmental Science",
  "Economics",
  "Political Science",
  "History"
];
