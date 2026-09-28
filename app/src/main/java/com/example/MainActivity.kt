package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Grade
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Print
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainViewModel
import com.example.ui.NavigationDestination
import com.example.ui.components.SchoolHeader
import com.example.ui.screens.AssessmentManagementScreen
import com.example.ui.screens.ClassResultScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.IdCardGeneratorScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.MarksEntryScreen
import com.example.ui.screens.ReportsScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.StudentListScreen
import com.example.ui.screens.StudentRegistrationScreen
import com.example.ui.screens.StudentResultScreen
import com.example.ui.screens.UserManagementScreen
import com.example.ui.theme.MyApplicationTheme
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
    val isAuthenticated by viewModel.isAuthenticated.collectAsState()
    val authLoading by viewModel.authLoading.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()
    val currentScreen by viewModel.currentScreen.collectAsState()
    val activeSession by viewModel.selectedSession.collectAsState()
    val syncStatus by viewModel.syncStatus.collectAsState()
    val feedbackMessage by viewModel.userFeedbackMessage.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(feedbackMessage) {
        feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearFeedback()
        }
    }

    if (authLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(color = NavyPrimary)
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Verifying authentication session...",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = NavyPrimary
                )
            }
        }
        return
    }

    if (!isAuthenticated) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            snackbarHost = { SnackbarHost(snackbarHostState) }
        ) { innerPadding ->
            LoginScreen(
                viewModel = viewModel,
                modifier = Modifier.padding(innerPadding)
            )
        }
        return
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
                syncStatus = syncStatus,
                onSettingsClick = { viewModel.navigateTo(NavigationDestination.Settings) },
                onLogoutClick = { viewModel.logout() },
                onSyncClick = { viewModel.syncCloudData() }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.Dashboard,
                    onClick = { viewModel.navigateTo(NavigationDestination.Dashboard) },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Home", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_home")
                )

                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.StudentList || currentScreen == NavigationDestination.StudentRegistration,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentList) },
                    icon = { Icon(Icons.Default.People, contentDescription = "Students") },
                    label = { Text("Students", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_students")
                )

                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.AssessmentManagement,
                    onClick = { viewModel.navigateTo(NavigationDestination.AssessmentManagement) },
                    icon = { Icon(Icons.Default.Assignment, contentDescription = "Assessments") },
                    label = { Text("Exams", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_assessments")
                )

                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.MarksEntry,
                    onClick = { viewModel.navigateTo(NavigationDestination.MarksEntry) },
                    icon = { Icon(Icons.Default.EditNote, contentDescription = "Marks Award") },
                    label = { Text("Awards", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_awards")
                )

                NavigationBarItem(
                    selected = currentScreen == NavigationDestination.StudentResult || currentScreen == NavigationDestination.ClassResults,
                    onClick = { viewModel.navigateTo(NavigationDestination.StudentResult) },
                    icon = { Icon(Icons.Default.Grade, contentDescription = "Results") },
                    label = { Text("Results", fontSize = 10.sp) },
                    colors = navigationBarItemColors(),
                    modifier = Modifier.testTag("nav_tab_results")
                )

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
                NavigationDestination.UserManagement -> UserManagementScreen(viewModel = viewModel)
            }
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
