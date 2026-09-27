package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Class
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.FamilyRestroom
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Numbers
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.database.InitialData
import com.example.ui.MainViewModel
import com.example.ui.NavigationDestination
import com.example.ui.theme.AmberGold
import com.example.ui.theme.NavyPrimary
import com.example.ui.theme.PassEmerald

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentRegistrationScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val activeSession by viewModel.selectedSession.collectAsState()

    var name by remember { mutableStateOf("") }
    var parentage by remember { mutableStateOf("") }
    var selectedClass by remember { mutableStateOf("10th") }
    var rollNumber by remember { mutableStateOf("") }
    var session by remember { mutableStateOf(activeSession) }
    var selectedStream by remember { mutableStateOf("General") }
    var phone by remember { mutableStateOf("") }
    var customId by remember { mutableStateOf("") }

    var sessionExpanded by remember { mutableStateOf(false) }

    // Auto-computed preview ID
    val previewId = remember(name, selectedClass, rollNumber, session, customId) {
        if (customId.isNotBlank()) {
            customId
        } else {
            val sessionPrefix = session.split("-").getOrNull(0)?.takeLast(2) ?: "25"
            val classNum = selectedClass.replace(Regex("[^0-9]"), "").padStart(2, '0')
            val rollPadded = if (rollNumber.isNotBlank()) rollNumber.padStart(2, '0') else "01"
            "GHSS-$sessionPrefix-$classNum$rollPadded"
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Form Title
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Student Registration",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Enroll new student into academic records",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            OutlinedButton(
                onClick = { viewModel.navigateTo(NavigationDestination.StudentList) },
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.List, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("View All", fontSize = 12.sp)
            }
        }

        // Student ID Card Preview Badge
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Badge,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Assigned Student ID",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                        Text(
                            text = previewId,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Surface(
                    color = AmberGold.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "Auto-Indexed",
                        color = AmberGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }

        // Student Registration Form Fields
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Name Field
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Student Full Name *") },
                    placeholder = { Text("e.g. Sahil Ahmad Wani") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_student_name"),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )

                // Parentage Field
                OutlinedTextField(
                    value = parentage,
                    onValueChange = { parentage = it },
                    label = { Text("Parentage (Father / Mother Name) *") },
                    placeholder = { Text("e.g. Mohammad Shafi Wani") },
                    leadingIcon = { Icon(Icons.Default.FamilyRestroom, contentDescription = null) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_student_parentage"),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )

                // Class Selection (Class 9-12 chips)
                Column {
                    Text(
                        text = "Class Selection (9th - 12th) *",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        InitialData.CLASSES.forEach { cls ->
                            FilterChip(
                                selected = selectedClass == cls,
                                onClick = {
                                    selectedClass = cls
                                    if (cls == "9th" || cls == "10th") {
                                        selectedStream = "General"
                                    }
                                },
                                label = { Text("Class $cls") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = NavyPrimary,
                                    selectedLabelColor = Color.White
                                ),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("chip_class_$cls")
                            )
                        }
                    }
                }

                // If Class 11 or 12, select Stream
                if (selectedClass == "11th" || selectedClass == "12th") {
                    Column {
                        Text(
                            text = "Stream / Discipline",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            listOf("Medical", "Non-Medical", "Arts", "Commerce").forEach { str ->
                                FilterChip(
                                    selected = selectedStream == str,
                                    onClick = { selectedStream = str },
                                    label = { Text(str, fontSize = 11.sp) },
                                    shape = RoundedCornerShape(8.dp)
                                )
                            }
                        }
                    }
                }

                // Roll Number Field
                OutlinedTextField(
                    value = rollNumber,
                    onValueChange = { rollNumber = it.filter { char -> char.isDigit() } },
                    label = { Text("Roll Number *") },
                    placeholder = { Text("e.g. 15") },
                    leadingIcon = { Icon(Icons.Default.Numbers, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_student_roll"),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )

                // Academic Session Dropdown
                ExposedDropdownMenuBox(
                    expanded = sessionExpanded,
                    onExpandedChange = { sessionExpanded = !sessionExpanded }
                ) {
                    OutlinedTextField(
                        value = session,
                        onValueChange = { session = it },
                        readOnly = true,
                        label = { Text("Academic Session *") },
                        leadingIcon = { Icon(Icons.Default.DateRange, contentDescription = null) },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sessionExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                            .testTag("dropdown_session"),
                        shape = RoundedCornerShape(10.dp)
                    )
                    ExposedDropdownMenu(
                        expanded = sessionExpanded,
                        onDismissRequest = { sessionExpanded = false }
                    ) {
                        InitialData.SESSIONS.forEach { sess ->
                            DropdownMenuItem(
                                text = { Text(sess) },
                                onClick = {
                                    session = sess
                                    sessionExpanded = false
                                }
                            )
                        }
                    }
                }

                // Phone Contact (Optional)
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Contact Number (Parent / Student)") },
                    placeholder = { Text("e.g. 9419012345") },
                    leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_student_phone"),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Submit Registration Button
                Button(
                    onClick = {
                        val success = viewModel.registerStudent(
                            name = name,
                            parentage = parentage,
                            className = selectedClass,
                            rollNumber = rollNumber,
                            academicSession = session,
                            stream = selectedStream,
                            phone = phone,
                            customId = customId.ifBlank { null }
                        )
                        if (success) {
                            name = ""
                            parentage = ""
                            rollNumber = ""
                            phone = ""
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("btn_register_student"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Register Student",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
