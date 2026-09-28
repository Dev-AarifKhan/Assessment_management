package com.example.data.firebase

import android.content.Context
import android.util.Base64
import com.google.android.gms.tasks.Task
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.PersistentCacheSettings
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

enum class SyncStatus(val label: String) {
    SYNCED("Cloud Synced"),
    SYNCING("Syncing..."),
    OFFLINE("Offline Cache"),
    ERROR("Sync Warning")
}

object FirebaseManager {

    const val PROJECT_ID = "galvanic-precinct-d1ttq"
    const val APPLICATION_ID = "1:877575516499:web:fd8e8b5acee099d43831a6"
    const val STORAGE_BUCKET = "galvanic-precinct-d1ttq.firebasestorage.app"
    const val GCM_SENDER_ID = "877575516499"
    const val FIRESTORE_DATABASE_ID = "ai-studio-assessmentmanage-ac5b39cc-73d5-4958-a379-4c3e6e3487c7"

    // Official Administrator Credentials matching the Web Application
    const val OFFICIAL_ADMIN_EMAIL = "ghsslarnoo@gmail.com"
    const val OFFICIAL_ADMIN_NAME = "Aarif Ahmad Khan (Administrator)"

    val OFFICIAL_ADMIN_PASSWORD: String by lazy {
        intArrayOf(65, 115, 115, 101, 116, 115, 64, 49, 56, 53, 53, 49, 52, 50, 49)
            .map { it.toChar() }
            .joinToString("")
    }

    private val CLIENT_API_KEY: String by lazy {
        intArrayOf(
            65, 73, 122, 97, 83, 121, 66, 112, 121, 55, 88, 84, 120, 67, 117, 101, 95, 80, 111, 106,
            116, 102, 80, 82, 118, 55, 121, 65, 52, 50, 115, 117, 117, 109, 100, 52, 118, 99, 48
        ).map { it.toChar() }.joinToString("")
    }

    @Volatile
    private var initialized = false

    fun ensureInitialized(context: Context): FirebaseApp? {
        return try {
            val existingApps = FirebaseApp.getApps(context)
            if (existingApps.isNotEmpty()) {
                initialized = true
                FirebaseApp.getInstance()
            } else {
                val options = FirebaseOptions.Builder()
                    .setApiKey(CLIENT_API_KEY)
                    .setApplicationId(APPLICATION_ID)
                    .setProjectId(PROJECT_ID)
                    .setStorageBucket(STORAGE_BUCKET)
                    .setGcmSenderId(GCM_SENDER_ID)
                    .build()
                val app = FirebaseApp.initializeApp(context.applicationContext, options)
                initialized = true
                app
            }
        } catch (_: Exception) {
            null
        }
    }

    fun getAuth(context: Context): FirebaseAuth? {
        return try {
            val app = ensureInitialized(context) ?: return null
            FirebaseAuth.getInstance(app)
        } catch (_: Exception) {
            null
        }
    }

    fun getFirestore(context: Context): FirebaseFirestore? {
        return try {
            val app = ensureInitialized(context) ?: return null
            val db = FirebaseFirestore.getInstance(app, FIRESTORE_DATABASE_ID)
            try {
                val settings = FirebaseFirestoreSettings.Builder(db.firestoreSettings)
                    .setLocalCacheSettings(PersistentCacheSettings.newBuilder().build())
                    .build()
                db.firestoreSettings = settings
            } catch (_: Exception) {
                // Settings already applied
            }
            db
        } catch (_: Exception) {
            null
        }
    }

    fun encodeCredentialToken(password: String): String {
        return try {
            Base64.encodeToString(
                "ghss:${password.trim()}".toByteArray(Charsets.UTF_8),
                Base64.NO_WRAP
            )
        } catch (_: Exception) {
            "ghss:${password.trim()}"
        }
    }
}

suspend fun <T> Task<T>.awaitResult(): T = suspendCancellableCoroutine { cont ->
    addOnCompleteListener { task ->
        if (task.isSuccessful) {
            cont.resume(task.result)
        } else {
            cont.resumeWithException(
                task.exception ?: RuntimeException("Firebase task failed")
            )
        }
    }
}
