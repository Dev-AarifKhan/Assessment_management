package com.example.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.entity.StudentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StudentDao {
    @Query("SELECT * FROM students ORDER BY className ASC, CAST(rollNumber AS INTEGER) ASC")
    fun getAllStudents(): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students ORDER BY className ASC, CAST(rollNumber AS INTEGER) ASC")
    suspend fun getAllStudentsDirect(): List<StudentEntity>

    @Query("SELECT * FROM students WHERE className = :className AND academicSession = :session ORDER BY CAST(rollNumber AS INTEGER) ASC, name ASC")
    fun getStudentsByClassAndSession(className: String, session: String): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students WHERE studentId = :studentId LIMIT 1")
    fun getStudentById(studentId: String): Flow<StudentEntity?>

    @Query("SELECT * FROM students WHERE studentId = :studentId LIMIT 1")
    suspend fun getStudentByIdDirect(studentId: String): StudentEntity?

    @Query("""
        SELECT * FROM students 
        WHERE name LIKE '%' || :query || '%' 
           OR studentId LIKE '%' || :query || '%' 
           OR rollNumber LIKE '%' || :query || '%'
           OR parentage LIKE '%' || :query || '%'
        ORDER BY className ASC, CAST(rollNumber AS INTEGER) ASC
    """)
    fun searchStudents(query: String): Flow<List<StudentEntity>>

    @Query("SELECT DISTINCT academicSession FROM students ORDER BY academicSession DESC")
    fun getAllSessions(): Flow<List<String>>

    @Query("SELECT COUNT(*) FROM students")
    fun getStudentCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudent(student: StudentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudents(students: List<StudentEntity>)

    @Update
    suspend fun updateStudent(student: StudentEntity)

    @Delete
    suspend fun deleteStudent(student: StudentEntity)

    @Query("DELETE FROM students WHERE studentId = :studentId")
    suspend fun deleteStudentById(studentId: String)
}
