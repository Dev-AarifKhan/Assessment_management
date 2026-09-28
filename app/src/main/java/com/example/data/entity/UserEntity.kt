package com.example.data.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "users",
    indices = [
        Index(value = ["email"], unique = true)
    ]
)
data class UserEntity(
    @PrimaryKey
    val uid: String,
    val name: String,
    val email: String,
    val role: String, // "admin" or "teacher"
    val active: Boolean = true,
    val assignedSubject: String = "All Subjects",
    val assignedClass: String = "All Classes",
    val createdAt: String = "",
    val updatedAt: String = "",
    val credentialToken: String = ""
)
