package com.example.data.database

import com.example.data.entity.SchoolConfigEntity

object InitialData {
    val SCHOOL_NAME = "Government Higher Secondary School Larnoo"
    val SCHOOL_CODE = "GHSS-LRN"
    val DEFAULT_PASSING_PERCENTAGE = 33.0

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

        // Initialize only institutional configuration; no dummy students, assessments, or marks
        configDao.setConfig(SchoolConfigEntity("school_name", SCHOOL_NAME))
        configDao.setConfig(SchoolConfigEntity("passing_percentage", "33.0"))
        configDao.setConfig(SchoolConfigEntity("active_session", "2025-2026"))
        configDao.setConfig(SchoolConfigEntity("school_address", "Larnoo, Anantnag, Jammu & Kashmir - 192202"))
    }
}
