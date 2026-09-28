package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.database.AppDatabase
import com.example.data.database.InitialData
import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.StudentEntity
import com.example.data.model.ClassAnalyticsSummary
import com.example.data.model.CurrentUser
import com.example.data.model.ResultCalculator
import com.example.data.model.StudentAwardRow
import com.example.data.model.StudentComprehensiveResult
import com.example.data.model.UserRole
import com.example.data.repository.SchoolRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

sealed interface NavigationDestination {
    object Dashboard : NavigationDestination
    object StudentRegistration : NavigationDestination
    object StudentList : NavigationDestination
    object AssessmentManagement : NavigationDestination
    object MarksEntry : NavigationDestination
    object StudentResult : NavigationDestination
    object ClassResults : NavigationDestination
    object Reports : NavigationDestination
    object Settings : NavigationDestination
    object IdCardGenerator : NavigationDestination
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val database = AppDatabase.getInstance(application)
    val repository = SchoolRepository(
        studentDao = database.studentDao(),
        assessmentDao = database.assessmentDao(),
        markEntryDao = database.markEntryDao(),
        configDao = database.schoolConfigDao()
    )

    // Current User & Role
    private val _currentUser = MutableStateFlow(CurrentUser.DEFAULT_ADMIN)
    val currentUser: StateFlow<CurrentUser> = _currentUser.asStateFlow()

    // Navigation State
    private val _currentScreen = MutableStateFlow<NavigationDestination>(NavigationDestination.Dashboard)
    val currentScreen: StateFlow<NavigationDestination> = _currentScreen.asStateFlow()

    // Global Selected Filters
    val selectedSession = MutableStateFlow("2025-2026")
    val selectedClass = MutableStateFlow("10th")
    val selectedSubject = MutableStateFlow("Mathematics")

    // Passing Percentage
    val passingPercentage: StateFlow<Double> = repository.passingPercentage.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        InitialData.DEFAULT_PASSING_PERCENTAGE
    )

    val schoolName: StateFlow<String> = repository.schoolName.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        InitialData.SCHOOL_NAME
    )

    // Student Lists
    val allStudents: StateFlow<List<StudentEntity>> = repository.getAllStudents().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val studentSearchQuery = MutableStateFlow("")

    val filteredStudents: StateFlow<List<StudentEntity>> = combine(
        allStudents,
        studentSearchQuery,
        selectedClass,
        selectedSession
    ) { list, query, cls, session ->
        list.filter { student ->
            val matchesQuery = query.isBlank() ||
                student.name.contains(query, ignoreCase = true) ||
                student.studentId.contains(query, ignoreCase = true) ||
                student.rollNumber.contains(query, ignoreCase = true) ||
                student.parentage.contains(query, ignoreCase = true)
            val matchesClass = cls.isBlank() || student.className == cls
            val matchesSession = session.isBlank() || student.academicSession == session
            matchesQuery && matchesClass && matchesSession
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // All Assessments
    val allAssessments: StateFlow<List<AssessmentEntity>> = repository.getAllAssessments().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    // Active Assessment selected for Marks Entry
    val activeAssessmentId = MutableStateFlow<String?>(null)
    val activeAssessment: StateFlow<AssessmentEntity?> = combine(
        allAssessments,
        activeAssessmentId
    ) { assessments, id ->
        if (id == null) assessments.firstOrNull() else assessments.find { it.assessmentId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Marks Entry Table Data
    private val _marksRows = MutableStateFlow<List<StudentAwardRow>>(emptyList())
    val marksRows: StateFlow<List<StudentAwardRow>> = _marksRows.asStateFlow()

    // Student Result Search & Summary State
    val resultSearchQuery = MutableStateFlow("GHSS-25-1001")
    val selectedStudentForSummary = MutableStateFlow<StudentEntity?>(null)

    val studentComprehensiveResult: StateFlow<StudentComprehensiveResult?> = combine(
        selectedStudentForSummary,
        selectedSession,
        allStudents
    ) { student, session, students ->
        val target = student ?: students.firstOrNull()
        target?.let { s ->
            repository.getStudentComprehensiveResult(s.studentId, s.academicSession).firstOrNull()
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Class Analytics
    val classAnalytics: StateFlow<ClassAnalyticsSummary?> = combine(
        selectedClass,
        selectedSession,
        selectedSubject,
        activeAssessment
    ) { cls, session, subj, asm ->
        if (asm != null) {
            repository.getClassAnalytics(cls, session, subj, asm.assessmentId).firstOrNull()
        } else {
            null
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Status Message / Toast feedback
    private val _userFeedbackMessage = MutableStateFlow<String?>(null)
    val userFeedbackMessage: StateFlow<String?> = _userFeedbackMessage.asStateFlow()

    init {
        // Initialize active assessment and seed data if needed
        viewModelScope.launch {
            allAssessments.collect { list ->
                if (activeAssessmentId.value == null && list.isNotEmpty()) {
                    activeAssessmentId.value = list.first().assessmentId
                }
            }
        }

        viewModelScope.launch {
            combine(activeAssessment, allStudents, passingPercentage) { asm, students, passPct ->
                Triple(asm, students, passPct)
            }.collect { (asm, students, passPct) ->
                if (asm != null) {
                    loadMarksRowsForAssessment(asm, passPct)
                }
            }
        }
    }

    fun navigateTo(destination: NavigationDestination) {
        _currentScreen.value = destination
    }

    fun switchRole(role: UserRole) {
        if (role == UserRole.ADMIN) {
            _currentUser.value = CurrentUser.DEFAULT_ADMIN
            showFeedback("Switched to Administrator Role (Full System Access)")
        } else {
            _currentUser.value = CurrentUser.DEFAULT_TEACHER
            showFeedback("Switched to Subject Teacher Role (${CurrentUser.DEFAULT_TEACHER.assignedSubject})")
        }
    }

    fun showFeedback(msg: String) {
        _userFeedbackMessage.value = msg
    }

    fun clearFeedback() {
        _userFeedbackMessage.value = null
    }

    // ==========================================
    // Student Registration
    // ==========================================
    fun registerStudent(
        name: String,
        parentage: String,
        className: String,
        rollNumber: String,
        academicSession: String,
        stream: String,
        phone: String,
        customId: String? = null
    ): Boolean {
        if (name.isBlank() || parentage.isBlank() || rollNumber.isBlank()) {
            showFeedback("Validation Error: Name, Parentage, and Roll Number are mandatory.")
            return false
        }

        val generatedId = if (!customId.isNullOrBlank()) {
            customId.trim()
        } else {
            val sessionPrefix = academicSession.split("-").getOrNull(0)?.takeLast(2) ?: "25"
            val classNum = className.replace(Regex("[^0-9]"), "").padStart(2, '0')
            val rollPadded = rollNumber.padStart(2, '0')
            "GHSS-$sessionPrefix-$classNum$rollPadded"
        }

        val student = StudentEntity(
            studentId = generatedId,
            name = name.trim(),
            parentage = parentage.trim(),
            className = className,
            rollNumber = rollNumber.trim(),
            academicSession = academicSession,
            stream = stream,
            phone = phone.trim(),
            admissionDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        )

        viewModelScope.launch {
            repository.registerStudent(student)
            showFeedback("Student '${student.name}' registered successfully with ID: ${student.studentId}")
            // Select as current
            selectedStudentForSummary.value = student
        }
        return true
    }

    fun deleteStudent(student: StudentEntity) {
        viewModelScope.launch {
            repository.deleteStudent(student)
            showFeedback("Student record for ${student.name} deleted.")
        }
    }

    fun bulkRegisterStudents(students: List<StudentEntity>) {
        if (students.isEmpty()) {
            showFeedback("No student records provided for bulk import.")
            return
        }
        viewModelScope.launch {
            repository.bulkRegisterStudents(students)
            showFeedback("Successfully bulk imported ${students.size} student records into database.")
        }
    }

    // ==========================================
    // Assessment Management
    // ==========================================
    fun createAssessment(
        name: String,
        type: String,
        subject: String,
        className: String,
        academicSession: String,
        assessmentDate: String,
        maxMarks: Double
    ): Boolean {
        if (name.isBlank() || subject.isBlank() || maxMarks <= 0) {
            showFeedback("Validation Error: Please fill all assessment fields with valid Max Marks.")
            return false
        }

        val newAssessment = AssessmentEntity(
            assessmentId = UUID.randomUUID().toString(), // Guarantee preservation without overwriting
            name = name.trim(),
            type = type,
            subject = subject.trim(),
            className = className,
            academicSession = academicSession,
            assessmentDate = assessmentDate.ifBlank {
                SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            },
            maxMarks = maxMarks,
            passingPercentage = passingPercentage.value
        )

        viewModelScope.launch {
            repository.createAssessment(newAssessment)
            activeAssessmentId.value = newAssessment.assessmentId
            selectedSubject.value = newAssessment.subject
            selectedClass.value = newAssessment.className
            selectedSession.value = newAssessment.academicSession
            showFeedback("Assessment '${newAssessment.name} (${newAssessment.subject})' created with unique ID.")
        }
        return true
    }

    fun selectAssessment(assessment: AssessmentEntity) {
        activeAssessmentId.value = assessment.assessmentId
        selectedSubject.value = assessment.subject
        selectedClass.value = assessment.className
        selectedSession.value = assessment.academicSession
    }

    // ==========================================
    // Marks Entry Table Logic
    // ==========================================
    private fun loadMarksRowsForAssessment(assessment: AssessmentEntity, passPct: Double) {
        viewModelScope.launch {
            val enrolledStudents = allStudents.value.filter {
                it.className == assessment.className && it.academicSession == assessment.academicSession
            }.sortedWith(compareBy({ it.rollNumber.toIntOrNull() ?: 999 }, { it.name }))

            val existingEntries = repository.getEntriesForAssessment(assessment.assessmentId).firstOrNull() ?: emptyList()
            val entriesMap = existingEntries.associateBy { it.studentId }

            val rows = enrolledStudents.mapIndexed { index, student ->
                val entry = entriesMap[student.studentId]
                val obtainedVal = entry?.obtainedMarks
                val statusVal = entry?.status ?: "Present"
                val resultStatus = entry?.result ?: ResultCalculator.computeResultStatus(
                    obtained = obtainedVal,
                    maxMarks = assessment.maxMarks,
                    passingPercentage = assessment.passingPercentage,
                    status = statusVal
                )

                StudentAwardRow(
                    serialNumber = index + 1,
                    student = student,
                    markEntryId = entry?.markEntryId,
                    maxMarks = assessment.maxMarks,
                    obtainedMarksText = obtainedVal?.let { if (it % 1.0 == 0.0) it.toInt().toString() else it.toString() } ?: "",
                    obtainedMarks = obtainedVal,
                    status = statusVal,
                    result = resultStatus,
                    remarks = entry?.remarks ?: ""
                )
            }
            _marksRows.value = rows
        }
    }

    fun updateMarksRow(
        studentId: String,
        newMarksText: String,
        newStatus: String = "Present",
        remarks: String = ""
    ) {
        val currentRows = _marksRows.value.toMutableList()
        val index = currentRows.indexOfFirst { it.student.studentId == studentId }
        if (index == -1) return

        val row = currentRows[index]
        val parsedMarks = newMarksText.toDoubleOrNull()

        // Validation against Max Marks
        val validMarks = when {
            newStatus != "Present" -> null
            parsedMarks != null && parsedMarks < 0 -> 0.0
            parsedMarks != null && parsedMarks > row.maxMarks -> row.maxMarks
            else -> parsedMarks
        }

        val asm = activeAssessment.value
        val passPct = asm?.passingPercentage ?: passingPercentage.value
        val calculatedResult = ResultCalculator.computeResultStatus(
            obtained = validMarks,
            maxMarks = row.maxMarks,
            passingPercentage = passPct,
            status = newStatus
        )

        currentRows[index] = row.copy(
            obtainedMarksText = if (newStatus != "Present") "" else newMarksText,
            obtainedMarks = validMarks,
            status = newStatus,
            result = calculatedResult,
            remarks = remarks
        )
        _marksRows.value = currentRows
    }

    fun saveAllMarks() {
        val asm = activeAssessment.value ?: return
        viewModelScope.launch {
            val entities = _marksRows.value.map { row ->
                MarkEntryEntity(
                    markEntryId = row.markEntryId ?: UUID.randomUUID().toString(),
                    assessmentId = asm.assessmentId,
                    studentId = row.student.studentId,
                    academicSession = asm.academicSession,
                    className = asm.className,
                    subject = asm.subject,
                    maxMarks = asm.maxMarks,
                    obtainedMarks = row.obtainedMarks,
                    status = row.status,
                    result = row.result,
                    remarks = row.remarks,
                    updatedAt = System.currentTimeMillis()
                )
            }
            repository.saveBatchMarkEntries(entities)
            showFeedback("Marks Award Sheet for '${asm.subject}' successfully saved and locked.")
        }
    }

    // ==========================================
    // Student Search & Summary
    // ==========================================
    fun searchStudentForResult(query: String) {
        resultSearchQuery.value = query
        val found = allStudents.value.find {
            it.studentId.equals(query.trim(), ignoreCase = true) ||
                it.rollNumber.equals(query.trim(), ignoreCase = true) ||
                it.name.contains(query.trim(), ignoreCase = true)
        }
        if (found != null) {
            selectedStudentForSummary.value = found
            selectedSession.value = found.academicSession
            selectedClass.value = found.className
            showFeedback("Found student record: ${found.name} (${found.className})")
        } else {
            showFeedback("No student found matching '$query'.")
        }
    }

    fun selectStudent(student: StudentEntity) {
        selectedStudentForSummary.value = student
        selectedSession.value = student.academicSession
        selectedClass.value = student.className
        resultSearchQuery.value = student.studentId
    }

    // ==========================================
    // Settings & Passing Percentage
    // ==========================================
    fun updatePassingPercentage(newPercentage: Double) {
        if (newPercentage in 1.0..100.0) {
            viewModelScope.launch {
                repository.updatePassingPercentage(newPercentage)
                showFeedback("Passing threshold updated to $newPercentage%.")
            }
        }
    }

    fun updateActiveSession(newSession: String) {
        selectedSession.value = newSession
        viewModelScope.launch {
            repository.updateActiveSession(newSession)
            showFeedback("Active academic session set to $newSession.")
        }
    }

    // Printable Marksheet text generator for sharing / printing
    fun generateMarksheetPrintContent(result: StudentComprehensiveResult): String {
        val s = result.student
        return buildString {
            appendLine("==================================================")
            appendLine("  ${InitialData.SCHOOL_NAME.uppercase(Locale.getDefault())}")
            appendLine("             OFFICIAL RESULT MARKSHEET            ")
            appendLine("==================================================")
            appendLine("Student Name:    ${s.name}")
            appendLine("Student ID:      ${s.studentId}")
            appendLine("Parentage:       ${s.parentage}")
            appendLine("Class:           ${s.className} (${s.stream})")
            appendLine("Roll Number:     ${s.rollNumber}")
            appendLine("Academic Session:${result.academicSession}")
            appendLine("--------------------------------------------------")
            appendLine(String.format("%-18s %-8s %-8s %-6s", "Subject", "Max", "Obt", "Result"))
            appendLine("--------------------------------------------------")
            for (sub in result.subjects) {
                val obtStr = sub.obtainedMarks?.toString() ?: sub.status
                appendLine(String.format("%-18s %-8.0f %-8s %-6s", sub.subject.take(17), sub.maxMarks, obtStr, sub.result))
            }
            appendLine("--------------------------------------------------")
            appendLine("Grand Total:     ${result.totalObtainedMarks.toInt()} / ${result.totalMaxMarks.toInt()}")
            appendLine("Percentage:      ${String.format(Locale.getDefault(), "%.1f", result.overallPercentage)}%")
            appendLine("Overall Result:  ${result.overallResult.uppercase(Locale.getDefault())}")
            appendLine("Division:        ${result.division}")
            appendLine("Overall Grade:   ${result.overallGrade}")
            appendLine("==================================================")
            appendLine("Signatures:")
            appendLine("Teacher Incharge: _________________")
            appendLine("Principal:        _________________")
            appendLine("Date of Issue:    ${SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date())}")
        }
    }

    // Subject Award Roll text generator
    fun generateAwardRollContent(asm: AssessmentEntity, rows: List<StudentAwardRow>): String {
        return buildString {
            appendLine("================================================================")
            appendLine("     ${InitialData.SCHOOL_NAME.uppercase(Locale.getDefault())}")
            appendLine("                     MARKS AWARD ROLL                         ")
            appendLine("================================================================")
            appendLine("Subject:          ${asm.subject}")
            appendLine("Assessment:       ${asm.name} (${asm.type})")
            appendLine("Class:            ${asm.className}          Session: ${asm.academicSession}")
            appendLine("Maximum Marks:    ${asm.maxMarks}             Pass %: ${asm.passingPercentage}%")
            appendLine("Date:             ${asm.assessmentDate}")
            appendLine("----------------------------------------------------------------")
            appendLine(String.format("%-4s %-20s %-12s %-6s %-6s %-7s", "SNo", "Student Name", "Student ID", "Roll", "Marks", "Result"))
            appendLine("----------------------------------------------------------------")
            for (row in rows) {
                val marksStr = row.obtainedMarks?.toString() ?: row.status
                appendLine(String.format("%-4d %-20s %-12s %-6s %-6s %-7s",
                    row.serialNumber,
                    row.student.name.take(19),
                    row.student.studentId,
                    row.student.rollNumber,
                    marksStr,
                    row.result
                ))
            }
            appendLine("----------------------------------------------------------------")
            appendLine("Submitted by Subject Teacher: _________________________")
            appendLine("Verified by Examination Cell: _________________________")
        }
    }
}
