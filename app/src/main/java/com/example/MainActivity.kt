package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Grade
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserRole
import com.example.ui.MainViewModel
import com.example.ui.NavigationDestination
import com.example.ui.components.SchoolHeader
import com.example.ui.screens.AssessmentManagementScreen
import com.example.ui.screens.ClassResultScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.IdCardGeneratorScreen
import com.example.ui.screens.MarksEntryScreen
import com.example.ui.screens.ReportsScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.StudentListScreen
import com.example.ui.screens.StudentRegistrationScreen
import com.example.ui.screens.StudentResultScreen
import com.example.ui.theme.AmberGold
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NavyLight
import com.example.ui.theme.NavyPrimary

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainAppScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppScreen(viewModel: MainViewModel) {
    val currentUser by viewModel.currentUser.collectAsState()
    val currentScreen by viewModel.currentScreen.collectAsState()
    val activeSession by viewModel.selectedSession.collectAsState()
    val feedbackMessage by viewModel.userFeedbackMessage.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    var showRoleDialog by remember { mutableStateOf(false) }

    LaunchedEffect(feedbackMessage) {
        feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearFeedback()
        }
    }

    // BackHandler: return to Dashboard if inside any subscreen
    BackHandler(enabled = currentScreen != NavigationDestination.Dashboard) {
        viewModel.navigateTo(NavigationDestination.Dashboard)
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            SchoolHeader(
                currentUser = currentUser,
                activeSession = activeSession,
                onSwitchRoleClick = { showRoleDialog = true }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                // 1. Dashboard
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.Dashboard,
                    onClick = { viewModel.navigateTo(NavigationDestination.Dashboard) },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Home", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_home")
                )

                // 2. Students
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.StudentList || currentScreen == NavigationDestination.StudentRegistration,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentList) },
                    icon = { Icon(Icons.Default.People, contentDescription = "Students") },
                    label = { Text("Students", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_students")
                )

                // 3. Assessments
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.AssessmentManagement,
                    onClick = { viewModel.navigateTo(NavigationDestination.AssessmentManagement) },
                    icon = { Icon(Icons.Default.Assignment, contentDescription = "Assessments") },
                    label = { Text("Exams", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_assessments")
                )

                // 4. Marks Award Entry Table
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.MarksEntry,
                    onClick = { viewModel.navigateTo(NavigationDestination.MarksEntry) },
                    icon = { Icon(Icons.Default.EditNote, contentDescription = "Marks Award") },
                    label = { Text("Awards", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_awards")
                )

                // 5. Results & Transcripts
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.StudentResult || currentScreen == NavigationDestination.ClassResults,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentResult) },
                    icon = { Icon(Icons.Default.Grade, contentDescription = "Results") },
                    label = { Text("Results", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_results")
                )

                // 6. Reports & Printables
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.Reports,
                    onClick = { viewModel.navigateTo(NavigationDestination.Reports) },
                    icon = { Icon(Icons.Default.Print, contentDescription = "Reports") },
                    label = { Text("Reports", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_reports")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                NavigationDestination.Dashboard -> DashboardScreen(viewModel = viewModel)
                NavigationDestination.StudentRegistration -> StudentRegistrationScreen(viewModel = viewModel)
                NavigationDestination.StudentList -> StudentListScreen(viewModel = viewModel)
                NavigationDestination.AssessmentManagement -> AssessmentManagementScreen(viewModel = viewModel)
                NavigationDestination.MarksEntry -> MarksEntryScreen(viewModel = viewModel)
                NavigationDestination.StudentResult -> StudentResultScreen(viewModel = viewModel)
                NavigationDestination.ClassResults -> ClassResultScreen(viewModel = viewModel)
                NavigationDestination.Reports -> ReportsScreen(viewModel = viewModel)
                NavigationDestination.Settings -> SettingsScreen(viewModel = viewModel)
                NavigationDestination.IdCardGenerator -> IdCardGeneratorScreen(viewModel = viewModel)
            }
        }
    }

    // Role Switcher Dialog (Admin vs Teacher)
    if (showRoleDialog) {
        AlertDialog(
            onDismissRequest = { showRoleDialog = false },
            title = {
                Text(
                    text = "Select User Role",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = NavyPrimary
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Switch authorization role to test role-based capabilities.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    // Admin Role Option
                    RoleSelectionCard(
                        title = "School Administrator",
                        subtitle = "Full setup: student admissions, assessments, passing percentage, and transcripts.",
                        icon = Icons.Default.AdminPanelSettings,
                        iconTint = NavyPrimary,
                        isSelected = currentUser.role == UserRole.ADMIN,
                        onClick = {
                            viewModel.switchRole(UserRole.ADMIN)
                            showRoleDialog = false
                        }
                    )

                    // Teacher Role Option
                    RoleSelectionCard(
                        title = "Subject Teacher",
                        subtitle = "Award evaluation: submit marks by subject, student status, and award rolls.",
                        icon = Icons.Default.School,
                        iconTint = AmberGold,
                        isSelected = currentUser.role == UserRole.TEACHER,
                        onClick = {
                            viewModel.switchRole(UserRole.TEACHER)
                            showRoleDialog = false
                        }
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showRoleDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun RoleSelectionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) iconTint.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(iconTint.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(22.dp))
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text(text = subtitle, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            RadioButton(
                selected = isSelected,
                onClick = onClick
            )
        }
    }
}

@Composable
fun navigationBarItemColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = MaterialTheme.colorScheme.primary,
    selectedTextColor = MaterialTheme.colorScheme.primary,
    indicatorColor = MaterialTheme.colorScheme.secondaryContainer,
    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
)
