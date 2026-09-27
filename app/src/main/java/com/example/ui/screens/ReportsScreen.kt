package com.example.ui.screens

import android.content.Intent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Print
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.MainViewModel
import com.example.ui.theme.AmberGold
import com.example.ui.theme.CardBorderLight
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyPrimary
import com.example.ui.theme.PassEmerald
import com.example.ui.theme.SurfaceVariantLight
import com.example.util.PdfReportGenerator
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedReportTab by remember { mutableIntStateOf(0) } // 0: Marksheet, 1: Award Roll

    val studentResult by viewModel.studentComprehensiveResult.collectAsState()
    val allStudents by viewModel.allStudents.collectAsState()
    val activeAssessment by viewModel.activeAssessment.collectAsState()
    val allAssessments by viewModel.allAssessments.collectAsState()
    val marksRows by viewModel.marksRows.collectAsState()

    var studentPickerExpanded by remember { mutableStateOf(false) }
    var assessmentPickerExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Reports Section Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Reports & Printable Documents",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Official transcripts, marksheets, and classwise award rolls in PDF",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tabs: Student Marksheet vs Subject Award Roll
        PrimaryTabRow(
            selectedTabIndex = selectedReportTab,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = NavyPrimary
        ) {
            Tab(
                selected = selectedReportTab == 0,
                onClick = { selectedReportTab = 0 },
                text = { Text("Printable Marksheet", fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = selectedReportTab == 1,
                onClick = { selectedReportTab = 1 },
                text = { Text("Classwise Award Roll", fontWeight = FontWeight.Bold) }
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (selectedReportTab == 0) {
            // TAB 1: Student Marksheet View
            if (studentResult == null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Please select a student to preview and print marksheet.")
                }
            } else {
                val res = studentResult!!
                val student = res.student

                Column(modifier = Modifier.weight(1f)) {
                    // Quick student selector & Print/PDF buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box {
                            OutlinedButton(
                                onClick = { studentPickerExpanded = true },
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Student: ${student.name.take(15)}")
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                            DropdownMenu(
                                expanded = studentPickerExpanded,
                                onDismissRequest = { studentPickerExpanded = false }
                            ) {
                                allStudents.forEach { s ->
                                    DropdownMenuItem(
                                        text = { Text("${s.name} (${s.className}, Roll ${s.rollNumber})") },
                                        onClick = {
                                            viewModel.selectStudent(s)
                                            studentPickerExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Generate PDF Button
                            Button(
                                onClick = {
                                    val pdfFile = PdfReportGenerator.generateStudentMarksheetPdf(context, res)
                                    PdfReportGenerator.openOrSharePdf(context, pdfFile, "Marksheet_${student.name}")
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                                modifier = Modifier.testTag("btn_pdf_marksheet")
                            ) {
                                Icon(Icons.Default.PictureAsPdf, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("PDF", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            // Print / Share Button
                            OutlinedButton(
                                onClick = {
                                    val printText = viewModel.generateMarksheetPrintContent(res)
                                    val sendIntent = Intent().apply {
                                        action = Intent.ACTION_SEND
                                        putExtra(Intent.EXTRA_TEXT, printText)
                                        putExtra(Intent.EXTRA_TITLE, "GHSS Larnoo - Marksheet (${student.name})")
                                        type = "text/plain"
                                    }
                                    val shareIntent = Intent.createChooser(sendIntent, "Print / Share Marksheet")
                                    context.startActivity(shareIntent)
                                },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                                modifier = Modifier.testTag("btn_print_marksheet")
                            ) {
                                Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Print", fontSize = 12.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Printable Marksheet Document Card with School Crest Watermark
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.5.dp, NavyPrimary)
                    ) {
                        Box(modifier = Modifier.fillMaxSize()) {
                            // Official School Crest Watermark centered
                            Image(
                                painter = painterResource(id = R.drawable.ic_school_logo),
                                contentDescription = "School Logo Watermark",
                                alpha = 0.09f,
                                modifier = Modifier
                                    .size(280.dp)
                                    .align(Alignment.Center)
                            )

                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                contentPadding = PaddingValues(bottom = 20.dp)
                            ) {
                                // Official School Certificate Header
                                item {
                                    Column(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.Center
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.ic_school_logo),
                                                contentDescription = "GHSS Larnoo Logo",
                                                modifier = Modifier
                                                    .size(46.dp)
                                                    .clip(CircleShape)
                                            )
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                Text(
                                                    text = "GOVERNMENT HIGHER SECONDARY SCHOOL",
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 13.sp,
                                                    color = NavyPrimary,
                                                    letterSpacing = 0.5.sp
                                                )
                                                Text(
                                                    text = "LARNOO, ANANTNAG (J&K)",
                                                    fontWeight = FontWeight.ExtraBold,
                                                    fontSize = 16.sp,
                                                    color = NavyDark
                                                )
                                                Text(
                                                    text = "AFFILIATED TO J&K BOARD OF SCHOOL EDUCATION",
                                                    fontSize = 9.sp,
                                                    color = Color.DarkGray,
                                                    letterSpacing = 1.sp
                                                )
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(8.dp))

                                        Surface(
                                            color = AmberGold.copy(alpha = 0.15f),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = "ACADEMIC TRANSCRIPT & RESULT CARD",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = AmberGold,
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 3.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(14.dp))
                                    HorizontalDivider(color = Color.Black, thickness = 1.dp)
                                    Spacer(modifier = Modifier.height(10.dp))
                                }

                                // Student Particulars Box
                                item {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(SurfaceVariantLight, RoundedCornerShape(6.dp))
                                            .padding(10.dp)
                                    ) {
                                        Row(modifier = Modifier.fillMaxWidth()) {
                                            Text("Candidate Name: ", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Black)
                                            Text(student.name, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp, color = NavyPrimary)
                                        }
                                        Spacer(modifier = Modifier.height(3.dp))
                                        Row(modifier = Modifier.fillMaxWidth()) {
                                            Text("Parentage: ", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Black)
                                            Text(student.parentage, fontSize = 12.sp, color = Color.Black)
                                        }
                                        Spacer(modifier = Modifier.height(3.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text("Student ID: ${student.studentId}", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Color.Black)
                                            Text("Class: ${student.className} (${student.stream})", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                            Text("Roll No: ${student.rollNumber}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                            Text("Session: ${res.academicSession}", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Color.Black)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(14.dp))
                                }

                                // Marks Table Header
                                item {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(NavyPrimary)
                                            .padding(vertical = 6.dp, horizontal = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("Subject", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.weight(1.5f))
                                        Text("Assessment", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.weight(1.2f))
                                        Text("Max", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.6f))
                                        Text("Pass", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.6f))
                                        Text("Obt.", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.7f))
                                        Text("Result", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.8f))
                                    }
                                }

                                // Marks Table Rows
                                items(res.subjects) { sub ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .border(width = 0.5.dp, color = CardBorderLight)
                                            .background(Color.White)
                                            .padding(vertical = 6.dp, horizontal = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(sub.subject, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black, modifier = Modifier.weight(1.5f))
                                        Text(sub.assessmentName.take(15), fontSize = 10.sp, color = Color.DarkGray, modifier = Modifier.weight(1.2f))
                                        Text("${sub.maxMarks.toInt()}", fontSize = 11.sp, color = Color.Black, textAlign = TextAlign.Center, modifier = Modifier.weight(0.6f))
                                        Text("${(sub.maxMarks * (sub.passingPercentage / 100.0)).toInt()}", fontSize = 11.sp, color = Color.Black, textAlign = TextAlign.Center, modifier = Modifier.weight(0.6f))
                                        Text(
                                            sub.obtainedMarks?.toInt()?.toString() ?: sub.status,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = if (sub.result == "Pass") PassEmerald else Color.Red,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.weight(0.7f)
                                        )
                                        Text(
                                            sub.result,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (sub.result == "Pass") PassEmerald else Color.Red,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.weight(0.8f)
                                        )
                                    }
                                }

                                // Marksheet Summary Row & Signatures
                                item {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(SurfaceVariantLight)
                                            .padding(10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text("Grand Total: ${res.totalObtainedMarks.toInt()} / ${res.totalMaxMarks.toInt()}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Black)
                                            Text("Percentage: ${String.format(Locale.getDefault(), "%.1f", res.overallPercentage)}%", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = NavyPrimary)
                                        }
                                        Column(horizontalAlignment = Alignment.End) {
                                            Text("Division: ${res.division}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Black)
                                            Text("Grade: ${res.overallGrade}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = AmberGold)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(30.dp))

                                    // Signatures Block
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text("_____________________", fontSize = 11.sp, color = Color.Black)
                                            Text("Class Teacher", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                        }

                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text("_____________________", fontSize = 11.sp, color = Color.Black)
                                            Text("Incharge Examination", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                        }

                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text("_____________________", fontSize = 11.sp, color = Color.Black)
                                            Text("Principal", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                            Text("GHSS Larnoo", fontSize = 9.sp, color = Color.DarkGray)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Date of Issue: ${SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date())}",
                                        fontSize = 9.sp,
                                        color = Color.DarkGray
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // TAB 2: Classwise Subject Award Roll
            val asm = activeAssessment
            if (asm != null) {
                Column(modifier = Modifier.weight(1f)) {
                    // Subject switcher & PDF Export / Print buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box {
                            OutlinedButton(
                                onClick = { assessmentPickerExpanded = true },
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Subject: ${asm.subject} (${asm.className})")
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                            DropdownMenu(
                                expanded = assessmentPickerExpanded,
                                onDismissRequest = { assessmentPickerExpanded = false }
                            ) {
                                allAssessments.forEach { a ->
                                    DropdownMenuItem(
                                        text = { Text("${a.subject} - ${a.name} (Class ${a.className})") },
                                        onClick = {
                                            viewModel.selectAssessment(a)
                                            assessmentPickerExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Official Classwise Award PDF Generator Button
                            Button(
                                onClick = {
                                    val pdfFile = PdfReportGenerator.generateClasswiseAwardPdf(context, asm, marksRows)
                                    PdfReportGenerator.openOrSharePdf(context, pdfFile, "GHSS_Larnoo_Award_Roll_${asm.className}_${asm.subject}")
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                                modifier = Modifier.testTag("btn_pdf_classwise_award")
                            ) {
                                Icon(Icons.Default.PictureAsPdf, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Class Award PDF", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            // Share / Print Text
                            OutlinedButton(
                                onClick = {
                                    val awardText = viewModel.generateAwardRollContent(asm, marksRows)
                                    val sendIntent = Intent().apply {
                                        action = Intent.ACTION_SEND
                                        putExtra(Intent.EXTRA_TEXT, awardText)
                                        putExtra(Intent.EXTRA_TITLE, "GHSS Larnoo Award Roll - ${asm.subject}")
                                        type = "text/plain"
                                    }
                                    val shareIntent = Intent.createChooser(sendIntent, "Print / Share Award Roll")
                                    context.startActivity(shareIntent)
                                },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp)
                            ) {
                                Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Print", fontSize = 12.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Award Roll Printable Card with School Logo Watermark
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.5.dp, NavyPrimary)
                    ) {
                        Box(modifier = Modifier.fillMaxSize()) {
                            // Official School Watermark centered
                            Image(
                                painter = painterResource(id = R.drawable.ic_school_logo),
                                contentDescription = "School Logo Watermark",
                                alpha = 0.09f,
                                modifier = Modifier
                                    .size(280.dp)
                                    .align(Alignment.Center)
                            )

                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                contentPadding = PaddingValues(bottom = 20.dp)
                            ) {
                                item {
                                    Column(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.Center
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.ic_school_logo),
                                                contentDescription = "School Logo",
                                                modifier = Modifier
                                                    .size(46.dp)
                                                    .clip(CircleShape)
                                            )
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                Text(
                                                    text = "GOVT. HIGHER SECONDARY SCHOOL LARNOO",
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 14.sp,
                                                    color = NavyPrimary
                                                )
                                                Text(
                                                    text = "EXAMINATION WING - SUBJECT MARKS AWARD ROLL",
                                                    fontWeight = FontWeight.ExtraBold,
                                                    fontSize = 12.sp,
                                                    color = AmberGold
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Subject: ${asm.subject} | Class: ${asm.className} | Session: ${asm.academicSession}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color.Black
                                        )
                                        Text(
                                            text = "Assessment: ${asm.name} | Max Marks: ${asm.maxMarks.toInt()} | Pass Rule: ${asm.passingPercentage.toInt()}%",
                                            fontSize = 11.sp,
                                            color = Color.DarkGray
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    HorizontalDivider(color = Color.Black, thickness = 1.dp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                }

                                // Award Table Header
                                item {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(NavyPrimary)
                                            .padding(vertical = 6.dp, horizontal = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("S.No", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp, modifier = Modifier.weight(0.5f))
                                        Text("Student Name", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp, modifier = Modifier.weight(1.8f))
                                        Text("Student ID", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp, modifier = Modifier.weight(1.3f))
                                        Text("Roll", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.6f))
                                        Text("Marks", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.7f))
                                        Text("Result", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.weight(0.8f))
                                    }
                                }

                                // Rows
                                items(marksRows) { r ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .border(width = 0.5.dp, color = CardBorderLight)
                                            .background(Color.White)
                                            .padding(vertical = 6.dp, horizontal = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("${r.serialNumber}", fontSize = 10.sp, color = Color.Black, modifier = Modifier.weight(0.5f))
                                        Text(r.student.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black, modifier = Modifier.weight(1.8f))
                                        Text(r.student.studentId, fontSize = 10.sp, color = Color.Black, modifier = Modifier.weight(1.3f))
                                        Text(r.student.rollNumber, fontSize = 11.sp, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, color = Color.Black, modifier = Modifier.weight(0.6f))
                                        Text(
                                            r.obtainedMarks?.toInt()?.toString() ?: r.status,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color.Black,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.weight(0.7f)
                                        )
                                        Text(
                                            r.result,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (r.result == "Pass") PassEmerald else Color.Red,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.weight(0.8f)
                                        )
                                    }
                                }

                                // Teacher Signature Declaration
                                item {
                                    Spacer(modifier = Modifier.height(26.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column {
                                            Text("Certified that the awards have been entered correctly.", fontSize = 10.sp, color = Color.DarkGray)
                                            Spacer(modifier = Modifier.height(18.dp))
                                            Text("Signature of Subject Teacher: ____________________", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                        }
                                        Column(horizontalAlignment = Alignment.End) {
                                            Spacer(modifier = Modifier.height(28.dp))
                                            Text("Exam Incharge Seal: ____________________", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No assessment selected.")
                }
            }
        }
    }
}
