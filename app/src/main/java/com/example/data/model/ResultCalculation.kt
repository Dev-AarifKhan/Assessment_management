package com.example.data.model

import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.StudentEntity

data class StudentAwardRow(
    val serialNumber: Int,
    val student: StudentEntity,
    val markEntryId: String?,
    val maxMarks: Double,
    val obtainedMarksText: String, // String representation for UI input
    val obtainedMarks: Double?,
    val status: String, // "Present", "Absent", "Medical"
    val result: String, // "Pass", "Fail", "Pending", "Absent"
    val remarks: String = ""
)

data class SubjectResultDetail(
    val assessmentName: String,
    val assessmentType: String,
    val subject: String,
    val assessmentDate: String,
    val maxMarks: Double,
    val obtainedMarks: Double?,
    val passingPercentage: Double,
    val status: String,
    val result: String,
    val percentage: Double,
    val grade: String,
    val remarks: String
)

data class StudentComprehensiveResult(
    val student: StudentEntity,
    val academicSession: String,
    val subjects: List<SubjectResultDetail>,
    val totalMaxMarks: Double,
    val totalObtainedMarks: Double,
    val overallPercentage: Double,
    val overallResult: String,
    val division: String,
    val overallGrade: String
)

data class ClassAnalyticsSummary(
    val className: String,
    val academicSession: String,
    val subject: String,
    val assessmentName: String,
    val totalEnrolled: Int,
    val appearedCount: Int,
    val passedCount: Int,
    val failedCount: Int,
    val absentCount: Int,
    val passPercentage: Double,
    val highestMarks: Double,
    val topperStudentName: String,
    val classAverage: Double,
    val gradeDistributions: Map<String, Int>
)

object ResultCalculator {

    fun computeResultStatus(
        obtained: Double?,
        maxMarks: Double,
        passingPercentage: Double,
        status: String
    ): String {
        return when (status) {
            "Absent" -> "Absent"
            "Medical" -> "Medical"
            else -> {
                if (obtained == null) {
                    "Pending"
                } else if (maxMarks <= 0) {
                    "Pending"
                } else {
                    val percentage = (obtained / maxMarks) * 100.0
                    if (percentage >= passingPercentage) "Pass" else "Fail"
                }
            }
        }
    }

    fun computeGrade(percentage: Double): String {
        return when {
            percentage >= 90.0 -> "A1"
            percentage >= 80.0 -> "A2"
            percentage >= 70.0 -> "B1"
            percentage >= 60.0 -> "B2"
            percentage >= 50.0 -> "C1"
            percentage >= 40.0 -> "C2"
            percentage >= 35.0 -> "D"
            else -> "E (Re-appear)"
        }
    }

    fun computeDivision(percentage: Double, hasFailedAny: Boolean): String {
        if (hasFailedAny || percentage < 35.0) return "Re-appear"
        return when {
            percentage >= 75.0 -> "1st Div with Distinction"
            percentage >= 60.0 -> "1st Division"
            percentage >= 50.0 -> "2nd Division"
            percentage >= 35.0 -> "3rd Division"
            else -> "Re-appear"
        }
    }
}
