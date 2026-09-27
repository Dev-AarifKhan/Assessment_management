package com.example.util

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.example.R
import com.example.data.entity.AssessmentEntity
import com.example.data.model.StudentAwardRow
import com.example.data.model.StudentComprehensiveResult
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object PdfReportGenerator {

    private const val PAGE_WIDTH = 595  // Standard A4 width in points (72 dpi)
    private const val PAGE_HEIGHT = 842 // Standard A4 height in points (72 dpi)

    /**
     * Generates an official, multi-page Classwise Subject Award Roll PDF
     * with official school crest watermark, metadata, tabular results, statistics, and signatures.
     */
    fun generateClasswiseAwardPdf(
        context: Context,
        assessment: AssessmentEntity,
        rows: List<StudentAwardRow>
    ): File {
        val pdfDocument = PdfDocument()
        val schoolLogoBitmap = BitmapFactory.decodeResource(context.resources, R.drawable.ic_school_logo)

        val rowsPerPage = 22
        val totalPages = if (rows.isEmpty()) 1 else ((rows.size - 1) / rowsPerPage) + 1

        var passedCount = 0
        var failedCount = 0
        var absentCount = 0

        rows.forEach { r ->
            when (r.result) {
                "Pass" -> passedCount++
                "Absent" -> absentCount++
                else -> failedCount++
            }
        }

        for (pageIndex in 0 until totalPages) {
            val pageInfo = PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, pageIndex + 1).create()
            val page = pdfDocument.startPage(pageInfo)
            val canvas = page.canvas

            // 1. Draw Page Background & Double Border
            val bgPaint = Paint().apply { color = Color.WHITE }
            canvas.drawRect(0f, 0f, PAGE_WIDTH.toFloat(), PAGE_HEIGHT.toFloat(), bgPaint)

            // Outer Royal Blue Border
            val borderPaint = Paint().apply {
                color = Color.parseColor("#1D4ED8")
                style = Paint.Style.STROKE
                strokeWidth = 2.5f
            }
            canvas.drawRect(20f, 20f, (PAGE_WIDTH - 20).toFloat(), (PAGE_HEIGHT - 20).toFloat(), borderPaint)

            // Inner Gold Accent Border
            val innerBorderPaint = Paint().apply {
                color = Color.parseColor("#D97706")
                style = Paint.Style.STROKE
                strokeWidth = 1f
            }
            canvas.drawRect(24f, 24f, (PAGE_WIDTH - 24).toFloat(), (PAGE_HEIGHT - 24).toFloat(), innerBorderPaint)

            // 2. School Logo Watermark in Center
            if (schoolLogoBitmap != null) {
                val watermarkPaint = Paint().apply {
                    alpha = 24 // ~9.5% opacity for crisp read-through
                    isFilterBitmap = true
                }
                val watermarkSize = 340
                val watermarkLeft = (PAGE_WIDTH - watermarkSize) / 2
                val watermarkTop = (PAGE_HEIGHT - watermarkSize) / 2
                val destRect = Rect(watermarkLeft, watermarkTop, watermarkLeft + watermarkSize, watermarkTop + watermarkSize)
                canvas.drawBitmap(schoolLogoBitmap, null, destRect, watermarkPaint)
            }

            var currentY = 52f

            // 3. Header
            if (schoolLogoBitmap != null) {
                val headerLogoPaint = Paint().apply { isFilterBitmap = true }
                val headerLogoRect = Rect(36, 32, 86, 82)
                canvas.drawBitmap(schoolLogoBitmap, null, headerLogoRect, headerLogoPaint)
            }

            val schoolNamePaint = Paint().apply {
                color = Color.parseColor("#0F2850")
                textSize = 15f
                isFakeBoldText = true
                textAlign = Paint.Align.CENTER
            }
            canvas.drawText("GOVERNMENT HIGHER SECONDARY SCHOOL", (PAGE_WIDTH / 2f) + 15f, currentY, schoolNamePaint)

            currentY += 16f
            val locationPaint = Paint().apply {
                color = Color.parseColor("#D97706")
                textSize = 12f
                isFakeBoldText = true
                textAlign = Paint.Align.CENTER
            }
            canvas.drawText("LARNOO, ANANTNAG, JAMMU & KASHMIR", (PAGE_WIDTH / 2f) + 15f, currentY, locationPaint)

            currentY += 14f
            val subTitlePaint = Paint().apply {
                color = Color.DKGRAY
                textSize = 9f
                textAlign = Paint.Align.CENTER
            }
            canvas.drawText(
                "AFFILIATED TO JKBOSE • OFFICIAL SUBJECT MARKS AWARD ROLL" + if (totalPages > 1) " (Page ${pageIndex + 1} of $totalPages)" else "",
                (PAGE_WIDTH / 2f) + 15f,
                currentY,
                subTitlePaint
            )

            // Divider
            currentY += 12f
            val linePaint = Paint().apply {
                color = Color.parseColor("#1D4ED8")
                strokeWidth = 1.2f
            }
            canvas.drawLine(34f, currentY, (PAGE_WIDTH - 34).toFloat(), currentY, linePaint)

            // Assessment Metadata Box
            currentY += 16f
            val metaBoxPaint = Paint().apply {
                color = Color.parseColor("#F1F5F9")
                style = Paint.Style.FILL
            }
            val metaRect = RectF(34f, currentY - 10f, (PAGE_WIDTH - 34).toFloat(), currentY + 36f)
            canvas.drawRoundRect(metaRect, 6f, 6f, metaBoxPaint)

            val metaTextPaint = Paint().apply {
                color = Color.parseColor("#0F172A")
                textSize = 9.5f
                textAlign = Paint.Align.LEFT
            }
            val metaBoldPaint = Paint().apply {
                color = Color.parseColor("#0F172A")
                textSize = 9.5f
                isFakeBoldText = true
                textAlign = Paint.Align.LEFT
            }

            canvas.drawText("Subject: ", 44f, currentY + 4f, metaTextPaint)
            canvas.drawText(assessment.subject, 88f, currentY + 4f, metaBoldPaint)

            canvas.drawText("Class: ", 220f, currentY + 4f, metaTextPaint)
            canvas.drawText(assessment.className, 256f, currentY + 4f, metaBoldPaint)

            canvas.drawText("Session: ", 360f, currentY + 4f, metaTextPaint)
            canvas.drawText(assessment.academicSession, 406f, currentY + 4f, metaBoldPaint)

            currentY += 18f
            canvas.drawText("Assessment: ", 44f, currentY + 4f, metaTextPaint)
            canvas.drawText("${assessment.name} (${assessment.type})", 108f, currentY + 4f, metaBoldPaint)

            canvas.drawText("Max Marks: ", 360f, currentY + 4f, metaTextPaint)
            canvas.drawText("${assessment.maxMarks.toInt()}", 420f, currentY + 4f, metaBoldPaint)

            canvas.drawText("Pass Rule: ", 470f, currentY + 4f, metaTextPaint)
            canvas.drawText("${assessment.passingPercentage.toInt()}%", 522f, currentY + 4f, metaBoldPaint)

            // Table Header
            currentY += 32f
            val tableHeaderBg = Paint().apply {
                color = Color.parseColor("#1D4ED8")
                style = Paint.Style.FILL
            }
            canvas.drawRect(34f, currentY, (PAGE_WIDTH - 34).toFloat(), currentY + 22f, tableHeaderBg)

            val thPaint = Paint().apply {
                color = Color.WHITE
                textSize = 9f
                isFakeBoldText = true
            }

            canvas.drawText("S.No", 42f, currentY + 14f, thPaint)
            canvas.drawText("Student Name", 84f, currentY + 14f, thPaint)
            canvas.drawText("Student ID", 240f, currentY + 14f, thPaint)
            canvas.drawText("Roll No", 340f, currentY + 14f, thPaint)
            canvas.drawText("Max", 400f, currentY + 14f, thPaint)
            canvas.drawText("Obtained", 446f, currentY + 14f, thPaint)
            canvas.drawText("Result", 516f, currentY + 14f, thPaint)

            currentY += 22f
            val rowBgEven = Paint().apply { color = Color.parseColor("#FFFFFF") }
            val rowBgOdd = Paint().apply { color = Color.parseColor("#F8FAFC") }
            val cellTextPaint = Paint().apply {
                color = Color.parseColor("#0F172A")
                textSize = 8.5f
            }
            val cellBoldPaint = Paint().apply {
                color = Color.parseColor("#0F172A")
                textSize = 8.5f
                isFakeBoldText = true
            }
            val passTextPaint = Paint().apply {
                color = Color.parseColor("#047857")
                textSize = 8.5f
                isFakeBoldText = true
            }
            val failTextPaint = Paint().apply {
                color = Color.parseColor("#DC2626")
                textSize = 8.5f
                isFakeBoldText = true
            }
            val gridLinePaint = Paint().apply {
                color = Color.parseColor("#E2E8F0")
                strokeWidth = 0.5f
            }

            val startIndex = pageIndex * rowsPerPage
            val endIndex = (startIndex + rowsPerPage).coerceAtMost(rows.size)
            val pageRows = if (startIndex < rows.size) rows.subList(startIndex, endIndex) else emptyList()

            for ((i, row) in pageRows.withIndex()) {
                val rowY = currentY + (i * 20f)
                val bg = if (i % 2 == 0) rowBgEven else rowBgOdd
                canvas.drawRect(34f, rowY, (PAGE_WIDTH - 34).toFloat(), rowY + 20f, bg)
                canvas.drawLine(34f, rowY + 20f, (PAGE_WIDTH - 34).toFloat(), rowY + 20f, gridLinePaint)

                canvas.drawText("${row.serialNumber}", 44f, rowY + 13f, cellTextPaint)
                val nameDisplay = if (row.student.name.length > 24) row.student.name.take(23) + "…" else row.student.name
                canvas.drawText(nameDisplay, 84f, rowY + 13f, cellBoldPaint)
                canvas.drawText(row.student.studentId, 240f, rowY + 13f, cellTextPaint)
                canvas.drawText(row.student.rollNumber, 350f, rowY + 13f, cellBoldPaint)
                canvas.drawText("${row.maxMarks.toInt()}", 404f, rowY + 13f, cellTextPaint)

                val obtStr = row.obtainedMarks?.toInt()?.toString() ?: row.status
                canvas.drawText(obtStr, 456f, rowY + 13f, cellBoldPaint)

                val resColorPaint = when (row.result) {
                    "Pass" -> passTextPaint
                    "Absent" -> cellTextPaint
                    else -> failTextPaint
                }
                canvas.drawText(row.result, 516f, rowY + 13f, resColorPaint)
            }

            // If it's the last page, draw the summary & signature block
            if (pageIndex == totalPages - 1) {
                val summaryY = PAGE_HEIGHT - 100f
                val summaryBox = RectF(34f, summaryY, (PAGE_WIDTH - 34).toFloat(), summaryY + 24f)
                canvas.drawRoundRect(summaryBox, 4f, 4f, metaBoxPaint)

                val totalAppeared = rows.size - absentCount
                val passRate = if (totalAppeared > 0) (passedCount.toDouble() / totalAppeared * 100) else 0.0
                val statPaint = Paint().apply {
                    color = Color.parseColor("#0F172A")
                    textSize = 8.5f
                    isFakeBoldText = true
                }
                canvas.drawText(
                    "Total: ${rows.size} | Appeared: $totalAppeared | Passed: $passedCount | Failed: $failedCount | Absent: $absentCount | Pass %: ${String.format(Locale.getDefault(), "%.1f", passRate)}%",
                    44f, summaryY + 16f, statPaint
                )

                // Signatures
                val signY = PAGE_HEIGHT - 44f
                val signPaint = Paint().apply {
                    color = Color.parseColor("#0F172A")
                    textSize = 9f
                    isFakeBoldText = true
                    textAlign = Paint.Align.CENTER
                }
                val signLinePaint = Paint().apply {
                    color = Color.GRAY
                    strokeWidth = 0.8f
                }

                canvas.drawLine(50f, signY, 180f, signY, signLinePaint)
                canvas.drawText("Subject Teacher Signature", 115f, signY + 14f, signPaint)

                canvas.drawLine(240f, signY, 360f, signY, signLinePaint)
                canvas.drawText("Incharge Examination", 300f, signY + 14f, signPaint)

                canvas.drawLine(410f, signY, 540f, signY, signLinePaint)
                canvas.drawText("Principal Seal & Sign", 475f, signY + 14f, signPaint)
            }

            pdfDocument.finishPage(page)
        }

        // Save PDF to cache directory
        val outputDir = File(context.cacheDir, "reports")
        if (!outputDir.exists()) outputDir.mkdirs()
        val safeSubject = assessment.subject.replace(Regex("[^a-zA-Z0-9]"), "_")
        val pdfFile = File(outputDir, "Award_Roll_${assessment.className}_${safeSubject}.pdf")
        FileOutputStream(pdfFile).use { out ->
            pdfDocument.writeTo(out)
        }
        pdfDocument.close()
        return pdfFile
    }

    /**
     * Generates a printable student marksheet / academic transcript PDF
     * with the official GHSS Larnoo watermark, border, grades, and signatures.
     */
    fun generateStudentMarksheetPdf(
        context: Context,
        result: StudentComprehensiveResult
    ): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas
        val schoolLogoBitmap = BitmapFactory.decodeResource(context.resources, R.drawable.ic_school_logo)

        // 1. Page Background & Double Border
        val bgPaint = Paint().apply { color = Color.WHITE }
        canvas.drawRect(0f, 0f, PAGE_WIDTH.toFloat(), PAGE_HEIGHT.toFloat(), bgPaint)

        // Outer Royal Blue Border
        val borderPaint = Paint().apply {
            color = Color.parseColor("#1D4ED8")
            style = Paint.Style.STROKE
            strokeWidth = 2.5f
        }
        canvas.drawRect(20f, 20f, (PAGE_WIDTH - 20).toFloat(), (PAGE_HEIGHT - 20).toFloat(), borderPaint)

        // Inner Gold Border
        val innerBorderPaint = Paint().apply {
            color = Color.parseColor("#D97706")
            style = Paint.Style.STROKE
            strokeWidth = 1f
        }
        canvas.drawRect(24f, 24f, (PAGE_WIDTH - 24).toFloat(), (PAGE_HEIGHT - 24).toFloat(), innerBorderPaint)

        // 2. School Logo Watermark in Center
        if (schoolLogoBitmap != null) {
            val watermarkPaint = Paint().apply {
                alpha = 24
                isFilterBitmap = true
            }
            val watermarkSize = 340
            val watermarkLeft = (PAGE_WIDTH - watermarkSize) / 2
            val watermarkTop = (PAGE_HEIGHT - watermarkSize) / 2
            val destRect = Rect(watermarkLeft, watermarkTop, watermarkLeft + watermarkSize, watermarkTop + watermarkSize)
            canvas.drawBitmap(schoolLogoBitmap, null, destRect, watermarkPaint)
        }

        // 3. Header
        var currentY = 56f
        if (schoolLogoBitmap != null) {
            val headerLogoPaint = Paint().apply { isFilterBitmap = true }
            val headerLogoRect = Rect(40, 36, 92, 88)
            canvas.drawBitmap(schoolLogoBitmap, null, headerLogoRect, headerLogoPaint)
        }

        val schoolNamePaint = Paint().apply {
            color = Color.parseColor("#0F2850")
            textSize = 15f
            isFakeBoldText = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("GOVERNMENT HIGHER SECONDARY SCHOOL", (PAGE_WIDTH / 2f) + 15f, currentY, schoolNamePaint)

        currentY += 16f
        val locationPaint = Paint().apply {
            color = Color.parseColor("#D97706")
            textSize = 12f
            isFakeBoldText = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("LARNOO, ANANTNAG (JAMMU & KASHMIR)", (PAGE_WIDTH / 2f) + 15f, currentY, locationPaint)

        currentY += 14f
        val subTitlePaint = Paint().apply {
            color = Color.DKGRAY
            textSize = 9f
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("AFFILIATED TO J&K BOARD OF SCHOOL EDUCATION", (PAGE_WIDTH / 2f) + 15f, currentY, subTitlePaint)

        currentY += 14f
        val titleBadgePaint = Paint().apply {
            color = Color.parseColor("#1D4ED8")
            textSize = 11f
            isFakeBoldText = true
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("OFFICIAL MARKS STATEMENT & TRANSCRIPT", (PAGE_WIDTH / 2f) + 15f, currentY, titleBadgePaint)

        // Divider
        currentY += 12f
        val linePaint = Paint().apply {
            color = Color.parseColor("#1D4ED8")
            strokeWidth = 1.2f
        }
        canvas.drawLine(34f, currentY, (PAGE_WIDTH - 34).toFloat(), currentY, linePaint)

        // Student Particulars Box
        currentY += 16f
        val student = result.student
        val particularsBox = RectF(34f, currentY - 10f, (PAGE_WIDTH - 34).toFloat(), currentY + 54f)
        val partBg = Paint().apply { color = Color.parseColor("#F1F5F9") }
        canvas.drawRoundRect(particularsBox, 6f, 6f, partBg)

        val pText = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 9.5f
        }
        val pBold = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 9.5f
            isFakeBoldText = true
        }

        canvas.drawText("Candidate Name:", 44f, currentY + 4f, pText)
        canvas.drawText(student.name, 130f, currentY + 4f, pBold)

        canvas.drawText("Parentage:", 340f, currentY + 4f, pText)
        canvas.drawText(student.parentage, 400f, currentY + 4f, pBold)

        currentY += 18f
        canvas.drawText("Student ID:", 44f, currentY + 4f, pText)
        canvas.drawText(student.studentId, 130f, currentY + 4f, pBold)

        canvas.drawText("Roll Number:", 340f, currentY + 4f, pText)
        canvas.drawText(student.rollNumber, 400f, currentY + 4f, pBold)

        currentY += 18f
        canvas.drawText("Class & Stream:", 44f, currentY + 4f, pText)
        canvas.drawText("${student.className} (${student.stream})", 130f, currentY + 4f, pBold)

        canvas.drawText("Academic Session:", 340f, currentY + 4f, pText)
        canvas.drawText(result.academicSession, 435f, currentY + 4f, pBold)

        // Marks Table Header
        currentY += 34f
        val thBg = Paint().apply {
            color = Color.parseColor("#1D4ED8")
            style = Paint.Style.FILL
        }
        canvas.drawRect(34f, currentY, (PAGE_WIDTH - 34).toFloat(), currentY + 22f, thBg)

        val thText = Paint().apply {
            color = Color.WHITE
            textSize = 9f
            isFakeBoldText = true
        }

        canvas.drawText("Subject", 44f, currentY + 14f, thText)
        canvas.drawText("Assessment", 190f, currentY + 14f, thText)
        canvas.drawText("Max Marks", 330f, currentY + 14f, thText)
        canvas.drawText("Pass Marks", 395f, currentY + 14f, thText)
        canvas.drawText("Obtained", 465f, currentY + 14f, thText)
        canvas.drawText("Result", 522f, currentY + 14f, thText)

        currentY += 22f
        val rowBgEven = Paint().apply { color = Color.parseColor("#FFFFFF") }
        val rowBgOdd = Paint().apply { color = Color.parseColor("#F8FAFC") }
        val cellText = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 8.5f
        }
        val cellBold = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 8.5f
            isFakeBoldText = true
        }
        val passText = Paint().apply {
            color = Color.parseColor("#047857")
            textSize = 8.5f
            isFakeBoldText = true
        }
        val failText = Paint().apply {
            color = Color.parseColor("#DC2626")
            textSize = 8.5f
            isFakeBoldText = true
        }
        val gridLine = Paint().apply {
            color = Color.parseColor("#E2E8F0")
            strokeWidth = 0.5f
        }

        for ((index, sub) in result.subjects.withIndex()) {
            val rowY = currentY + (index * 22f)
            val bg = if (index % 2 == 0) rowBgEven else rowBgOdd
            canvas.drawRect(34f, rowY, (PAGE_WIDTH - 34).toFloat(), rowY + 22f, bg)
            canvas.drawLine(34f, rowY + 22f, (PAGE_WIDTH - 34).toFloat(), rowY + 22f, gridLine)

            canvas.drawText(sub.subject, 44f, rowY + 14f, cellBold)
            canvas.drawText(sub.assessmentName, 190f, rowY + 14f, cellText)
            canvas.drawText("${sub.maxMarks.toInt()}", 345f, rowY + 14f, cellText)

            val passScore = (sub.maxMarks * (sub.passingPercentage / 100.0)).toInt()
            canvas.drawText("$passScore", 410f, rowY + 14f, cellText)

            val obtStr = sub.obtainedMarks?.toInt()?.toString() ?: sub.status
            canvas.drawText(obtStr, 475f, rowY + 14f, cellBold)

            val resColor = if (sub.result == "Pass") passText else failText
            canvas.drawText(sub.result, 524f, rowY + 14f, resColor)
        }

        // Summary Card
        val summaryY = PAGE_HEIGHT - 120f
        val sumBox = RectF(34f, summaryY, (PAGE_WIDTH - 34).toFloat(), summaryY + 36f)
        canvas.drawRoundRect(sumBox, 4f, 4f, partBg)

        val statBld = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 9.5f
            isFakeBoldText = true
        }
        val blueBld = Paint().apply {
            color = Color.parseColor("#1D4ED8")
            textSize = 10f
            isFakeBoldText = true
        }
        val goldBld = Paint().apply {
            color = Color.parseColor("#D97706")
            textSize = 10f
            isFakeBoldText = true
        }

        canvas.drawText("Grand Total: ${result.totalObtainedMarks.toInt()} / ${result.totalMaxMarks.toInt()}", 44f, summaryY + 16f, statBld)
        canvas.drawText("Percentage: ${String.format(Locale.getDefault(), "%.1f", result.overallPercentage)}%", 44f, summaryY + 28f, blueBld)

        canvas.drawText("Division: ${result.division}", 340f, summaryY + 16f, statBld)
        canvas.drawText("Overall Grade: ${result.overallGrade}", 340f, summaryY + 28f, goldBld)

        // Signatures
        val signY = PAGE_HEIGHT - 44f
        val signPaint = Paint().apply {
            color = Color.parseColor("#0F172A")
            textSize = 9f
            isFakeBoldText = true
            textAlign = Paint.Align.CENTER
        }
        val signLine = Paint().apply {
            color = Color.GRAY
            strokeWidth = 0.8f
        }

        canvas.drawLine(50f, signY, 180f, signY, signLine)
        canvas.drawText("Class Teacher", 115f, signY + 14f, signPaint)

        canvas.drawLine(240f, signY, 360f, signY, signLine)
        canvas.drawText("Incharge Examination", 300f, signY + 14f, signPaint)

        canvas.drawLine(410f, signY, 540f, signY, signLine)
        canvas.drawText("Principal GHSS Larnoo", 475f, signY + 14f, signPaint)

        pdfDocument.finishPage(page)

        val outputDir = File(context.cacheDir, "reports")
        if (!outputDir.exists()) outputDir.mkdirs()
        val safeName = student.name.replace(Regex("[^a-zA-Z0-9]"), "_")
        val pdfFile = File(outputDir, "Marksheet_${student.studentId}_${safeName}.pdf")
        FileOutputStream(pdfFile).use { out ->
            pdfDocument.writeTo(out)
        }
        pdfDocument.close()
        return pdfFile
    }

    fun openOrSharePdf(context: Context, file: File, title: String) {
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        val viewIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/pdf")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, title)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        val chooser = Intent.createChooser(shareIntent, title)
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(chooser)
        } catch (_: Exception) {
            context.startActivity(viewIntent)
        }
    }
}
