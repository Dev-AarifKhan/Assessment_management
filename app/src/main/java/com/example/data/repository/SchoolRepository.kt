package com.example.data.repository

import com.example.data.dao.AssessmentDao
import com.example.data.dao.MarkEntryDao
import com.example.data.dao.SchoolConfigDao
import com.example.data.dao.StudentDao
import com.example.data.database.InitialData
import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.SchoolConfigEntity
import com.example.data.entity.StudentEntity
import com.example.data.model.ClassAnalyticsSummary
import com.example.data.model.ResultCalculator
import com.example.data.model.StudentComprehensiveResult
import com.example.data.model.SubjectResultDetail
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import java.util.UUID

class SchoolRepository(
    private val studentDao: StudentDao,
    private val assessmentDao: AssessmentDao,
    private val markEntryDao: MarkEntryDao,
    private val configDao: SchoolConfigDao
) {
    // Configuration
    val schoolName: Flow<String> = configDao.getConfig("school_name").map {
        it?.value ?: InitialData.SCHOOL_NAME
    }

    val passingPercentage: Flow<Double> = configDao.getConfig("passing_percentage").map {
        it?.value?.toDoubleOrNull() ?: InitialData.DEFAULT_PASSING_PERCENTAGE
    }

    val activeSession: Flow<String> = configDao.getConfig("active_session").map {
        it?.value ?: "2025-2026"
    }

    suspend fun updatePassingPercentage(newPercentage: Double) {
        configDao.setConfig(SchoolConfigEntity("passing_percentage", newPercentage.toString()))
    }

    suspend fun updateActiveSession(newSession: String) {
        configDao.setConfig(SchoolConfigEntity("active_session", newSession))
    }

    suspend fun updateSchoolName(newName: String) {
        configDao.setConfig(SchoolConfigEntity("school_name", newName))
    }

    // Students
    fun getAllStudents(): Flow<List<StudentEntity>> = studentDao.getAllStudents()

    fun getStudentsByClassAndSession(className: String, session: String): Flow<List<StudentEntity>> =
        studentDao.getStudentsByClassAndSession(className, session)

    fun searchStudents(query: String): Flow<List<StudentEntity>> = studentDao.searchStudents(query)

    fun getStudentById(studentId: String): Flow<StudentEntity?> = studentDao.getStudentById(studentId)

    fun getAllSessions(): Flow<List<String>> = studentDao.getAllSessions()

    fun getStudentCount(): Flow<Int> = studentDao.getStudentCount()

    suspend fun registerStudent(student: StudentEntity) {
        studentDao.insertStudent(student)
    }

    suspend fun updateStudent(student: StudentEntity) {
        studentDao.updateStudent(student)
    }

    suspend fun deleteStudent(student: StudentEntity) {
        studentDao.deleteStudent(student)
    }

    // Assessments
    fun getAllAssessments(): Flow<List<AssessmentEntity>> = assessmentDao.getAllAssessments()

    fun getAssessmentsByFilter(className: String, session: String, subject: String): Flow<List<AssessmentEntity>> =
        assessmentDao.getAssessmentsByFilter(className, session, subject)

    fun getAssessmentById(id: String): Flow<AssessmentEntity?> = assessmentDao.getAssessmentById(id)

    suspend fun createAssessment(assessment: AssessmentEntity) {
        // Preserves all assessment records without overwriting using unique UUID
        assessmentDao.insertAssessment(assessment)
    }

    suspend fun updateAssessment(assessment: AssessmentEntity) {
        assessmentDao.updateAssessment(assessment)
    }

    suspend fun deleteAssessment(assessment: AssessmentEntity) {
        markEntryDao.deleteEntriesForAssessment(assessment.assessmentId)
        assessmentDao.deleteAssessment(assessment)
    }

    // Marks Entries
    fun getEntriesForAssessment(assessmentId: String): Flow<List<MarkEntryEntity>> =
        markEntryDao.getEntriesForAssessment(assessmentId)

    suspend fun saveMarkEntry(entry: MarkEntryEntity) {
        markEntryDao.insertOrUpdate(entry)
    }

    suspend fun saveBatchMarkEntries(entries: List<MarkEntryEntity>) {
        markEntryDao.insertOrUpdateAll(entries)
    }

    // Comprehensive Student Result calculation
    fun getStudentComprehensiveResult(studentId: String, session: String): Flow<StudentComprehensiveResult?> {
        return combine(
            studentDao.getStudentById(studentId),
            markEntryDao.getEntriesForStudent(studentId),
            assessmentDao.getAllAssessments(),
            passingPercentage
        ) { student, markEntries, assessments, defaultPassPercentage ->
            if (student == null) return@combine null

            val assessmentsMap = assessments.associateBy { it.assessmentId }
            val relevantEntries = markEntries.filter {
                val asm = assessmentsMap[it.assessmentId]
                it.academicSession == session || asm?.academicSession == session
            }

            val subjectDetails = relevantEntries.map { entry ->
                val asm = assessmentsMap[entry.assessmentId]
                val maxMarks = entry.maxMarks.takeIf { it > 0 } ?: asm?.maxMarks ?: 100.0
                val passPct = asm?.passingPercentage ?: defaultPassPercentage
                val obtained = entry.obtainedMarks
                val pct = if (obtained != null && maxMarks > 0) (obtained / maxMarks) * 100.0 else 0.0
                val resultStatus = entry.result.ifBlank {
                    ResultCalculator.computeResultStatus(obtained, maxMarks, passPct, entry.status)
                }

                SubjectResultDetail(
                    assessmentName = asm?.name ?: "Assessment",
                    assessmentType = asm?.type ?: "Theory",
                    subject = entry.subject.ifBlank { asm?.subject ?: "General" },
                    assessmentDate = asm?.assessmentDate ?: "",
                    maxMarks = maxMarks,
                    obtainedMarks = obtained,
                    passingPercentage = passPct,
                    status = entry.status,
                    result = resultStatus,
                    percentage = pct,
                    grade = ResultCalculator.computeGrade(pct),
                    remarks = entry.remarks
                )
            }

            val totalMax = subjectDetails.sumOf { it.maxMarks }
            val totalObtained = subjectDetails.sumOf { it.obtainedMarks ?: 0.0 }
            val overallPct = if (totalMax > 0) (totalObtained / totalMax) * 100.0 else 0.0
            val hasFailedAny = subjectDetails.any { it.result.equals("Fail", ignoreCase = true) || it.status.equals("Absent", ignoreCase = true) }
            val overallResult = if (subjectDetails.isEmpty()) "No Records" else if (hasFailedAny || overallPct < defaultPassPercentage) "Re-appear" else "Pass"
            val division = ResultCalculator.computeDivision(overallPct, hasFailedAny)
            val overallGrade = ResultCalculator.computeGrade(overallPct)

            StudentComprehensiveResult(
                student = student,
                academicSession = session,
                subjects = subjectDetails,
                totalMaxMarks = totalMax,
                totalObtainedMarks = totalObtained,
                overallPercentage = overallPct,
                overallResult = overallResult,
                division = division,
                overallGrade = overallGrade
            )
        }
    }

    // Class Analytics
    fun getClassAnalytics(
        className: String,
        session: String,
        subject: String,
        assessmentId: String
    ): Flow<ClassAnalyticsSummary?> {
        return combine(
            studentDao.getStudentsByClassAndSession(className, session),
            assessmentDao.getAssessmentById(assessmentId),
            markEntryDao.getEntriesForAssessment(assessmentId)
        ) { students, assessment, entries ->
            if (assessment == null) return@combine null

            val entriesMap = entries.associateBy { it.studentId }
            val studentMap = students.associateBy { it.studentId }

            val totalEnrolled = students.size
            var appearedCount = 0
            var passedCount = 0
            var failedCount = 0
            var absentCount = 0
            var highestMarks = 0.0
            var topperName = "N/A"
            var totalMarksObtained = 0.0
            val gradeDist = mutableMapOf<String, Int>()

            for (entry in entries) {
                if (entry.status.equals("Absent", ignoreCase = true)) {
                    absentCount++
                } else if (entry.obtainedMarks != null) {
                    appearedCount++
                    val marks = entry.obtainedMarks
                    totalMarksObtained += marks
                    if (marks > highestMarks) {
                        highestMarks = marks
                        topperName = studentMap[entry.studentId]?.name ?: entry.studentId
                    }
                    val pct = if (entry.maxMarks > 0) (marks / entry.maxMarks) * 100.0 else 0.0
                    val isPass = pct >= assessment.passingPercentage
                    if (isPass) passedCount++ else failedCount++

                    val grade = ResultCalculator.computeGrade(pct)
                    gradeDist[grade] = (gradeDist[grade] ?: 0) + 1
                }
            }

            val passPercentage = if (appearedCount > 0) (passedCount.toDouble() / appearedCount.toDouble()) * 100.0 else 0.0
            val average = if (appearedCount > 0) totalMarksObtained / appearedCount else 0.0

            ClassAnalyticsSummary(
                className = className,
                academicSession = session,
                subject = subject.ifBlank { assessment.subject },
                assessmentName = assessment.name,
                totalEnrolled = totalEnrolled,
                appearedCount = appearedCount,
                passedCount = passedCount,
                failedCount = failedCount,
                absentCount = absentCount,
                passPercentage = passPercentage,
                highestMarks = highestMarks,
                topperStudentName = topperName,
                classAverage = average,
                gradeDistributions = gradeDist
            )
        }
    }
}
