package com.example.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.entity.SchoolConfigEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SchoolConfigDao {
    @Query("SELECT * FROM school_config WHERE `key` = :key LIMIT 1")
    fun getConfig(key: String): Flow<SchoolConfigEntity?>

    @Query("SELECT * FROM school_config WHERE `key` = :key LIMIT 1")
    suspend fun getConfigDirect(key: String): SchoolConfigEntity?

    @Query("SELECT * FROM school_config")
    fun getAllConfigs(): Flow<List<SchoolConfigEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setConfig(config: SchoolConfigEntity)
}
