package com.example.data.model

import com.example.data.entity.UserEntity

enum class UserRole(val displayName: String, val firestoreValue: String, val description: String) {
    ADMIN(
        displayName = "Administrator",
        firestoreValue = "admin",
        description = "Full system access: student registration, assessment setup, user management, passing criteria, and system reports."
    ),
    TEACHER(
        displayName = "Subject Teacher",
        firestoreValue = "teacher",
        description = "Award submission: marks entry, student evaluation, subject award rolls, and class results."
    );

    companion object {
        fun fromFirestoreValue(value: String?): UserRole {
            return if (value?.trim()?.lowercase() == "admin") ADMIN else TEACHER
        }
    }
}

data class CurrentUser(
    val uid: String = "admin-ghss-larnoo",
    val email: String,
    val name: String,
    val role: UserRole,
    val active: Boolean = true,
    val assignedSubject: String = "All Subjects",
    val assignedClass: String = "All Classes",
    val createdAt: String = "",
    val updatedAt: String = ""
) {
    fun toUserEntity(credentialToken: String = ""): UserEntity {
        return UserEntity(
            uid = uid,
            name = name,
            email = email.trim().lowercase(),
            role = role.firestoreValue,
            active = active,
            assignedSubject = assignedSubject,
            assignedClass = assignedClass,
            createdAt = createdAt,
            updatedAt = updatedAt,
            credentialToken = credentialToken
        )
    }

    companion object {
        fun fromUserEntity(entity: UserEntity): CurrentUser {
            return CurrentUser(
                uid = entity.uid,
                email = entity.email,
                name = entity.name,
                role = UserRole.fromFirestoreValue(entity.role),
                active = entity.active,
                assignedSubject = entity.assignedSubject,
                assignedClass = entity.assignedClass,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt
            )
        }

        val DEFAULT_ADMIN = CurrentUser(
            uid = "admin-ghss-larnoo",
            email = "ghsslarnoo@gmail.com",
            name = "Aarif Ahmad Khan (Administrator)",
            role = UserRole.ADMIN,
            active = true,
            assignedSubject = "All Subjects",
            assignedClass = "All Classes"
        )

        val DEFAULT_TEACHER = CurrentUser(
            uid = "teacher-ghss-larnoo",
            email = "teacher@ghsslarnoo.edu",
            name = "Subject Teacher",
            role = UserRole.TEACHER,
            active = true,
            assignedSubject = "Mathematics",
            assignedClass = "10th"
        )
    }
}
