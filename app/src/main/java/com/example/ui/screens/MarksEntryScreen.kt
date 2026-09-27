package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Grade
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.entity.AssessmentEntity
import com.example.data.model.StudentAwardRow
import com.example.ui.MainViewModel
import com.example.ui.NavigationDestination
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AmberGold
import com.example.ui.theme.CardBorderLight
import com.example.ui.theme.NavyLight
import com.example.ui.theme.NavyPrimary
import com.example.ui.theme.PassEmerald
import com.example.ui.theme.SurfaceVariantLight

@Composable
fun MarksEntryScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val allAssessments by viewModel.allAssessments.collectAsState()
    val activeAssessment by viewModel.activeAssessment.collectAsState()
    val marksRows by viewModel.marksRows.collectAsState()
    val passingPercentage by viewModel.passingPercentage.collectAsState()

    var assessmentSelectorExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Assessment & Subject Selector Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "MARKS AWARD ENTRY TABLE",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = AmberGold
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = activeAssessment?.let { "${it.subject} • Class ${it.className}" } ?: "Select Assessment",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = NavyPrimary
                        )
                    }

                    // Dropdown button to change assessment/subject
                    Box {
                        OutlinedButton(
                            onClick = { assessmentSelectorExpanded = true },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("btn_select_assessment")
                        ) {
                            Icon(Icons.Default.School, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Switch Subject", fontSize = 12.sp)
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                        }

                        DropdownMenu(
                            expanded = assessmentSelectorExpanded,
                            onDismissRequest = { assessmentSelectorExpanded = false }
                        ) {
                            allAssessments.forEach { asm ->
                                DropdownMenuItem(
                                    text = {
                                        Text("${asm.subject} - ${asm.name} (${asm.className}, ${asm.academicSession})")
                                    },
                                    onClick = {
                                        viewModel.selectAssessment(asm)
                                        assessmentSelectorExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Detail metadata strip
                activeAssessment?.let { asm ->
                    val minPassMarks = (asm.maxMarks * (asm.passingPercentage / 100.0))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Max Marks: ${asm.maxMarks.toInt()}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Passing Rule: ${asm.passingPercentage.toInt()}% (Min: ${String.format("%.1f", minPassMarks)})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = PassEmerald
                        )
                        Text(
                            text = "Date: ${asm.assessmentDate}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Table Header Summary & Save Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Student Award Roll (${marksRows.size} Candidates)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { viewModel.navigateTo(NavigationDestination.Reports) },
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Print Sheet", fontSize = 11.sp)
                }

                Button(
                    onClick = { viewModel.saveAllMarks() },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PassEmerald),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("btn_save_marks")
                ) {
                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Save Award", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // The Full Horizontal Scrolling Table as specified:
        // S.No, Student Name, ID, Roll No, Max Marks, Obtained Marks, Status, Result
        val horizontalScrollState = rememberScrollState()

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .horizontalScroll(horizontalScrollState)
            ) {
                // Table Column Titles Header
                Row(
                    modifier = Modifier
                        .background(NavyPrimary)
                        .padding(vertical = 10.dp, horizontal = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TableCell(text = "S.No", width = 48.dp, isHeader = true, alignment = Alignment.Center)
                    TableCell(text = "Student Name", width = 160.dp, isHeader = true)
                    TableCell(text = "Student ID", width = 110.dp, isHeader = true)
                    TableCell(text = "Roll No", width = 64.dp, isHeader = true, alignment = Alignment.Center)
                    TableCell(text = "Max", width = 56.dp, isHeader = true, alignment = Alignment.Center)
                    TableCell(text = "Obtained Marks", width = 120.dp, isHeader = true, alignment = Alignment.Center)
                    TableCell(text = "Status", width = 100.dp, isHeader = true, alignment = Alignment.Center)
                    TableCell(text = "Result", width = 84.dp, isHeader = true, alignment = Alignment.Center)
                }

                // Table Rows
                LazyColumn(
                    modifier = Modifier.weight(1f)
                ) {
                    items(marksRows, key = { it.student.studentId }) { row ->
                        MarksTableRow(
                            row = row,
                            onMarksChanged = { newText ->
                                viewModel.updateMarksRow(
                                    studentId = row.student.studentId,
                                    newMarksText = newText,
                                    newStatus = row.status,
                                    remarks = row.remarks
                                )
                            },
                            onStatusChanged = { newStatus ->
                                viewModel.updateMarksRow(
                                    studentId = row.student.studentId,
                                    newMarksText = row.obtainedMarksText,
                                    newStatus = newStatus,
                                    remarks = row.remarks
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MarksTableRow(
    row: StudentAwardRow,
    onMarksChanged: (String) -> Unit,
    onStatusChanged: (String) -> Unit
) {
    var statusMenuOpen by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .border(width = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
            .padding(vertical = 6.dp, horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // S.No
        TableCell(
            text = "${row.serialNumber}",
            width = 48.dp,
            alignment = Alignment.Center
        )

        // Student Name
        Column(modifier = Modifier.width(160.dp)) {
            Text(
                text = row.student.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "S/o: ${row.student.parentage.take(18)}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 10.sp
            )
        }

        // Student ID
        TableCell(
            text = row.student.studentId,
            width = 110.dp
        )

        // Roll No
        TableCell(
            text = row.student.rollNumber,
            width = 64.dp,
            alignment = Alignment.Center,
            fontWeight = FontWeight.Bold
        )

        // Max Marks
        TableCell(
            text = "${row.maxMarks.toInt()}",
            width = 56.dp,
            alignment = Alignment.Center,
            fontWeight = FontWeight.SemiBold
        )

        // Obtained Marks Editable Input
        Box(
            modifier = Modifier.width(120.dp),
            contentAlignment = Alignment.Center
        ) {
            OutlinedTextField(
                value = row.obtainedMarksText,
                onValueChange = { input ->
                    if (input.isEmpty() || input.matches(Regex("^\\d*\\.?\\d*$"))) {
                        onMarksChanged(input)
                    }
                },
                enabled = row.status == "Present",
                placeholder = { Text("-", textAlign = TextAlign.Center) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier
                    .width(90.dp)
                    .height(48.dp)
                    .testTag("input_marks_${row.student.studentId}"),
                shape = RoundedCornerShape(8.dp),
                textStyle = MaterialTheme.typography.bodyMedium.copy(
                    textAlign = TextAlign.Center,
                    fontWeight = FontWeight.Bold
                )
            )
        }

        // Status Dropdown
        Box(
            modifier = Modifier.width(100.dp),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                onClick = { statusMenuOpen = true },
                shape = RoundedCornerShape(6.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = row.status,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Icon(
                        imageVector = Icons.Default.ArrowDropDown,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            DropdownMenu(
                expanded = statusMenuOpen,
                onDismissRequest = { statusMenuOpen = false }
            ) {
                listOf("Present", "Absent", "Medical").forEach { st ->
                    DropdownMenuItem(
                        text = { Text(st) },
                        onClick = {
                            onStatusChanged(st)
                            statusMenuOpen = false
                        }
                    )
                }
            }
        }

        // Result Pill Badge (Pass / Fail / Pending / Absent)
        Box(
            modifier = Modifier.width(84.dp),
            contentAlignment = Alignment.Center
        ) {
            StatusBadge(status = row.result)
        }
    }
}

@Composable
fun TableCell(
    text: String,
    width: androidx.compose.ui.unit.Dp,
    isHeader: Boolean = false,
    alignment: Alignment = Alignment.CenterStart,
    fontWeight: FontWeight = FontWeight.Normal
) {
    Box(
        modifier = Modifier.width(width),
        contentAlignment = alignment
    ) {
        Text(
            text = text,
            color = if (isHeader) Color.White else MaterialTheme.colorScheme.onSurface,
            fontWeight = if (isHeader) FontWeight.Bold else fontWeight,
            fontSize = if (isHeader) 11.sp else 12.sp,
            textAlign = if (alignment == Alignment.Center) TextAlign.Center else TextAlign.Start
        )
    }
}
