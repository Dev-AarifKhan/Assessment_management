package com.example.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.entity.MarkEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MarkEntryDao {
    @Query("SELECT * FROM marks_entries WHERE assessmentId = :assessmentId ORDER BY studentId ASC")
    fun getEntriesForAssessment(assessmentId: String): Flow<List<MarkEntryEntity>>

    @Query("SELECT * FROM marks_entries WHERE assessmentId = :assessmentId")
    suspend fun getEntriesForAssessmentDirect(assessmentId: String): List<MarkEntryEntity>

    @Query("SELECT * FROM marks_entries WHERE studentId = :studentId ORDER BY updatedAt DESC")
    fun getEntriesForStudent(studentId: String): Flow<List<MarkEntryEntity>>

    @Query("SELECT * FROM marks_entries WHERE studentId = :studentId AND academicSession = :session ORDER BY subject ASC")
    fun getEntriesForStudentAndSession(studentId: String, session: String): Flow<List<MarkEntryEntity>>

    @Query("""
        SELECT * FROM marks_entries 
        WHERE academicSession = :session 
          AND className = :className 
          AND (:subject = '' OR subject = :subject)
    """)
    fun getEntriesByFilter(className: String, session: String, subject: String): Flow<List<MarkEntryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(entry: MarkEntryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(entries: List<MarkEntryEntity>)

    @Query("DELETE FROM marks_entries WHERE assessmentId = :assessmentId")
    suspend fun deleteEntriesForAssessment(assessmentId: String)
}
