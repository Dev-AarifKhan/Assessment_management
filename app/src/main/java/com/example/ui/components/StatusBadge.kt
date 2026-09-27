package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AbsentPurple
import com.example.ui.theme.AbsentPurpleContainer
import com.example.ui.theme.FailCrimson
import com.example.ui.theme.FailCrimsonContainer
import com.example.ui.theme.PassEmerald
import com.example.ui.theme.PassEmeraldContainer

@Composable
fun StatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (status.uppercase()) {
        "PASS" -> PassEmeraldContainer to PassEmerald
        "FAIL", "RE-APPEAR" -> FailCrimsonContainer to FailCrimson
        "ABSENT" -> AbsentPurpleContainer to AbsentPurple
        "MEDICAL" -> Color(0xFFFEF3C7) to Color(0xFFB45309)
        "PRESENT" -> Color(0xFFE0F2FE) to Color(0xFF0369A1)
        else -> Color(0xFFF1F5F9) to Color(0xFF334155)
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .border(0.5.dp, textColor.copy(alpha = 0.35f), RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = status.uppercase(),
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
