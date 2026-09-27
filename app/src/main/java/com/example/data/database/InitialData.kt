package com.example.data.database

import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.SchoolConfigEntity
import com.example.data.entity.StudentEntity

object InitialData {
    val SCHOOL_NAME = "Government Higher Secondary School Larnoo"
    val SCHOOL_CODE = "GHSS-LRN"
    val DEFAULT_PASSING_PERCENTAGE = 35.0

    val CLASSES = listOf("9th", "10th", "11th", "12th")
    val SESSIONS = listOf("2025-2026", "2024-2025", "2023-2024")
    val ASSESSMENT_TYPES = listOf("Theory", "Practical", "Internal Assessment", "Project", "Comprehensive")
    val SUBJECTS = listOf(
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
    )

    suspend fun seedInitialData(database: AppDatabase) {
        val studentDao = database.studentDao()
        val assessmentDao = database.assessmentDao()
        val markEntryDao = database.markEntryDao()
        val configDao = database.schoolConfigDao()

        // 1. Config
        configDao.setConfig(SchoolConfigEntity("school_name", SCHOOL_NAME))
        configDao.setConfig(SchoolConfigEntity("passing_percentage", "35.0"))
        configDao.setConfig(SchoolConfigEntity("active_session", "2025-2026"))
        configDao.setConfig(SchoolConfigEntity("school_address", "Larnoo, Anantnag, Jammu & Kashmir - 192202"))

        // 2. Sample Students across sessions and classes
        val students = listOf(
            // Class 10th - Session 2025-2026
            StudentEntity(
                studentId = "GHSS-25-1001",
                name = "Sahil Ahmad Wani",
                parentage = "Mohammad Shafi Wani",
                className = "10th",
                rollNumber = "1",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9419012345",
                admissionDate = "2024-03-10",
                gender = "Male"
            ),
            StudentEntity(
                studentId = "GHSS-25-1002",
                name = "Mehvish Jan",
                parentage = "Ghulam Hassan Rather",
                className = "10th",
                rollNumber = "2",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9419054321",
                admissionDate = "2024-03-12",
                gender = "Female"
            ),
            StudentEntity(
                studentId = "GHSS-25-1003",
                name = "Faizan Bashir",
                parentage = "Bashir Ahmad Dar",
                className = "10th",
                rollNumber = "3",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9797098765",
                admissionDate = "2024-03-15",
                gender = "Male"
            ),
            StudentEntity(
                studentId = "GHSS-25-1004",
                name = "Insha Rehman",
                parentage = "Abdul Rehman Bhat",
                className = "10th",
                rollNumber = "4",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9622011223",
                admissionDate = "2024-03-18",
                gender = "Female"
            ),
            StudentEntity(
                studentId = "GHSS-25-1005",
                name = "Zubair Farooq",
                parentage = "Farooq Ahmad Malik",
                className = "10th",
                rollNumber = "5",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9906033445",
                admissionDate = "2024-03-20",
                gender = "Male"
            ),
            StudentEntity(
                studentId = "GHSS-25-1006",
                name = "Sabreena Gul",
                parentage = "Gul Mohammad Lone",
                className = "10th",
                rollNumber = "6",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9596044556",
                admissionDate = "2024-03-22",
                gender = "Female"
            ),

            // Class 12th - Session 2025-2026 (Medical / Non-Medical)
            StudentEntity(
                studentId = "GHSS-25-1201",
                name = "Aaqib Javed",
                parentage = "Javed Ahmad Mir",
                className = "12th",
                rollNumber = "1",
                academicSession = "2025-2026",
                stream = "Medical",
                phone = "9419123456",
                admissionDate = "2023-04-05",
                gender = "Male"
            ),
            StudentEntity(
                studentId = "GHSS-25-1202",
                name = "Nowsheen Akhter",
                parentage = "Mohammad Yousuf Shah",
                className = "12th",
                rollNumber = "2",
                academicSession = "2025-2026",
                stream = "Non-Medical",
                phone = "9622654321",
                admissionDate = "2023-04-06",
                gender = "Female"
            ),
            StudentEntity(
                studentId = "GHSS-25-1203",
                name = "Muzamil Shafi",
                parentage = "Mohammad Shafi Khanday",
                className = "12th",
                rollNumber = "3",
                academicSession = "2025-2026",
                stream = "Arts",
                phone = "9797112233",
                admissionDate = "2023-04-10",
                gender = "Male"
            ),

            // Class 9th - Session 2025-2026
            StudentEntity(
                studentId = "GHSS-25-0901",
                name = "Owais Manzoor",
                parentage = "Manzoor Ahmad Najar",
                className = "9th",
                rollNumber = "1",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9906123456",
                admissionDate = "2025-03-01",
                gender = "Male"
            ),
            StudentEntity(
                studentId = "GHSS-25-0902",
                name = "Tabasum Parveen",
                parentage = "Nazir Ahmad Chopan",
                className = "9th",
                rollNumber = "2",
                academicSession = "2025-2026",
                stream = "General",
                phone = "9596987654",
                admissionDate = "2025-03-02",
                gender = "Female"
            ),

            // Class 10th - Historical Session 2024-2025 (Demonstrating Preserved History!)
            StudentEntity(
                studentId = "GHSS-24-1001",
                name = "Bilal Ahmad Padder",
                parentage = "Ghulam Qadir Padder",
                className = "10th",
                rollNumber = "1",
                academicSession = "2024-2025",
                stream = "General",
                phone = "9419998877",
                admissionDate = "2023-03-15",
                gender = "Male"
            ),
            StudentEntity(
                studentId = "GHSS-24-1002",
                name = "Snober Mushtaq",
                parentage = "Mushtaq Ahmad Lone",
                className = "10th",
                rollNumber = "2",
                academicSession = "2024-2025",
                stream = "General",
                phone = "9797554433",
                admissionDate = "2023-03-16",
                gender = "Female"
            )
        )
        studentDao.insertStudents(students)

        // 3. Sample Assessments
        val assessment1Id = "ASM-25-10-MATH-UT1"
        val assessment2Id = "ASM-25-10-ENG-MT"
        val assessment3Id = "ASM-25-10-SCI-UT1"
        val assessment4Id = "ASM-25-12-PHY-UT1"
        val assessmentHistoryId = "ASM-24-10-MATH-ANNUAL"

        val assessments = listOf(
            AssessmentEntity(
                assessmentId = assessment1Id,
                name = "Unit Test 1 (T1)",
                type = "Theory",
                subject = "Mathematics",
                className = "10th",
                academicSession = "2025-2026",
                assessmentDate = "2025-05-15",
                maxMarks = 50.0,
                passingPercentage = 35.0
            ),
            AssessmentEntity(
                assessmentId = assessment2Id,
                name = "Mid-Term Examination",
                type = "Theory",
                subject = "English",
                className = "10th",
                academicSession = "2025-2026",
                assessmentDate = "2025-09-20",
                maxMarks = 100.0,
                passingPercentage = 35.0
            ),
            AssessmentEntity(
                assessmentId = assessment3Id,
                name = "Unit Test 1 (T1)",
                type = "Theory",
                subject = "Science",
                className = "10th",
                academicSession = "2025-2026",
                assessmentDate = "2025-05-18",
                maxMarks = 50.0,
                passingPercentage = 35.0
            ),
            AssessmentEntity(
                assessmentId = assessment4Id,
                name = "Periodic Assessment 1",
                type = "Practical",
                subject = "Physics",
                className = "12th",
                academicSession = "2025-2026",
                assessmentDate = "2025-06-10",
                maxMarks = 30.0,
                passingPercentage = 35.0
            ),
            // Preserved History Assessment
            AssessmentEntity(
                assessmentId = assessmentHistoryId,
                name = "Annual Board Examination",
                type = "Theory",
                subject = "Mathematics",
                className = "10th",
                academicSession = "2024-2025",
                assessmentDate = "2024-11-15",
                maxMarks = 100.0,
                passingPercentage = 35.0
            )
        )
        assessmentDao.insertAssessments(assessments)

        // 4. Sample Marks Entries
        val markEntries = listOf(
            // Unit Test 1 (Math) 10th - Max 50
            MarkEntryEntity(
                markEntryId = "ME-01",
                assessmentId = assessment1Id,
                studentId = "GHSS-25-1001",
                academicSession = "2025-2026",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 50.0,
                obtainedMarks = 44.0,
                status = "Present",
                result = "Pass",
                remarks = "Excellent performance"
            ),
            MarkEntryEntity(
                markEntryId = "ME-02",
                assessmentId = assessment1Id,
                studentId = "GHSS-25-1002",
                academicSession = "2025-2026",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 50.0,
                obtainedMarks = 48.0,
                status = "Present",
                result = "Pass",
                remarks = "Class topper"
            ),
            MarkEntryEntity(
                markEntryId = "ME-03",
                assessmentId = assessment1Id,
                studentId = "GHSS-25-1003",
                academicSession = "2025-2026",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 50.0,
                obtainedMarks = 14.0,
                status = "Present",
                result = "Fail",
                remarks = "Needs remedial support"
            ),
            MarkEntryEntity(
                markEntryId = "ME-04",
                assessmentId = assessment1Id,
                studentId = "GHSS-25-1004",
                academicSession = "2025-2026",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 50.0,
                obtainedMarks = 36.5,
                status = "Present",
                result = "Pass",
                remarks = "Good"
            ),
            MarkEntryEntity(
                markEntryId = "ME-05",
                assessmentId = assessment1Id,
                studentId = "GHSS-25-1005",
                academicSession = "2025-2026",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 50.0,
                obtainedMarks = null,
                status = "Absent",
                result = "Absent",
                remarks = "Absent on medical grounds"
            ),
            MarkEntryEntity(
                markEntryId = "ME-06",
                assessmentId = assessment1Id,
                studentId = "GHSS-25-1006",
                academicSession = "2025-2026",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 50.0,
                obtainedMarks = 29.0,
                status = "Present",
                result = "Pass",
                remarks = "Satisfactory"
            ),

            // Mid-Term English (10th) - Max 100
            MarkEntryEntity(
                markEntryId = "ME-07",
                assessmentId = assessment2Id,
                studentId = "GHSS-25-1001",
                academicSession = "2025-2026",
                className = "10th",
                subject = "English",
                maxMarks = 100.0,
                obtainedMarks = 82.0,
                status = "Present",
                result = "Pass",
                remarks = "Very good expression"
            ),
            MarkEntryEntity(
                markEntryId = "ME-08",
                assessmentId = assessment2Id,
                studentId = "GHSS-25-1002",
                academicSession = "2025-2026",
                className = "10th",
                subject = "English",
                maxMarks = 100.0,
                obtainedMarks = 91.0,
                status = "Present",
                result = "Pass",
                remarks = "Outstanding"
            ),
            MarkEntryEntity(
                markEntryId = "ME-09",
                assessmentId = assessment2Id,
                studentId = "GHSS-25-1003",
                academicSession = "2025-2026",
                className = "10th",
                subject = "English",
                maxMarks = 100.0,
                obtainedMarks = 48.0,
                status = "Present",
                result = "Pass",
                remarks = "Passes minimum threshold"
            ),
            MarkEntryEntity(
                markEntryId = "ME-10",
                assessmentId = assessment2Id,
                studentId = "GHSS-25-1004",
                academicSession = "2025-2026",
                className = "10th",
                subject = "English",
                maxMarks = 100.0,
                obtainedMarks = 78.0,
                status = "Present",
                result = "Pass",
                remarks = "Commendable"
            ),

            // Preserved History marks for 2024-2025
            MarkEntryEntity(
                markEntryId = "ME-HIST-01",
                assessmentId = assessmentHistoryId,
                studentId = "GHSS-24-1001",
                academicSession = "2024-2025",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 100.0,
                obtainedMarks = 76.0,
                status = "Present",
                result = "Pass",
                remarks = "Cleared with Distinction"
            ),
            MarkEntryEntity(
                markEntryId = "ME-HIST-02",
                assessmentId = assessmentHistoryId,
                studentId = "GHSS-24-1002",
                academicSession = "2024-2025",
                className = "10th",
                subject = "Mathematics",
                maxMarks = 100.0,
                obtainedMarks = 84.0,
                status = "Present",
                result = "Pass",
                remarks = "Distinction"
            )
        )
        markEntryDao.insertOrUpdateAll(markEntries)
    }
}
