package com.example.data.database

import com.example.data.entity.SchoolConfigEntity
import com.example.data.entity.UserEntity
import com.example.data.firebase.FirebaseManager

object InitialData {
    val SCHOOL_NAME = "Government Higher Secondary School Larnoo"
    val SCHOOL_CODE = "01061601505 (GHSS-LRN)"
    val SCHOOL_ADDRESS = "Larnoo, Anantnag, Jammu & Kashmir - 192202"
    val SCHOOL_AFFILIATION = "J&K Board of School Education (JKBOSE)"
    val DEFAULT_PASSING_PERCENTAGE = 33.0

    val CLASSES = listOf("9th", "10th", "11th", "12th")
    val SESSIONS = listOf("2025-2026", "2024-2025", "2023-2024")
    val STREAMS = listOf("General", "Medical", "Non-Medical", "Arts", "Commerce")
    val GENDERS = listOf("Male", "Female", "Other")
    val ASSESSMENT_TYPES = listOf("Theory", "Practical", "Internal Assessment", "Project", "Comprehensive")
    val SUBJECTS = listOf(
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
    )

    suspend fun seedInitialData(database: AppDatabase) {
        val configDao = database.schoolConfigDao()
        val userDao = database.userDao()

        // Initialize institutional configuration
        configDao.setConfig(SchoolConfigEntity("school_name", SCHOOL_NAME))
        configDao.setConfig(SchoolConfigEntity("school_code", SCHOOL_CODE))
        configDao.setConfig(SchoolConfigEntity("school_address", SCHOOL_ADDRESS))
        configDao.setConfig(SchoolConfigEntity("affiliation", SCHOOL_AFFILIATION))
        configDao.setConfig(SchoolConfigEntity("passing_percentage", "33.0"))
        configDao.setConfig(SchoolConfigEntity("active_session", "2025-2026"))

        // Ensure official Administrator exists in local cache
        userDao.insertUser(
            UserEntity(
                uid = "admin-ghss-larnoo",
                name = FirebaseManager.OFFICIAL_ADMIN_NAME,
                email = FirebaseManager.OFFICIAL_ADMIN_EMAIL,
                role = "admin",
                active = true,
                assignedSubject = "All Subjects",
                assignedClass = "All Classes",
                createdAt = "2025-01-01T00:00:00Z",
                updatedAt = "2025-01-01T00:00:00Z",
                credentialToken = FirebaseManager.encodeCredentialToken(FirebaseManager.OFFICIAL_ADMIN_PASSWORD)
            )
        )
    }
}
