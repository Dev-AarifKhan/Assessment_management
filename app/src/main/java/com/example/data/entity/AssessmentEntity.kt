package com.example.data.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(
    tableName = "assessments",
    indices = [
        Index(value = ["academicSession", "className", "subject"])
    ]
)
data class AssessmentEntity(
    @PrimaryKey
    val assessmentId: String = UUID.randomUUID().toString(),
    val name: String, // e.g. "Unit Test 1 (T1)", "Mid-Term", "Golden Test", "Annual Examination"
    val type: String, // "Theory", "Practical", "Internal Assessment", "Project", "Comprehensive"
    val subject: String, // e.g. "English", "Mathematics", "Physics", "Chemistry", "Biology", "Urdu", etc.
    val className: String, // "9th", "10th", "11th", "12th"
    val academicSession: String, // "2025-2026"
    val assessmentDate: String, // "YYYY-MM-DD"
    val maxMarks: Double = 100.0,
    val passingPercentage: Double = 35.0,
    val isLocked: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
