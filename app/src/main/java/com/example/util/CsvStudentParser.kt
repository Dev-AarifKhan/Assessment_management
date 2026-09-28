package com.example.util

import com.example.data.entity.StudentEntity
import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvStudentParser {

    const val SAMPLE_CSV_TEMPLATE = "StudentId,Name,Parentage,Class,RollNumber,Stream,Phone,Session"

    data class ParseResult(
        val validStudents: List<StudentEntity>,
        val totalRows: Int,
        val errorCount: Int,
        val errorMessages: List<String>
    )

    fun parse(inputStream: InputStream, defaultSession: String = "2025-2026"): ParseResult {
        val reader = BufferedReader(InputStreamReader(inputStream))
        val lines = reader.readLines()
        return parseLines(lines, defaultSession)
    }

    fun parseString(csvContent: String, defaultSession: String = "2025-2026"): ParseResult {
        val lines = csvContent.lines()
        return parseLines(lines, defaultSession)
    }

    private fun parseLines(lines: List<String>, defaultSession: String): ParseResult {
        if (lines.isEmpty()) {
            return ParseResult(emptyList(), 0, 0, listOf("The CSV file is empty."))
        }

        val headerLine = lines.firstOrNull() ?: return ParseResult(emptyList(), 0, 0, listOf("No header line found."))
        val headers = splitCsvLine(headerLine).map { it.trim().lowercase().replace("[^a-z0-9]".toRegex(), "") }

        val idIdx = headers.indexOfFirst { it in listOf("studentid", "id", "admissionno", "regno", "stuid") }
        val nameIdx = headers.indexOfFirst { it in listOf("name", "studentname", "fullname") }
        val parentageIdx = headers.indexOfFirst { it in listOf("parentage", "fathername", "father", "guardian") }
        val classIdx = headers.indexOfFirst { it in listOf("class", "classname", "grade") }
        val rollIdx = headers.indexOfFirst { it in listOf("rollnumber", "rollno", "roll") }
        val streamIdx = headers.indexOfFirst { it in listOf("stream", "discipline") }
        val phoneIdx = headers.indexOfFirst { it in listOf("phone", "mobile", "contact") }
        val sessionIdx = headers.indexOfFirst { it in listOf("session", "academicsession") }

        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val validStudents = mutableListOf<StudentEntity>()
        val errors = mutableListOf<String>()
        var dataRowCount = 0

        for (i in 1 until lines.size) {
            val line = lines[i].trim()
            if (line.isBlank()) continue
            dataRowCount++

            val tokens = splitCsvLine(line)
            fun getCol(idx: Int): String = if (idx in tokens.indices) tokens[idx].trim() else ""

            val studentId = if (idIdx != -1) getCol(idIdx) else ""
            val name = if (nameIdx != -1) getCol(nameIdx) else ""
            val parentage = if (parentageIdx != -1) getCol(parentageIdx) else ""
            var className = if (classIdx != -1) getCol(classIdx) else "10th"
            val roll = if (rollIdx != -1) getCol(rollIdx) else ""
            val stream = if (streamIdx != -1) getCol(streamIdx).ifBlank { "General" } else "General"
            val phone = if (phoneIdx != -1) getCol(phoneIdx) else ""
            val session = if (sessionIdx != -1) getCol(sessionIdx).ifBlank { defaultSession } else defaultSession

            if (studentId.isBlank()) {
                errors.add("Row $i: Missing Student ID (e.g. STU1)")
                continue
            }
            if (name.isBlank()) {
                errors.add("Row $i: Missing Student Name")
                continue
            }
            if (parentage.isBlank()) {
                errors.add("Row $i: Missing Parentage")
                continue
            }
            if (roll.isBlank()) {
                errors.add("Row $i: Missing Roll Number")
                continue
            }

            if (className.matches(Regex("^\\d+$"))) {
                className = "${className}th"
            }

            validStudents.add(
                StudentEntity(
                    studentId = studentId,
                    name = name,
                    parentage = parentage,
                    className = className,
                    rollNumber = roll,
                    academicSession = session,
                    stream = stream,
                    phone = phone,
                    admissionDate = today
                )
            )
        }

        return ParseResult(
            validStudents = validStudents,
            totalRows = dataRowCount,
            errorCount = errors.size,
            errorMessages = errors
        )
    }

    private fun splitCsvLine(line: String): List<String> {
        val result = mutableListOf<String>()
        val sb = StringBuilder()
        var inQuotes = false

        for (ch in line) {
            when {
                ch == '\"' -> inQuotes = !inQuotes
                ch == ',' && !inQuotes -> {
                    result.add(sb.toString())
                    sb.clear()
                }
                else -> sb.append(ch)
            }
        }
        result.add(sb.toString())
        return result
    }
}
