package com.example.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.entity.AssessmentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AssessmentDao {
    @Query("SELECT * FROM assessments ORDER BY createdAt DESC")
    fun getAllAssessments(): Flow<List<AssessmentEntity>>

    @Query("""
        SELECT * FROM assessments 
        WHERE (:className = '' OR className = :className)
          AND (:session = '' OR academicSession = :session)
          AND (:subject = '' OR subject = :subject)
        ORDER BY createdAt DESC
    """)
    fun getAssessmentsByFilter(className: String, session: String, subject: String): Flow<List<AssessmentEntity>>

    @Query("SELECT * FROM assessments WHERE className = :className AND academicSession = :session ORDER BY createdAt DESC")
    fun getAssessmentsForClassAndSession(className: String, session: String): Flow<List<AssessmentEntity>>

    @Query("SELECT * FROM assessments WHERE assessmentId = :assessmentId LIMIT 1")
    fun getAssessmentById(assessmentId: String): Flow<AssessmentEntity?>

    @Query("SELECT * FROM assessments WHERE assessmentId = :assessmentId LIMIT 1")
    suspend fun getAssessmentByIdDirect(assessmentId: String): AssessmentEntity?

    @Query("SELECT DISTINCT subject FROM assessments ORDER BY subject ASC")
    fun getAllSubjects(): Flow<List<String>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssessment(assessment: AssessmentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssessments(assessments: List<AssessmentEntity>)

    @Update
    suspend fun updateAssessment(assessment: AssessmentEntity)

    @Delete
    suspend fun deleteAssessment(assessment: AssessmentEntity)
}
