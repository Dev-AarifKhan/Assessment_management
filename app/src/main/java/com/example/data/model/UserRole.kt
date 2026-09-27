package com.example.data.model

enum class UserRole(val displayName: String, val description: String) {
    ADMIN("Administrator", "Full system access: student registration, assessment setup, passing criteria, and system reports."),
    TEACHER("Subject Teacher", "Award submission: marks entry, student evaluation, subject award rolls, and class results.")
}

data class CurrentUser(
    val email: String,
    val name: String,
    val role: UserRole,
    val assignedSubject: String = "Mathematics",
    val assignedClass: String = "10th"
) {
    companion object {
        val DEFAULT_ADMIN = CurrentUser(
            email = "admin@ghsslarnoo.edu",
            name = "Principal / Exam Incharge",
            role = UserRole.ADMIN,
            assignedSubject = "All Subjects",
            assignedClass = "All Classes"
        )

        val DEFAULT_TEACHER = CurrentUser(
            email = "teacher@ghsslarnoo.edu",
            name = "Mr. Mohammad Amin (Teacher)",
            role = UserRole.TEACHER,
            assignedSubject = "Mathematics",
            assignedClass = "10th"
        )
    }
}
