package com.example.ui

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.database.AppDatabase
import com.example.data.database.InitialData
import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.StudentEntity
import com.example.data.entity.UserEntity
import com.example.data.firebase.FirebaseManager
import com.example.data.firebase.SyncStatus
import com.example.data.firebase.awaitResult
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
    object UserManagement : NavigationDestination
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("ghss_larnoo_auth_prefs", Context.MODE_PRIVATE)
    private val firebaseAuth = FirebaseManager.getAuth(application)
    private val firestore = FirebaseManager.getFirestore(application)

    private val database = AppDatabase.getInstance(application)
    val repository = SchoolRepository(
        studentDao = database.studentDao(),
        assessmentDao = database.assessmentDao(),
        markEntryDao = database.markEntryDao(),
        configDao = database.schoolConfigDao(),
        userDao = database.userDao(),
        firestore = firestore
    )

    val syncStatus: StateFlow<SyncStatus> = repository.syncStatus

    // ==========================================
    // Authentication State & Current User
    // ==========================================
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _authLoading = MutableStateFlow(true)
    val authLoading: StateFlow<Boolean> = _authLoading.asStateFlow()

    private val _authError = MutableStateFlow<String?>(null)
    val authError: StateFlow<String?> = _authError.asStateFlow()

    private val _currentUser = MutableStateFlow(CurrentUser.DEFAULT_ADMIN)
    val currentUser: StateFlow<CurrentUser> = _currentUser.asStateFlow()

    // Navigation State
    private val _currentScreen = MutableStateFlow<NavigationDestination>(NavigationDestination.Dashboard)
    val currentScreen: StateFlow<NavigationDestination> = _currentScreen.asStateFlow()

    // Global Selected Filters
    val selectedSession = MutableStateFlow("2025-2026")
    val selectedClass = MutableStateFlow("10th")
    val selectedSubject = MutableStateFlow("Mathematics")

    // School Configuration Flows
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

    val schoolCode: StateFlow<String> = repository.schoolCode.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        InitialData.SCHOOL_CODE
    )

    val schoolAddress: StateFlow<String> = repository.schoolAddress.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        InitialData.SCHOOL_ADDRESS
    )

    val schoolAffiliation: StateFlow<String> = repository.schoolAffiliation.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        InitialData.SCHOOL_AFFILIATION
    )

    // Users / Staff List
    val allUsers: StateFlow<List<UserEntity>> = repository.getAllUsers().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
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

    // All Assessments & Search/Filter
    val allAssessments: StateFlow<List<AssessmentEntity>> = repository.getAllAssessments().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val assessmentSearchQuery = MutableStateFlow("")
    val selectedAssessmentSubjectFilter = MutableStateFlow("")

    // Active Assessment selected for Marks Entry
    val activeAssessmentId = MutableStateFlow<String?>(null)
    val activeAssessment: StateFlow<AssessmentEntity?> = combine(
        allAssessments,
        activeAssessmentId
    ) { assessments, id ->
        if (id == null) assessments.firstOrNull() else assessments.find { it.assessmentId == id } ?: assessments.firstOrNull()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // All Mark Entries (reactive so Marks Entry table updates automatically on Firestore sync)
    private val allMarkEntries: StateFlow<List<MarkEntryEntity>> = repository.getAllMarkEntries().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    // Marks Entry Table Data
    private val _marksRows = MutableStateFlow<List<StudentAwardRow>>(emptyList())
    val marksRows: StateFlow<List<StudentAwardRow>> = _marksRows.asStateFlow()

    // Student Result Search & Summary State
    val resultSearchQuery = MutableStateFlow("")
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
            val targetClass = cls.ifBlank { asm.className }
            repository.getClassAnalytics(targetClass, session, subj, asm.assessmentId).firstOrNull()
        } else {
            null
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Status Message / Toast feedback
    private val _userFeedbackMessage = MutableStateFlow<String?>(null)
    val userFeedbackMessage: StateFlow<String?> = _userFeedbackMessage.asStateFlow()

    init {
        restoreAuthenticationState()

        viewModelScope.launch {
            repository.activeSession.collect { session ->
                if (session.isNotBlank()) {
                    selectedSession.value = session
                }
            }
        }

        viewModelScope.launch {
            allAssessments.collect { list ->
                if (activeAssessmentId.value == null && list.isNotEmpty()) {
                    activeAssessmentId.value = list.first().assessmentId
                }
            }
        }

        viewModelScope.launch {
            combine(activeAssessment, allStudents, passingPercentage, allMarkEntries) { asm, students, passPct, entries ->
                asm
            }.collect { asm ->
                if (asm != null) {
                    loadMarksRowsForAssessment(asm, passingPercentage.value)
                } else {
                    _marksRows.value = emptyList()
                }
            }
        }
    }

    // ==========================================
    // Authentication Lifecycle
    // ==========================================
    private fun restoreAuthenticationState() {
        viewModelScope.launch {
            _authLoading.value = true
            try {
                // Ensure official admin exists in Room
                InitialData.seedInitialData(database)

                val savedUid = prefs.getString("auth_uid", null)
                val savedEmail = prefs.getString("auth_email", null)
                val fbUser = firebaseAuth?.currentUser

                val targetEmail = fbUser?.email?.lowercase() ?: savedEmail?.lowercase()
                val targetUid = fbUser?.uid ?: savedUid

                if (!targetEmail.isNullOrBlank() && !targetUid.isNullOrBlank()) {
                    // Check Firestore / Room user profile
                    var userEntity = repository.getUserByUid(targetUid)
                        ?: repository.getUserByEmail(targetEmail)

                    if (firestore != null) {
                        try {
                            val snap = firestore.collection("users").document(targetUid).get().awaitResult()
                            if (snap.exists()) {
                                val active = snap.getBoolean("active") ?: true
                                val roleStr = snap.getString("role") ?: "teacher"
                                val nameStr = snap.getString("name") ?: "School Staff"
                                val emailStr = (snap.getString("email") ?: targetEmail).lowercase()
                                userEntity = UserEntity(
                                    uid = targetUid,
                                    name = nameStr,
                                    email = emailStr,
                                    role = roleStr,
                                    active = active,
                                    assignedSubject = snap.getString("assignedSubject") ?: "All Subjects",
                                    assignedClass = snap.getString("assignedClass") ?: "All Classes",
                                    createdAt = snap.getString("createdAt") ?: "",
                                    updatedAt = snap.getString("updatedAt") ?: ""
                                )
                                database.userDao().insertUser(userEntity)
                            }
                        } catch (_: Exception) {
                            // Offline: rely on Room cache
                        }
                    }

                    if (userEntity != null) {
                        if (!userEntity.active && userEntity.email != FirebaseManager.OFFICIAL_ADMIN_EMAIL) {
                            clearSavedAuth()
                            firebaseAuth?.signOut()
                            _isAuthenticated.value = false
                            _authError.value = "Account Disabled: Your staff account has been deactivated by the Administrator."
                        } else {
                            _currentUser.value = CurrentUser.fromUserEntity(userEntity)
                            _isAuthenticated.value = true
                            repository.startRealtimeSync()
                        }
                    } else if (targetEmail == FirebaseManager.OFFICIAL_ADMIN_EMAIL) {
                        _currentUser.value = CurrentUser.DEFAULT_ADMIN.copy(uid = targetUid)
                        _isAuthenticated.value = true
                        repository.startRealtimeSync()
                    } else {
                        _isAuthenticated.value = false
                    }
                } else {
                    _isAuthenticated.value = false
                }
            } catch (_: Exception) {
                _isAuthenticated.value = false
            } finally {
                _authLoading.value = false
            }
        }
    }

    fun login(email: String, password: String) {
        val cleanEmail = email.trim().lowercase()
        val cleanPass = password.trim()
        if (cleanEmail.isBlank() || cleanPass.isBlank()) {
            _authError.value = "Please enter both email address and password."
            return
        }

        viewModelScope.launch {
            _authLoading.value = true
            _authError.value = null
            try {
                // 1. Official Administrator Check (ghsslarnoo@gmail.com / Assets@18551421)
                if (cleanEmail == FirebaseManager.OFFICIAL_ADMIN_EMAIL &&
                    cleanPass == FirebaseManager.OFFICIAL_ADMIN_PASSWORD
                ) {
                    var adminUid = "admin-ghss-larnoo"
                    if (firebaseAuth != null) {
                        try {
                            val res = firebaseAuth.signInWithEmailAndPassword(cleanEmail, cleanPass).awaitResult()
                            res.user?.uid?.let { adminUid = it }
                        } catch (_: Exception) {
                            try {
                                val res = firebaseAuth.createUserWithEmailAndPassword(cleanEmail, cleanPass).awaitResult()
                                res.user?.uid?.let { adminUid = it }
                            } catch (_: Exception) {
                                // Proceed with official admin UID
                            }
                        }
                    }

                    val adminUser = CurrentUser.DEFAULT_ADMIN.copy(uid = adminUid)
                    repository.upsertUser(
                        adminUser.toUserEntity(
                            credentialToken = FirebaseManager.encodeCredentialToken(cleanPass)
                        )
                    )
                    saveAuthSession(adminUser)
                    _currentUser.value = adminUser
                    _isAuthenticated.value = true
                    repository.startRealtimeSync()
                    showFeedback("Signed in as ${adminUser.name}")
                    _authLoading.value = false
                    return@launch
                }

                // 2. Try Firebase Authentication signInWithEmailAndPassword
                var authenticatedUid: String? = null
                if (firebaseAuth != null) {
                    try {
                        val result = firebaseAuth.signInWithEmailAndPassword(cleanEmail, cleanPass).awaitResult()
                        authenticatedUid = result.user?.uid
                    } catch (_: Exception) {
                        // Fall through to check Firestore / Room staff registry
                    }
                }

                // 3. Verify against Firestore /users collection and Room cache
                var matchedUser: UserEntity? = null
                val expectedToken = FirebaseManager.encodeCredentialToken(cleanPass)

                if (firestore != null) {
                    try {
                        val querySnap = firestore.collection("users")
                            .whereEqualTo("email", cleanEmail)
                            .get()
                            .awaitResult()
                        val doc = querySnap.documents.firstOrNull()
                        if (doc != null) {
                            val storedCred = doc.getString("_cred") ?: ""
                            if (authenticatedUid != null || (storedCred.isNotBlank() && storedCred == expectedToken)) {
                                matchedUser = UserEntity(
                                    uid = doc.getString("uid") ?: doc.id,
                                    name = doc.getString("name") ?: "School Staff",
                                    email = cleanEmail,
                                    role = doc.getString("role") ?: "teacher",
                                    active = doc.getBoolean("active") ?: true,
                                    assignedSubject = doc.getString("assignedSubject") ?: "All Subjects",
                                    assignedClass = doc.getString("assignedClass") ?: "All Classes",
                                    createdAt = doc.getString("createdAt") ?: "",
                                    updatedAt = doc.getString("updatedAt") ?: "",
                                    credentialToken = storedCred
                                )
                                database.userDao().insertUser(matchedUser)
                            }
                        }
                    } catch (_: Exception) {
                        // Offline fallback to Room
                    }
                }

                if (matchedUser == null) {
                    val localUser = repository.getUserByEmail(cleanEmail)
                    if (localUser != null && (authenticatedUid != null || localUser.credentialToken == expectedToken)) {
                        matchedUser = localUser
                    }
                }

                if (matchedUser != null) {
                    if (!matchedUser.active) {
                        firebaseAuth?.signOut()
                        clearSavedAuth()
                        _isAuthenticated.value = false
                        _authError.value = "Account Disabled: Your account has been disabled by the Administrator."
                    } else {
                        val current = CurrentUser.fromUserEntity(matchedUser)
                        saveAuthSession(current)
                        _currentUser.value = current
                        _isAuthenticated.value = true
                        repository.startRealtimeSync()
                        showFeedback("Welcome back, ${current.name}!")
                    }
                } else {
                    _authError.value = "Invalid email or password. Please verify your credentials."
                }
            } catch (e: Exception) {
                _authError.value = e.localizedMessage ?: "Authentication failed. Please check your connection."
            } finally {
                _authLoading.value = false
            }
        }
    }

    fun sendPasswordReset(email: String) {
        val cleanEmail = email.trim().lowercase()
        if (cleanEmail.isBlank()) {
            _authError.value = "Please enter your registered email address first."
            return
        }
        viewModelScope.launch {
            try {
                firebaseAuth?.sendPasswordResetEmail(cleanEmail)?.awaitResult()
                showFeedback("Password reset link sent to $cleanEmail.")
            } catch (_: Exception) {
                showFeedback("If $cleanEmail is registered in Firebase Auth, a reset link has been dispatched.")
            }
        }
    }

    fun clearAuthError() {
        _authError.value = null
    }

    fun logout() {
        try {
            firebaseAuth?.signOut()
        } catch (_: Exception) {
        }
        repository.stopRealtimeSync()
        clearSavedAuth()
        _isAuthenticated.value = false
        _currentScreen.value = NavigationDestination.Dashboard
        showFeedback("Signed out successfully.")
    }

    private fun saveAuthSession(user: CurrentUser) {
        prefs.edit()
            .putString("auth_uid", user.uid)
            .putString("auth_email", user.email)
            .putString("auth_name", user.name)
            .putString("auth_role", user.role.firestoreValue)
            .apply()
    }

    private fun clearSavedAuth() {
        prefs.edit().clear().apply()
    }

    fun triggerManualSync() {
        repository.startRealtimeSync()
        showFeedback("Synchronizing records with Cloud Firestore...")
    }

    fun navigateTo(destination: NavigationDestination) {
        // Role-based access protection
        if (_currentUser.value.role != UserRole.ADMIN &&
            (destination == NavigationDestination.UserManagement ||
                destination == NavigationDestination.Settings ||
                destination == NavigationDestination.StudentRegistration)
        ) {
            showFeedback("Access Restricted: Only an Administrator can access this module.")
            return
        }
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
    // User Management (Administrator Only)
    // ==========================================
    fun registerTeacherAccount(
        name: String,
        email: String,
        password: String,
        assignedSubject: String = "All Subjects",
        assignedClass: String = "All Classes"
    ): Boolean {
        if (_currentUser.value.role != UserRole.ADMIN) {
            showFeedback("Unauthorized: Only an Administrator can register new teachers.")
            return false
        }
        val cleanName = name.trim()
        val cleanEmail = email.trim().lowercase()
        val cleanPass = password.trim()

        if (cleanName.isBlank() || cleanEmail.isBlank() || !cleanEmail.contains("@")) {
            showFeedback("Validation Error: Please enter a valid teacher name and email address.")
            return false
        }
        if (cleanPass.length < 6) {
            showFeedback("Validation Error: Password must be at least 6 characters long.")
            return false
        }

        val existing = allUsers.value.find { it.email.equals(cleanEmail, ignoreCase = true) }
        val uid = existing?.uid ?: "staff-${System.currentTimeMillis()}-${UUID.randomUUID().toString().take(6)}"
        val nowIso = SchoolRepository.isoNow()

        val newTeacher = UserEntity(
            uid = uid,
            name = cleanName,
            email = cleanEmail,
            role = "teacher",
            active = true,
            assignedSubject = assignedSubject.ifBlank { "All Subjects" },
            assignedClass = assignedClass.ifBlank { "All Classes" },
            createdAt = existing?.createdAt ?: nowIso,
            updatedAt = nowIso,
            credentialToken = FirebaseManager.encodeCredentialToken(cleanPass)
        )

        viewModelScope.launch {
            repository.upsertUser(newTeacher)
            showFeedback("Teacher account for '$cleanName' ($cleanEmail) registered and synced.")
        }
        return true
    }

    fun toggleUserActiveStatus(user: UserEntity) {
        if (_currentUser.value.role != UserRole.ADMIN) {
            showFeedback("Unauthorized: Only an Administrator can modify user status.")
            return
        }
        if (user.email.equals(FirebaseManager.OFFICIAL_ADMIN_EMAIL, ignoreCase = true) ||
            user.uid == _currentUser.value.uid
        ) {
            showFeedback("Cannot deactivate the primary Administrator account.")
            return
        }
        val updated = user.copy(active = !user.active, updatedAt = SchoolRepository.isoNow())
        viewModelScope.launch {
            repository.upsertUser(updated)
            val stateLabel = if (updated.active) "Activated" else "Disabled"
            showFeedback("User '${user.name}' is now $stateLabel.")
        }
    }

    fun updateUserRole(user: UserEntity, newRole: String) {
        if (_currentUser.value.role != UserRole.ADMIN) return
        if (user.email.equals(FirebaseManager.OFFICIAL_ADMIN_EMAIL, ignoreCase = true)) {
            showFeedback("Cannot change role of the primary Administrator account.")
            return
        }
        val updated = user.copy(role = newRole, updatedAt = SchoolRepository.isoNow())
        viewModelScope.launch {
            repository.upsertUser(updated)
            showFeedback("Updated role for '${user.name}' to ${newRole.uppercase()}.")
        }
    }

    fun deleteUserAccount(user: UserEntity) {
        if (_currentUser.value.role != UserRole.ADMIN) return
        if (user.email.equals(FirebaseManager.OFFICIAL_ADMIN_EMAIL, ignoreCase = true) ||
            user.uid == _currentUser.value.uid
        ) {
            showFeedback("Cannot delete your own or the primary Administrator account.")
            return
        }
        viewModelScope.launch {
            repository.deleteUser(user.uid)
            showFeedback("Removed staff account for '${user.name}'.")
        }
    }

    // ==========================================
    // Student Registration & Management
    // ==========================================
    fun registerStudent(
        name: String,
        parentage: String,
        className: String,
        rollNumber: String,
        academicSession: String,
        stream: String,
        phone: String,
        customId: String? = null,
        gender: String = "Male"
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

        // Prevent duplicate student IDs
        val duplicate = allStudents.value.any { it.studentId.equals(generatedId, ignoreCase = true) }
        if (duplicate) {
            showFeedback("Duplicate Student ID '$generatedId': A student with this ID already exists.")
            return false
        }

        val student = StudentEntity(
            studentId = generatedId,
            name = name.trim(),
            parentage = parentage.trim(),
            className = SchoolRepository.normalizeClassName(className),
            rollNumber = rollNumber.trim(),
            academicSession = academicSession,
            stream = stream,
            phone = phone.trim(),
            gender = gender,
            admissionDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        )

        viewModelScope.launch {
            repository.registerStudent(student)
            showFeedback("Student '${student.name}' registered & synced with ID: ${student.studentId}")
            selectedStudentForSummary.value = student
        }
        return true
    }

    fun updateStudent(student: StudentEntity): Boolean {
        if (student.name.isBlank() || student.parentage.isBlank() || student.rollNumber.isBlank()) {
            showFeedback("Validation Error: Name, Parentage, and Roll Number cannot be empty.")
            return false
        }
        viewModelScope.launch {
            repository.updateStudent(student)
            if (selectedStudentForSummary.value?.studentId == student.studentId) {
                selectedStudentForSummary.value = student
            }
            showFeedback("Student record for '${student.name}' updated and synced.")
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
        // Deduplicate by studentId (case-insensitive)
        val uniqueStudents = students
            .filter { it.studentId.isNotBlank() && it.name.isNotBlank() }
            .distinctBy { it.studentId.trim().lowercase() }

        viewModelScope.launch {
            repository.bulkRegisterStudents(uniqueStudents)
            showFeedback("Successfully imported & synced ${uniqueStudents.size} student records to Cloud Firestore.")
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
            assessmentId = "ASM-${System.currentTimeMillis()}-${UUID.randomUUID().toString().take(4)}",
            name = name.trim(),
            type = type,
            subject = subject.trim(),
            className = SchoolRepository.normalizeClassName(className),
            academicSession = academicSession,
            assessmentDate = assessmentDate.ifBlank {
                SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            },
            maxMarks = maxMarks,
            passingPercentage = passingPercentage.value,
            isLocked = false
        )

        viewModelScope.launch {
            repository.createAssessment(newAssessment)
            activeAssessmentId.value = newAssessment.assessmentId
            selectedSubject.value = newAssessment.subject
            selectedClass.value = newAssessment.className
            selectedSession.value = newAssessment.academicSession
            showFeedback("Assessment '${newAssessment.name} (${newAssessment.subject})' created & synced.")
        }
        return true
    }

    fun updateAssessment(assessment: AssessmentEntity): Boolean {
        if (assessment.name.isBlank() || assessment.subject.isBlank() || assessment.maxMarks <= 0) {
            showFeedback("Validation Error: Assessment Name, Subject, and valid Max Marks are required.")
            return false
        }
        viewModelScope.launch {
            repository.updateAssessment(assessment)
            showFeedback("Assessment '${assessment.name}' updated & synced.")
        }
        return true
    }

    fun toggleAssessmentLock(assessment: AssessmentEntity) {
        val updated = assessment.copy(isLocked = !assessment.isLocked)
        viewModelScope.launch {
            repository.updateAssessment(updated)
            val statusMsg = if (updated.isLocked) "Locked (Finalized)" else "Unlocked for Editing"
            showFeedback("Assessment '${assessment.name}' is now $statusMsg.")
        }
    }

    fun deleteAssessment(assessment: AssessmentEntity) {
        if (_currentUser.value.role != UserRole.ADMIN) {
            showFeedback("Unauthorized: Only an Administrator can delete assessments.")
            return
        }
        if (assessment.isLocked) {
            showFeedback("Protected: Unlock this finalized assessment before deleting.")
            return
        }
        viewModelScope.launch {
            repository.deleteAssessment(assessment)
            showFeedback("Assessment '${assessment.name}' deleted.")
        }
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
            val normalizedClass = SchoolRepository.normalizeClassName(assessment.className)
            val enrolledStudents = allStudents.value.filter {
                SchoolRepository.normalizeClassName(it.className) == normalizedClass &&
                    (it.academicSession == assessment.academicSession || assessment.academicSession.isBlank())
            }.sortedWith(compareBy({ it.rollNumber.toIntOrNull() ?: 999 }, { it.name }))

            val existingEntries = repository.getEntriesForAssessment(assessment.assessmentId).firstOrNull() ?: emptyList()
            val entriesMap = existingEntries.associateBy { it.studentId }

            val rows = enrolledStudents.mapIndexed { index, student ->
                val entry = entriesMap[student.studentId]
                val obtainedVal = entry?.obtainedMarks
                val statusVal = entry?.status ?: "Present"
                val effectivePassPct = if (assessment.passingPercentage > 0) assessment.passingPercentage else passPct
                val resultStatus = entry?.result ?: ResultCalculator.computeResultStatus(
                    obtained = obtainedVal,
                    maxMarks = assessment.maxMarks,
                    passingPercentage = effectivePassPct,
                    status = statusVal
                )

                StudentAwardRow(
                    serialNumber = index + 1,
                    student = student,
                    markEntryId = entry?.markEntryId ?: "ME-${assessment.assessmentId}-${student.studentId}",
                    maxMarks = assessment.maxMarks,
                    obtainedMarksText = obtainedVal?.let {
                        if (it % 1.0 == 0.0) it.toInt().toString() else it.toString()
                    } ?: "",
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
        val asm = activeAssessment.value
        if (asm?.isLocked == true) {
            showFeedback("Assessment '${asm.name}' is locked. Unlock it first to modify marks.")
            return
        }

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
        if (asm.isLocked) {
            showFeedback("Assessment '${asm.name}' is locked and cannot be modified.")
            return
        }
        viewModelScope.launch {
            val entities = _marksRows.value.map { row ->
                MarkEntryEntity(
                    markEntryId = row.markEntryId ?: "ME-${asm.assessmentId}-${row.student.studentId}",
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
            showFeedback("Marks Award Sheet for '${asm.subject}' saved & synced to Cloud Firestore.")
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
    // Settings & School Configuration
    // ==========================================
    fun updatePassingPercentage(newPercentage: Double) {
        if (newPercentage in 1.0..100.0) {
            viewModelScope.launch {
                repository.updatePassingPercentage(newPercentage)
                showFeedback("Passing threshold updated to $newPercentage% & synced.")
            }
        }
    }

    fun updateActiveSession(newSession: String) {
        selectedSession.value = newSession
        viewModelScope.launch {
            repository.updateActiveSession(newSession)
            showFeedback("Active academic session set to $newSession & synced.")
        }
    }

    fun updateFullSchoolSettings(
        name: String,
        code: String,
        address: String,
        affiliation: String,
        passingPct: Double,
        session: String
    ) {
        if (_currentUser.value.role != UserRole.ADMIN) {
            showFeedback("Unauthorized: Only an Administrator can modify school settings.")
            return
        }
        selectedSession.value = session
        viewModelScope.launch {
            repository.updateFullSchoolConfig(
                name = name,
                code = code,
                address = address,
                affiliation = affiliation,
                passingPct = passingPct.coerceIn(1.0, 100.0),
                session = session
            )
            showFeedback("School configuration saved & synced to Cloud Firestore.")
        }
    }

    // Printable Marksheet text generator for sharing / printing
    fun generateMarksheetPrintContent(result: StudentComprehensiveResult): String {
        val s = result.student
        return buildString {
            appendLine("==================================================")
            appendLine("  ${schoolName.value.uppercase(Locale.getDefault())}")
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
            appendLine("     ${schoolName.value.uppercase(Locale.getDefault())}")
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
                appendLine(
                    String.format(
                        "%-4d %-20s %-12s %-6s %-6s %-7s",
                        row.serialNumber,
                        row.student.name.take(19),
                        row.student.studentId,
                        row.student.rollNumber,
                        marksStr,
                        row.result
                    )
                )
            }
            appendLine("----------------------------------------------------------------")
            appendLine("Submitted by Subject Teacher: _________________________")
            appendLine("Verified by Examination Cell: _________________________")
        }
    }
}
