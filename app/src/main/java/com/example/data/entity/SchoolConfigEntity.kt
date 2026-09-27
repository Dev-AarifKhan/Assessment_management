package com.example.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "school_config")
data class SchoolConfigEntity(
    @PrimaryKey
    val key: String,
    val value: String
)
