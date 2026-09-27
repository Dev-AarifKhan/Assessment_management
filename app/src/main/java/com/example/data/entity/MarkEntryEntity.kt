package com.example.data.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(
    tableName = "marks_entries",
    indices = [
        Index(value = ["assessmentId", "studentId"], unique = true),
        Index(value = ["studentId"]),
        Index(value = ["academicSession", "className", "subject"])
    ]
)
data class MarkEntryEntity(
    @PrimaryKey
    val markEntryId: String = UUID.randomUUID().toString(),
    val assessmentId: String,
    val studentId: String,
    val academicSession: String,
    val className: String,
    val subject: String,
    val maxMarks: Double,
    val obtainedMarks: Double?, // null if not entered
    val status: String = "Present", // "Present", "Absent", "Medical"
    val result: String = "Pending", // "Pass", "Fail", "Pending", "Absent", "Exempt"
    val remarks: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)
