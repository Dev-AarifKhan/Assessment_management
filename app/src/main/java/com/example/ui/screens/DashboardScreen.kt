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
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Grade
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserRole
import com.example.ui.MainViewModel
import com.example.ui.NavigationDestination
import com.example.ui.theme.AmberGold
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
    val passingPercentage by viewModel.passingPercentage.collectAsState()
    val activeSession by viewModel.selectedSession.collectAsState()

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
                                "System Admin • School Assessment & Records"
                            else
                                "Subject Teacher • ${currentUser.assignedSubject} (Class ${currentUser.assignedClass})",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }

        // Key Metric Summary Cards
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
                    title = "Enrolled",
                    value = "${allStudents.size}",
                    subtitle = "Classes 9th-12th",
                    icon = Icons.Default.Groups,
                    color = NavyLight,
                    modifier = Modifier.weight(1f)
                )

                MetricCard(
                    title = "Assessments",
                    value = "${allAssessments.size}",
                    subtitle = "Theory & Practical",
                    icon = Icons.Default.Assignment,
                    color = AmberGold,
                    modifier = Modifier.weight(1f)
                )

                MetricCard(
                    title = "Pass Rule",
                    value = "${passingPercentage.toInt()}%",
                    subtitle = "Passing Minimum",
                    icon = Icons.Default.CheckCircle,
                    color = PassEmerald,
                    modifier = Modifier.weight(1f)
                )
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
                // Marks Entry Card (Prominent for teachers & admin)
                ActionCard(
                    title = "Marks Award Entry",
                    description = "Submit or update marks by subject with S.No, ID, Roll No, Max/Obtained Marks, and real-time pass/fail status.",
                    icon = Icons.Default.Edit,
                    badgeText = "Core Award Table",
                    badgeColor = PassEmerald,
                    onClick = { viewModel.navigateTo(NavigationDestination.MarksEntry) },
                    testTag = "nav_marks_entry"
                )

                // Assessment Management Card
                ActionCard(
                    title = "Assessment Setup & List",
                    description = "Manage Unit Tests, Mid-Term, Golden Tests, and Annual Exams. Preserves distinct assessment IDs without overwriting.",
                    icon = Icons.Default.Assignment,
                    badgeText = "${allAssessments.size} Active",
                    badgeColor = NavyLight,
                    onClick = { viewModel.navigateTo(NavigationDestination.AssessmentManagement) },
                    testTag = "nav_assessments"
                )

                // Student Registration & Directory Card
                ActionCard(
                    title = "Student Registration & Directory",
                    description = "Register students for Classes 9-12 with Parentage, Roll No, and Session history preservation.",
                    icon = Icons.Default.PersonAdd,
                    badgeText = if (currentUser.role == UserRole.ADMIN) "Admin Access" else "Directory",
                    badgeColor = AmberGold,
                    onClick = {
                        if (currentUser.role == UserRole.ADMIN) {
                            viewModel.navigateTo(NavigationDestination.StudentRegistration)
                        } else {
                            viewModel.navigateTo(NavigationDestination.StudentList)
                        }
                    },
                    testTag = "nav_students"
                )

                // Student Result & Searchable History
                ActionCard(
                    title = "Student Result & Transcript",
                    description = "Searchable student result history, subject breakdown, overall percentage, grade, and division calculation.",
                    icon = Icons.Default.Search,
                    badgeText = "Searchable",
                    badgeColor = NavyPrimary,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentResult) },
                    testTag = "nav_results"
                )

                // Reports & Printable Marksheets
                ActionCard(
                    title = "Reports & Printable Marksheets",
                    description = "Generate official GHSS Larnoo student marksheets and Subject Teacher Award Rolls for printing/export.",
                    icon = Icons.Default.Print,
                    badgeText = "Official Format",
                    badgeColor = PassEmerald,
                    onClick = { viewModel.navigateTo(NavigationDestination.Reports) },
                    testTag = "nav_reports"
                )

                // Class-wise Analytics
                ActionCard(
                    title = "Class-wise Results & Analytics",
                    description = "View class performance, pass percentages, toppers, class average, and grade distribution charts.",
                    icon = Icons.Default.Grade,
                    badgeText = "Analytics",
                    badgeColor = AmberGold,
                    onClick = { viewModel.navigateTo(NavigationDestination.ClassResults) },
                    testTag = "nav_class_analytics"
                )

                // Future Ready: ID Card Generator
                ActionCard(
                    title = "Student Identity Cards (Future Expansion)",
                    description = "Instant school ID card generation with crest, student credentials, and verification QR preview.",
                    icon = Icons.Default.Badge,
                    badgeText = "Extension",
                    badgeColor = Color(0xFF64748B),
                    onClick = { viewModel.navigateTo(NavigationDestination.IdCardGenerator) },
                    testTag = "nav_id_card"
                )
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
