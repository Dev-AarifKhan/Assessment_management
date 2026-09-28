package com.example.data.repository

import com.example.data.dao.AssessmentDao
import com.example.data.dao.MarkEntryDao
import com.example.data.dao.SchoolConfigDao
import com.example.data.dao.StudentDao
import com.example.data.dao.UserDao
import com.example.data.database.InitialData
import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.SchoolConfigEntity
import com.example.data.entity.StudentEntity
import com.example.data.entity.UserEntity
import com.example.data.firebase.SyncStatus
import com.example.data.firebase.awaitResult
import com.example.data.model.ClassAnalyticsSummary
import com.example.data.model.ResultCalculator
import com.example.data.model.StudentComprehensiveResult
import com.example.data.model.SubjectResultDetail
import com.google.firebase.firestore.DocumentChange
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SchoolRepository(
    private val studentDao: StudentDao,
    private val assessmentDao: AssessmentDao,
    private val markEntryDao: MarkEntryDao,
    private val configDao: SchoolConfigDao,
    private val userDao: UserDao? = null,
    private val firestore: FirebaseFirestore? = null
) {
    private val syncScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val listenerRegistrations = mutableListOf<ListenerRegistration>()

    private val _syncStatus = MutableStateFlow(if (firestore != null) SyncStatus.SYNCED else SyncStatus.OFFLINE)
    val syncStatus: StateFlow<SyncStatus> = _syncStatus.asStateFlow()

    companion object {
        fun normalizeClassName(raw: String?): String {
            val cleaned = raw?.trim() ?: return "10th"
            return when (cleaned.lowercase(Locale.getDefault()).replace("class", "").trim()) {
                "9", "9th", "ix" -> "9th"
                "10", "10th", "x" -> "10th"
                "11", "11th", "xi" -> "11th"
                "12", "12th", "xii" -> "12th"
                else -> if (cleaned.isNotBlank()) cleaned else "10th"
            }
        }

        fun isoNow(): String {
            return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
        }
    }

    // ==========================================
    // Configuration Flows (Room-backed)
    // ==========================================
    val schoolName: Flow<String> = configDao.getConfig("school_name").map {
        it?.value ?: InitialData.SCHOOL_NAME
    }

    val schoolCode: Flow<String> = configDao.getConfig("school_code").map {
        it?.value ?: InitialData.SCHOOL_CODE
    }

    val schoolAddress: Flow<String> = configDao.getConfig("school_address").map {
        it?.value ?: InitialData.SCHOOL_ADDRESS
    }

    val schoolAffiliation: Flow<String> = configDao.getConfig("affiliation").map {
        it?.value ?: InitialData.SCHOOL_AFFILIATION
    }

    val passingPercentage: Flow<Double> = configDao.getConfig("passing_percentage").map {
        it?.value?.toDoubleOrNull() ?: InitialData.DEFAULT_PASSING_PERCENTAGE
    }

    val activeSession: Flow<String> = configDao.getConfig("active_session").map {
        it?.value ?: "2025-2026"
    }

    // ==========================================
    // Real-time Firestore <-> Room Synchronization
    // ==========================================
    fun startRealtimeSync() {
        val db = firestore ?: run {
            _syncStatus.value = SyncStatus.OFFLINE
            return
        }
        stopRealtimeSync()
        _syncStatus.value = SyncStatus.SYNCING

        try {
            // 1. Sync School Config (/config/school)
            val configReg = db.collection("config").document("school")
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        _syncStatus.value = SyncStatus.OFFLINE
                        return@addSnapshotListener
                    }
                    if (snapshot != null && snapshot.exists()) {
                        syncScope.launch {
                            snapshot.getString("schoolName")?.let {
                                configDao.setConfig(SchoolConfigEntity("school_name", it))
                            }
                            snapshot.getString("schoolCode")?.let {
                                configDao.setConfig(SchoolConfigEntity("school_code", it))
                            }
                            snapshot.getString("schoolAddress")?.let {
                                configDao.setConfig(SchoolConfigEntity("school_address", it))
                            }
                            snapshot.getString("affiliation")?.let {
                                configDao.setConfig(SchoolConfigEntity("affiliation", it))
                            }
                            snapshot.getDouble("passingPercentage")?.let {
                                configDao.setConfig(SchoolConfigEntity("passing_percentage", it.toString()))
                            }
                            snapshot.getString("activeSession")?.let {
                                configDao.setConfig(SchoolConfigEntity("active_session", it))
                            }
                            _syncStatus.value = SyncStatus.SYNCED
                        }
                    }
                }
            listenerRegistrations.add(configReg)

            // 2. Sync Students (/students/{studentId})
            val studentsReg = db.collection("students")
                .addSnapshotListener { snapshots, error ->
                    if (error != null || snapshots == null) {
                        _syncStatus.value = SyncStatus.OFFLINE
                        return@addSnapshotListener
                    }
                    syncScope.launch {
                        val toUpsert = mutableListOf<StudentEntity>()
                        for (change in snapshots.documentChanges) {
                            val doc = change.document
                            val studentId = doc.getString("studentId") ?: doc.id
                            if (change.type == DocumentChange.Type.REMOVED) {
                                studentDao.deleteStudentById(studentId)
                            } else {
                                toUpsert.add(
                                    StudentEntity(
                                        studentId = studentId,
                                        name = doc.getString("name") ?: "",
                                        parentage = doc.getString("parentage") ?: "",
                                        className = normalizeClassName(doc.getString("className")),
                                        rollNumber = doc.getString("rollNumber") ?: "",
                                        academicSession = doc.getString("academicSession") ?: "2025-2026",
                                        stream = doc.getString("stream") ?: "General",
                                        phone = doc.getString("phone") ?: "",
                                        admissionDate = doc.getString("admissionDate") ?: "",
                                        gender = doc.getString("gender") ?: "Male"
                                    )
                                )
                            }
                        }
                        if (toUpsert.isNotEmpty()) {
                            studentDao.insertStudents(toUpsert)
                        }
                        _syncStatus.value = SyncStatus.SYNCED
                    }
                }
            listenerRegistrations.add(studentsReg)

            // 3. Sync Assessments (/assessments/{assessmentId})
            val assessmentsReg = db.collection("assessments")
                .addSnapshotListener { snapshots, error ->
                    if (error != null || snapshots == null) {
                        _syncStatus.value = SyncStatus.OFFLINE
                        return@addSnapshotListener
                    }
                    syncScope.launch {
                        val toUpsert = mutableListOf<AssessmentEntity>()
                        for (change in snapshots.documentChanges) {
                            val doc = change.document
                            val assessmentId = doc.getString("assessmentId") ?: doc.id
                            if (change.type == DocumentChange.Type.REMOVED) {
                                assessmentDao.deleteAssessmentById(assessmentId)
                            } else {
                                toUpsert.add(
                                    AssessmentEntity(
                                        assessmentId = assessmentId,
                                        name = doc.getString("name") ?: "Assessment",
                                        type = doc.getString("type") ?: "Theory",
                                        subject = doc.getString("subject") ?: "General",
                                        className = normalizeClassName(doc.getString("className")),
                                        academicSession = doc.getString("academicSession") ?: "2025-2026",
                                        assessmentDate = doc.getString("assessmentDate") ?: "",
                                        maxMarks = doc.getDouble("maxMarks") ?: 100.0,
                                        passingPercentage = doc.getDouble("passingPercentage") ?: 33.0,
                                        isLocked = doc.getBoolean("isLocked") ?: false
                                    )
                                )
                            }
                        }
                        if (toUpsert.isNotEmpty()) {
                            assessmentDao.insertAssessments(toUpsert)
                        }
                        _syncStatus.value = SyncStatus.SYNCED
                    }
                }
            listenerRegistrations.add(assessmentsReg)

            // 4. Sync Marks (/marks/{markEntryId})
            val marksReg = db.collection("marks")
                .addSnapshotListener { snapshots, error ->
                    if (error != null || snapshots == null) {
                        _syncStatus.value = SyncStatus.OFFLINE
                        return@addSnapshotListener
                    }
                    syncScope.launch {
                        val toUpsert = mutableListOf<MarkEntryEntity>()
                        for (change in snapshots.documentChanges) {
                            val doc = change.document
                            val markEntryId = doc.getString("markEntryId") ?: doc.id
                            if (change.type == DocumentChange.Type.REMOVED) {
                                markEntryDao.deleteEntryById(markEntryId)
                            } else {
                                val assessmentId = doc.getString("assessmentId") ?: continue
                                val studentId = doc.getString("studentId") ?: continue
                                val maxMarks = doc.getDouble("maxMarks") ?: 100.0
                                val obtainedRaw = doc.get("obtainedMarks")
                                val obtainedMarks = when (obtainedRaw) {
                                    is Number -> obtainedRaw.toDouble()
                                    is String -> obtainedRaw.toDoubleOrNull()
                                    else -> null
                                }
                                val status = doc.getString("status") ?: "Present"
                                val result = doc.getString("result") ?: ResultCalculator.computeResultStatus(
                                    obtained = obtainedMarks,
                                    maxMarks = maxMarks,
                                    passingPercentage = 33.0,
                                    status = status
                                )
                                toUpsert.add(
                                    MarkEntryEntity(
                                        markEntryId = markEntryId,
                                        assessmentId = assessmentId,
                                        studentId = studentId,
                                        academicSession = doc.getString("academicSession") ?: "2025-2026",
                                        className = normalizeClassName(doc.getString("className")),
                                        subject = doc.getString("subject") ?: "",
                                        maxMarks = maxMarks,
                                        obtainedMarks = obtainedMarks,
                                        status = status,
                                        result = result,
                                        remarks = doc.getString("remarks") ?: ""
                                    )
                                )
                            }
                        }
                        if (toUpsert.isNotEmpty()) {
                            markEntryDao.insertOrUpdateAll(toUpsert)
                        }
                        _syncStatus.value = SyncStatus.SYNCED
                    }
                }
            listenerRegistrations.add(marksReg)

            // 5. Sync Users (/users/{uid})
            if (userDao != null) {
                val usersReg = db.collection("users")
                    .addSnapshotListener { snapshots, error ->
                        if (error != null || snapshots == null) return@addSnapshotListener
                        syncScope.launch {
                            val toUpsert = mutableListOf<UserEntity>()
                            for (change in snapshots.documentChanges) {
                                val doc = change.document
                                val uid = doc.getString("uid") ?: doc.id
                                val email = (doc.getString("email") ?: "").trim().lowercase()
                                if (email == "tawheeda196@gmail.com") continue
                                if (change.type == DocumentChange.Type.REMOVED) {
                                    userDao.deleteUserByUid(uid)
                                } else {
                                    val existing = userDao.getUserByUid(uid) ?: userDao.getUserByEmail(email)
                                    toUpsert.add(
                                        UserEntity(
                                            uid = uid,
                                            name = doc.getString("name") ?: "School Staff",
                                            email = email,
                                            role = doc.getString("role") ?: "teacher",
                                            active = doc.getBoolean("active") ?: true,
                                            assignedSubject = doc.getString("assignedSubject")
                                                ?: existing?.assignedSubject
                                                ?: "All Subjects",
                                            assignedClass = doc.getString("assignedClass")
                                                ?: existing?.assignedClass
                                                ?: "All Classes",
                                            createdAt = doc.getString("createdAt") ?: existing?.createdAt ?: isoNow(),
                                            updatedAt = doc.getString("updatedAt") ?: isoNow(),
                                            credentialToken = doc.getString("_cred") ?: existing?.credentialToken ?: ""
                                        )
                                    )
                                }
                            }
                            if (toUpsert.isNotEmpty()) {
                                userDao.insertUsers(toUpsert)
                            }
                        }
                    }
                listenerRegistrations.add(usersReg)
            }
        } catch (_: Exception) {
            _syncStatus.value = SyncStatus.OFFLINE
        }
    }

    fun stopRealtimeSync() {
        listenerRegistrations.forEach { reg ->
            try {
                reg.remove()
            } catch (_: Exception) {
            }
        }
        listenerRegistrations.clear()
    }

    // ==========================================
    // School Configuration Updates
    // ==========================================
    suspend fun updatePassingPercentage(newPercentage: Double) {
        configDao.setConfig(SchoolConfigEntity("passing_percentage", newPercentage.toString()))
        pushSchoolConfigToFirestore()
    }

    suspend fun updateActiveSession(newSession: String) {
        configDao.setConfig(SchoolConfigEntity("active_session", newSession))
        pushSchoolConfigToFirestore()
    }

    suspend fun updateSchoolName(newName: String) {
        configDao.setConfig(SchoolConfigEntity("school_name", newName))
        pushSchoolConfigToFirestore()
    }

    suspend fun updateFullSchoolConfig(
        name: String,
        code: String,
        address: String,
        affiliation: String,
        passingPct: Double,
        session: String
    ) {
        configDao.setConfig(SchoolConfigEntity("school_name", name.trim()))
        configDao.setConfig(SchoolConfigEntity("school_code", code.trim()))
        configDao.setConfig(SchoolConfigEntity("school_address", address.trim()))
        configDao.setConfig(SchoolConfigEntity("affiliation", affiliation.trim()))
        configDao.setConfig(SchoolConfigEntity("passing_percentage", passingPct.toString()))
        configDao.setConfig(SchoolConfigEntity("active_session", session.trim()))
        pushSchoolConfigToFirestore()
    }

    private suspend fun pushSchoolConfigToFirestore() {
        val db = firestore ?: return
        try {
            _syncStatus.value = SyncStatus.SYNCING
            val data = mapOf(
                "schoolName" to (schoolName.firstOrNull() ?: InitialData.SCHOOL_NAME),
                "schoolCode" to (schoolCode.firstOrNull() ?: InitialData.SCHOOL_CODE),
                "schoolAddress" to (schoolAddress.firstOrNull() ?: InitialData.SCHOOL_ADDRESS),
                "affiliation" to (schoolAffiliation.firstOrNull() ?: InitialData.SCHOOL_AFFILIATION),
                "passingPercentage" to (passingPercentage.firstOrNull() ?: InitialData.DEFAULT_PASSING_PERCENTAGE),
                "activeSession" to (activeSession.firstOrNull() ?: "2025-2026"),
                "updatedAt" to isoNow()
            )
            db.collection("config").document("school").set(data, SetOptions.merge()).awaitResult()
            _syncStatus.value = SyncStatus.SYNCED
        } catch (_: Exception) {
            _syncStatus.value = SyncStatus.OFFLINE
        }
    }

    // ==========================================
    // Students CRUD (Room + Firestore)
    // ==========================================
    fun getAllStudents(): Flow<List<StudentEntity>> = studentDao.getAllStudents()

    fun getStudentsByClassAndSession(className: String, session: String): Flow<List<StudentEntity>> =
        studentDao.getStudentsByClassAndSession(className, session)

    fun searchStudents(query: String): Flow<List<StudentEntity>> = studentDao.searchStudents(query)

    fun getStudentById(studentId: String): Flow<StudentEntity?> = studentDao.getStudentById(studentId)

    suspend fun getStudentByIdDirect(studentId: String): StudentEntity? = studentDao.getStudentByIdDirect(studentId)

    fun getAllSessions(): Flow<List<String>> = studentDao.getAllSessions()

    fun getStudentCount(): Flow<Int> = studentDao.getStudentCount()

    suspend fun registerStudent(student: StudentEntity) {
        val normalized = student.copy(className = normalizeClassName(student.className))
        studentDao.insertStudent(normalized)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("students").document(normalized.studentId)
                    .set(studentToFirestoreMap(normalized), SetOptions.merge())
                    .awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun bulkRegisterStudents(students: List<StudentEntity>) {
        val normalizedList = students.map { it.copy(className = normalizeClassName(it.className)) }
        studentDao.insertStudents(normalizedList)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                normalizedList.chunked(400).forEach { chunk ->
                    val batch = db.batch()
                    chunk.forEach { s ->
                        val ref = db.collection("students").document(s.studentId)
                        batch.set(ref, studentToFirestoreMap(s), SetOptions.merge())
                    }
                    batch.commit().awaitResult()
                }
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun updateStudent(student: StudentEntity) {
        val normalized = student.copy(className = normalizeClassName(student.className))
        studentDao.updateStudent(normalized)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("students").document(normalized.studentId)
                    .set(studentToFirestoreMap(normalized), SetOptions.merge())
                    .awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun deleteStudent(student: StudentEntity) {
        markEntryDao.deleteEntriesForStudent(student.studentId)
        studentDao.deleteStudent(student)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("students").document(student.studentId).delete().awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    private fun studentToFirestoreMap(s: StudentEntity): Map<String, Any> = mapOf(
        "studentId" to s.studentId,
        "name" to s.name,
        "parentage" to s.parentage,
        "className" to s.className,
        "rollNumber" to s.rollNumber,
        "academicSession" to s.academicSession,
        "stream" to s.stream,
        "phone" to s.phone,
        "gender" to s.gender,
        "admissionDate" to s.admissionDate,
        "updatedAt" to isoNow()
    )

    // ==========================================
    // Assessments CRUD (Room + Firestore)
    // ==========================================
    fun getAllAssessments(): Flow<List<AssessmentEntity>> = assessmentDao.getAllAssessments()

    fun getAssessmentsByFilter(className: String, session: String, subject: String): Flow<List<AssessmentEntity>> =
        assessmentDao.getAssessmentsByFilter(className, session, subject)

    fun getAssessmentById(id: String): Flow<AssessmentEntity?> = assessmentDao.getAssessmentById(id)

    suspend fun createAssessment(assessment: AssessmentEntity) {
        val normalized = assessment.copy(className = normalizeClassName(assessment.className))
        assessmentDao.insertAssessment(normalized)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("assessments").document(normalized.assessmentId)
                    .set(assessmentToFirestoreMap(normalized), SetOptions.merge())
                    .awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun updateAssessment(assessment: AssessmentEntity) {
        val normalized = assessment.copy(className = normalizeClassName(assessment.className))
        assessmentDao.updateAssessment(normalized)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("assessments").document(normalized.assessmentId)
                    .set(assessmentToFirestoreMap(normalized), SetOptions.merge())
                    .awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun deleteAssessment(assessment: AssessmentEntity) {
        val existingEntries = markEntryDao.getEntriesForAssessmentDirect(assessment.assessmentId)
        markEntryDao.deleteEntriesForAssessment(assessment.assessmentId)
        assessmentDao.deleteAssessment(assessment)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("assessments").document(assessment.assessmentId).delete().awaitResult()
                existingEntries.chunked(400).forEach { chunk ->
                    val batch = db.batch()
                    chunk.forEach { m ->
                        batch.delete(db.collection("marks").document(m.markEntryId))
                    }
                    batch.commit().awaitResult()
                }
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    private fun assessmentToFirestoreMap(a: AssessmentEntity): Map<String, Any> = mapOf(
        "assessmentId" to a.assessmentId,
        "name" to a.name,
        "type" to a.type,
        "subject" to a.subject,
        "className" to a.className,
        "academicSession" to a.academicSession,
        "assessmentDate" to a.assessmentDate,
        "maxMarks" to a.maxMarks,
        "passingPercentage" to a.passingPercentage,
        "isLocked" to a.isLocked,
        "updatedAt" to isoNow()
    )

    // ==========================================
    // Marks Entries CRUD (Room + Firestore)
    // ==========================================
    fun getAllMarkEntries(): Flow<List<MarkEntryEntity>> = markEntryDao.getAllEntries()

    fun getEntriesForAssessment(assessmentId: String): Flow<List<MarkEntryEntity>> =
        markEntryDao.getEntriesForAssessment(assessmentId)

    suspend fun saveMarkEntry(entry: MarkEntryEntity) {
        val normalized = entry.copy(className = normalizeClassName(entry.className))
        markEntryDao.insertOrUpdate(normalized)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("marks").document(normalized.markEntryId)
                    .set(markEntryToFirestoreMap(normalized), SetOptions.merge())
                    .awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun saveBatchMarkEntries(entries: List<MarkEntryEntity>) {
        val normalizedList = entries.map { it.copy(className = normalizeClassName(it.className)) }
        markEntryDao.insertOrUpdateAll(normalizedList)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                normalizedList.chunked(400).forEach { chunk ->
                    val batch = db.batch()
                    chunk.forEach { entry ->
                        val ref = db.collection("marks").document(entry.markEntryId)
                        batch.set(ref, markEntryToFirestoreMap(entry), SetOptions.merge())
                    }
                    batch.commit().awaitResult()
                }
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    private fun markEntryToFirestoreMap(m: MarkEntryEntity): Map<String, Any?> = mapOf(
        "markEntryId" to m.markEntryId,
        "assessmentId" to m.assessmentId,
        "studentId" to m.studentId,
        "academicSession" to m.academicSession,
        "className" to m.className,
        "subject" to m.subject,
        "maxMarks" to m.maxMarks,
        "obtainedMarks" to m.obtainedMarks,
        "status" to m.status,
        "result" to m.result,
        "remarks" to m.remarks,
        "updatedAt" to isoNow()
    )

    // ==========================================
    // Users / Staff Management (Room + Firestore)
    // ==========================================
    fun getAllUsers(): Flow<List<UserEntity>> =
        userDao?.getAllUsers() ?: MutableStateFlow(emptyList())

    suspend fun getUserByUid(uid: String): UserEntity? = userDao?.getUserByUid(uid)

    suspend fun getUserByEmail(email: String): UserEntity? = userDao?.getUserByEmail(email.trim().lowercase())

    suspend fun upsertUser(user: UserEntity) {
        val normalized = user.copy(
            email = user.email.trim().lowercase(),
            updatedAt = isoNow()
        )
        userDao?.insertUser(normalized)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                val map = mutableMapOf<String, Any>(
                    "uid" to normalized.uid,
                    "name" to normalized.name,
                    "email" to normalized.email,
                    "role" to normalized.role,
                    "active" to normalized.active,
                    "assignedSubject" to normalized.assignedSubject,
                    "assignedClass" to normalized.assignedClass,
                    "createdAt" to normalized.createdAt.ifBlank { isoNow() },
                    "updatedAt" to normalized.updatedAt
                )
                if (normalized.credentialToken.isNotBlank()) {
                    map["_cred"] = normalized.credentialToken
                }
                db.collection("users").document(normalized.uid)
                    .set(map, SetOptions.merge())
                    .awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    suspend fun deleteUser(uid: String) {
        userDao?.deleteUserByUid(uid)
        firestore?.let { db ->
            try {
                _syncStatus.value = SyncStatus.SYNCING
                db.collection("users").document(uid).delete().awaitResult()
                _syncStatus.value = SyncStatus.SYNCED
            } catch (_: Exception) {
                _syncStatus.value = SyncStatus.OFFLINE
            }
        }
    }

    // ==========================================
    // Comprehensive Student Result Calculation
    // ==========================================
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
            val hasFailedAny = subjectDetails.any {
                it.result.equals("Fail", ignoreCase = true) || it.status.equals("Absent", ignoreCase = true)
            }
            val overallResult = if (subjectDetails.isEmpty()) {
                "No Records"
            } else if (hasFailedAny || overallPct < defaultPassPercentage) {
                "Re-appear"
            } else {
                "Pass"
            }
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

    // ==========================================
    // Class Analytics
    // ==========================================
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
