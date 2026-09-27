package com.example.data.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "students",
    indices = [
        Index(value = ["academicSession", "className", "rollNumber"], unique = false),
        Index(value = ["studentId"], unique = true)
    ]
)
data class StudentEntity(
    @PrimaryKey
    val studentId: String,
    val name: String,
    val parentage: String,
    val className: String, // "9th", "10th", "11th", "12th"
    val rollNumber: String,
    val academicSession: String, // e.g. "2025-2026"
    val stream: String = "General", // "General", "Medical", "Non-Medical", "Arts", "Commerce"
    val phone: String = "",
    val admissionDate: String = "",
    val gender: String = "All",
    val createdAt: Long = System.currentTimeMillis()
)
