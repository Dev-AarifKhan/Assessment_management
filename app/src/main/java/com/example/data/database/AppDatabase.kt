package com.example.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.dao.AssessmentDao
import com.example.data.dao.MarkEntryDao
import com.example.data.dao.SchoolConfigDao
import com.example.data.dao.StudentDao
import com.example.data.entity.AssessmentEntity
import com.example.data.entity.MarkEntryEntity
import com.example.data.entity.SchoolConfigEntity
import com.example.data.entity.StudentEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        StudentEntity::class,
        AssessmentEntity::class,
        MarkEntryEntity::class,
        SchoolConfigEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun studentDao(): StudentDao
    abstract fun assessmentDao(): AssessmentDao
    abstract fun markEntryDao(): MarkEntryDao
    abstract fun schoolConfigDao(): SchoolConfigDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "ghss_larnoo_assessment.db"
                )
                    .addCallback(DatabaseCallback(context.applicationContext))
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val context: Context
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // Seed initial data asynchronously on first creation
                CoroutineScope(Dispatchers.IO).launch {
                    val database = getInstance(context)
                    InitialData.seedInitialData(database)
                }
            }
        }
    }
}
