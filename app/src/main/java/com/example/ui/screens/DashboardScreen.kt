package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Class
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Grade
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.ManageAccounts
import androidx.compose.material.icons.filled.PendingActions
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.database.InitialData
import com.example.data.model.UserRole
import com.example.ui.MainViewModel
import com.example.ui.NavigationDestination
import com.example.ui.theme.AmberGold
import com.example.ui.theme.FailRed
import com.example.ui.theme.NavyLight
import com.example.ui.theme.NavyPrimary
import com.example.ui.theme.PassEmerald

@Composable
fun DashboardScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val allStudents by viewModel.allStudents.collectAsState()
    val allAssessments by viewModel.allAssessments.collectAsState()
    val allMarkEntries by viewModel.allMarkEntries.collectAsState()
    val passingPercentage by viewModel.passingPercentage.collectAsState()
    val activeSession by viewModel.selectedSession.collectAsState()

    val sessionStudents = remember(allStudents, activeSession) {
        allStudents.filter { it.academicSession == activeSession }.ifEmpty { allStudents }
    }
    val sessionAssessments = remember(allAssessments, activeSession) {
        allAssessments.filter { it.academicSession == activeSession }.ifEmpty { allAssessments }
    }
    val sessionMarks = remember(allMarkEntries, activeSession) {
        allMarkEntries.filter { it.academicSession == activeSession }.ifEmpty { allMarkEntries }
    }

    val activeClassesCount = remember(sessionStudents) {
        sessionStudents.map { it.className }.distinct().size.coerceAtLeast(InitialData.CLASSES.size)
    }

    val appearedMarks = remember(sessionMarks) {
        sessionMarks.filter { it.status == "Present" && it.obtainedMarks != null }
    }
    val passedMarks = remember(appearedMarks) {
        appearedMarks.count { it.result == "Pass" }
    }
    val overallPassRate = remember(appearedMarks, passedMarks) {
        if (appearedMarks.isEmpty()) 0.0 else (passedMarks.toDouble() / appearedMarks.size.toDouble()) * 100.0
    }

    val expectedEntriesCount = remember(sessionStudents, sessionAssessments) {
        sessionAssessments.sumOf { asm ->
            sessionStudents.count { st -> st.className == asm.className }
        }
    }
    val pendingMarksCount = (expectedEntriesCount - sessionMarks.size).coerceAtLeast(0)

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {
        // Welcome Card
        item {
            ElevatedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("welcome_card"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(NavyPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (currentUser.role == UserRole.ADMIN) Icons.Default.Tune else Icons.Default.Edit,
                            contentDescription = null,
                            tint = AmberGold,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Welcome, ${currentUser.name}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = if (currentUser.role == UserRole.ADMIN)
                                "Administrator • ${currentUser.email}"
                            else
                                "Subject Teacher • ${currentUser.assignedSubject} (Class ${currentUser.assignedClass})",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }

        // Key Metric Summary Cards (Row 1 + Row 2)
        item {
            Text(
                text = "Academic Overview ($activeSession)",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Students",
                    value = "${sessionStudents.size}",
                    subtitle = "$activeClassesCount Classes",
                    icon = Icons.Default.Groups,
                    color = NavyLight,
                    modifier = Modifier.weight(1f)
                )

                MetricCard(
                    title = "Assessments",
                    value = "${sessionAssessments.size}",
                    subtitle = "Scheduled",
                    icon = Icons.Default.Assignment,
                    color = AmberGold,
                    modifier = Modifier.weight(1f)
                )

                MetricCard(
                    title = "Pass Rate",
                    value = "${String.format("%.0f", overallPassRate)}%",
                    subtitle = "Min ${passingPercentage.toInt()}%",
                    icon = Icons.Default.CheckCircle,
                    color = PassEmerald,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Marks Entries",
                    value = "${sessionMarks.size}",
                    subtitle = "Recorded Awards",
                    icon = Icons.Default.Grade,
                    color = NavyPrimary,
                    modifier = Modifier.weight(1f)
                )

                MetricCard(
                    title = "Pending Marks",
                    value = "$pendingMarksCount",
                    subtitle = if (pendingMarksCount == 0) "All Complete" else "Awaiting Entry",
                    icon = Icons.Default.PendingActions,
                    color = if (pendingMarksCount > 0) FailRed else PassEmerald,
                    modifier = Modifier.weight(1f)
                )

                MetricCard(
                    title = "Classes",
                    value = "$activeClassesCount",
                    subtitle = "9th to 12th",
                    icon = Icons.Default.Class,
                    color = AmberGold,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Important Alerts Banner (if pending marks or locked exams)
        if (pendingMarksCount > 0 || sessionAssessments.any { it.isLocked }) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = AmberGold.copy(alpha = 0.12f)),
                    border = BorderStroke(1.dp, AmberGold.copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.WarningAmber,
                            contentDescription = "Alert",
                            tint = AmberGold,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Academic Portal Alerts",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = NavyPrimary
                            )
                            if (pendingMarksCount > 0) {
                                Text(
                                    text = "• $pendingMarksCount student mark entries are pending across active assessments.",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            val lockedCount = sessionAssessments.count { it.isLocked }
                            if (lockedCount > 0) {
                                Text(
                                    text = "• $lockedCount finalized assessment(s) are locked against accidental edits.",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        // Primary Module Access Grid
        item {
            Text(
                text = "Assessment & Evaluation Modules",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionCard(
                    title = "Marks Award Entry",
                    description = "Submit or update marks by subject with S.No, ID, Roll No, Max/Obtained Marks, and real-time pass/fail status.",
                    icon = Icons.Default.Edit,
                    badgeText = "Core Award Table",
                    badgeColor = PassEmerald,
                    onClick = { viewModel.navigateTo(NavigationDestination.MarksEntry) },
                    testTag = "nav_marks_entry"
                )

                ActionCard(
                    title = "Assessment Setup & List",
                    description = "Manage Unit Tests, Mid-Term, Golden Tests, and Annual Exams. Preserves distinct assessment IDs without overwriting.",
                    icon = Icons.Default.Assignment,
                    badgeText = "${allAssessments.size} Active",
                    badgeColor = NavyLight,
                    onClick = { viewModel.navigateTo(NavigationDestination.AssessmentManagement) },
                    testTag = "nav_assessments"
                )

                ActionCard(
                    title = "Student Registration & Directory",
                    description = "Register, edit, bulk-import, and filter students for Classes 9-12 with Parentage, Roll No, and Session history.",
                    icon = Icons.Default.PersonAdd,
                    badgeText = if (currentUser.role == UserRole.ADMIN) "Admin Access" else "Directory",
                    badgeColor = AmberGold,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentList) },
                    testTag = "nav_students"
                )

                ActionCard(
                    title = "Student Result & Transcript",
                    description = "Searchable student result history, subject breakdown, overall percentage, grade, and division calculation.",
                    icon = Icons.Default.Search,
                    badgeText = "Searchable",
                    badgeColor = NavyPrimary,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentResult) },
                    testTag = "nav_results"
                )

                ActionCard(
                    title = "Reports & Printable Marksheets",
                    description = "Generate official GHSS Larnoo student marksheets and Subject Teacher Award Rolls for printing/export.",
                    icon = Icons.Default.Print,
                    badgeText = "Official Format",
                    badgeColor = PassEmerald,
                    onClick = { viewModel.navigateTo(NavigationDestination.Reports) },
                    testTag = "nav_reports"
                )

                ActionCard(
                    title = "Class-wise Results & Analytics",
                    description = "View class performance, pass percentages, toppers, class average, and grade distribution charts.",
                    icon = Icons.Default.Grade,
                    badgeText = "Analytics",
                    badgeColor = AmberGold,
                    onClick = { viewModel.navigateTo(NavigationDestination.ClassResults) },
                    testTag = "nav_class_analytics"
                )

                ActionCard(
                    title = "Student Identity Cards",
                    description = "Instant school ID card generation with crest, student credentials, batch printing, and verification QR preview.",
                    icon = Icons.Default.Badge,
                    badgeText = "ID Cards",
                    badgeColor = Color(0xFF64748B),
                    onClick = { viewModel.navigateTo(NavigationDestination.IdCardGenerator) },
                    testTag = "nav_id_card"
                )

                if (currentUser.role == UserRole.ADMIN) {
                    ActionCard(
                        title = "User & Teacher Management",
                        description = "Register teacher accounts, assign classes/subjects, enable or disable accounts, and manage roles.",
                        icon = Icons.Default.ManageAccounts,
                        badgeText = "Admin Only",
                        badgeColor = NavyPrimary,
                        onClick = { viewModel.navigateTo(NavigationDestination.UserManagement) },
                        testTag = "nav_user_management"
                    )

                    ActionCard(
                        title = "School Settings & Configuration",
                        description = "Configure school name, UDISE code, address, affiliation, passing percentage, and active session.",
                        icon = Icons.Default.Settings,
                        badgeText = "Config",
                        badgeColor = PassEmerald,
                        onClick = { viewModel.navigateTo(NavigationDestination.Settings) },
                        testTag = "nav_settings"
                    )
                }
            }
        }

        // Class Performance Overview
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Class-wise Enrollment & Pass Performance",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = NavyPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    InitialData.CLASSES.forEach { cls ->
                        val clsStudents = sessionStudents.count { it.className == cls }
                        val clsMarks = sessionMarks.filter { it.className == cls && it.status == "Present" && it.obtainedMarks != null }
                        val clsPassPct = if (clsMarks.isEmpty()) 0f else (clsMarks.count { it.result == "Pass" }.toFloat() / clsMarks.size.toFloat())

                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Class $cls ($clsStudents students)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "${(clsPassPct * 100).toInt()}% Pass",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PassEmerald
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            LinearProgressIndicator(
                                progress = { clsPassPct },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = PassEmerald,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // Recent Assessments & Recent Students
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Recent Assessments",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = NavyPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    sessionAssessments.take(3).forEachIndexed { idx, asm ->
                        if (idx > 0) HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "${asm.subject} - ${asm.name}", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                                Text(text = "Class ${asm.className} • ${asm.assessmentDate}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text(text = "Max ${asm.maxMarks.toInt()}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NavyLight)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "Recent Students",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = NavyPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    sessionStudents.take(3).forEachIndexed { idx, st ->
                        if (idx > 0) HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = st.name, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                                Text(text = "ID: ${st.studentId} • Roll ${st.rollNumber}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text(text = "Class ${st.className}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AmberGold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold,
                color = color
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 10.sp
            )
        }
    }
}

@Composable
fun ActionCard(
    title: String,
    description: String,
    icon: ImageVector,
    badgeText: String,
    badgeColor: Color,
    onClick: () -> Unit,
    testTag: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag(testTag)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(badgeColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = badgeColor,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Surface(
                        color = badgeColor.copy(alpha = 0.12f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = badgeText,
                            color = badgeColor,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 16.sp
                )
            }
        }
    }
}
