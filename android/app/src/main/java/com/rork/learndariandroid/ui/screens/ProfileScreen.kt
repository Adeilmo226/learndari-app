package com.rork.learndariandroid.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.ProgressState
import com.rork.learndariandroid.data.ProgressStore
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.StatTile
import com.rork.learndariandroid.ui.theme.Brand

/** Tab 5 — learner stats and settings. */
@Composable
fun ProfileScreen(
    state: ProgressState,
    progress: ProgressStore,
    nextLessonTitle: String?,
    onOpenSupport: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var isEditingName by remember { mutableStateOf(false) }
    var draftName by remember { mutableStateOf(state.learnerName) }
    var isDeleteConfirmVisible by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        // Header
        AppCard(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Box(
                    modifier = Modifier.size(64.dp).background(Brand.Red, CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        state.learnerName.take(1).uppercase(),
                        color = Color.White,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }

                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        state.learnerName,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Brand.Ink,
                    )
                    Text("Free plan", fontSize = 14.sp, color = Brand.SecondaryInk)
                }

                IconButton(
                    onClick = {
                        draftName = state.learnerName
                        isEditingName = true
                    },
                    modifier = Modifier.size(40.dp).background(Brand.RedSoft, CircleShape),
                ) {
                    Icon(
                        Icons.Filled.Edit,
                        contentDescription = "Edit name",
                        tint = Brand.Red,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }
        }

        // Stats
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            IconStatTile("${state.streak}", "Day streak", Icons.Filled.LocalFireDepartment, Brand.Red, Modifier.weight(1f))
            IconStatTile("${progress.wordsLearned}", "Words learned", Icons.AutoMirrored.Filled.MenuBook, Brand.Green, Modifier.weight(1f))
            IconStatTile("${state.xp}", "Total XP", Icons.Filled.Bolt, Brand.Amber, Modifier.weight(1f))
        }

        // Level
        AppCard(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Level ${progress.level}",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Brand.Ink,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        "${progress.xpIntoLevel} / ${ProgressStore.XP_PER_LEVEL} XP",
                        fontSize = 14.sp,
                        color = Brand.SecondaryInk,
                    )
                }
                LinearProgressIndicator(
                    progress = { progress.levelProgress },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = Brand.Amber,
                    trackColor = Brand.Hairline,
                    strokeCap = androidx.compose.ui.graphics.StrokeCap.Round,
                    gapSize = 0.dp,
                    drawStopIndicator = {},
                )
                Text(
                    "${progress.xpToNextLevel} XP to level ${progress.level + 1}",
                    fontSize = 13.sp,
                    color = Brand.MutedInk,
                )
            }
        }

        // Course progress
        AppCard(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Course progress",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Brand.Ink,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        "${progress.completedLessonCount} / ${progress.totalLessonCount} lessons",
                        fontSize = 14.sp,
                        color = Brand.SecondaryInk,
                    )
                }
                LinearProgressIndicator(
                    progress = { progress.overallProgress },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = Brand.Red,
                    trackColor = Brand.Hairline,
                    strokeCap = androidx.compose.ui.graphics.StrokeCap.Round,
                    gapSize = 0.dp,
                    drawStopIndicator = {},
                )
                Text(
                    text = nextLessonTitle?.let { "Next up: $it" }
                        ?: "You've finished every lesson available. More are on the way.",
                    fontSize = 13.sp,
                    color = Brand.MutedInk,
                )
            }
        }

        // Settings
        AppCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                ToggleRow(
                    label = "Daily reminders",
                    icon = Icons.Filled.Notifications,
                    checked = state.notificationsEnabled,
                    onCheckedChange = progress::setNotificationsEnabled,
                )
                RowRule()
                ToggleRow(
                    label = "Pronunciation audio",
                    icon = Icons.AutoMirrored.Filled.VolumeUp,
                    checked = state.soundEnabled,
                    onCheckedChange = progress::setSoundEnabled,
                )
                RowRule()
                ActionRow(
                    label = "Help & support",
                    icon = Icons.Filled.HelpOutline,
                    tint = Brand.SecondaryInk,
                    onClick = onOpenSupport,
                )
            }
        }

        // Account
        AppCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                ActionRow(
                    label = "Reset progress",
                    icon = Icons.Filled.Refresh,
                    tint = Brand.SecondaryInk,
                    onClick = { progress.resetProgress() },
                )
                RowRule()
                ActionRow(
                    label = "Delete account",
                    icon = Icons.Filled.Delete,
                    tint = Brand.Red,
                    labelColor = Brand.Red,
                    badgeBackground = Brand.RedSoft,
                    onClick = { isDeleteConfirmVisible = true },
                )
            }
        }
    }

    if (isEditingName) {
        AlertDialog(
            onDismissRequest = { isEditingName = false },
            title = { Text("Your name") },
            text = {
                OutlinedTextField(
                    value = draftName,
                    onValueChange = { draftName = it },
                    singleLine = true,
                    label = { Text("Name") },
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    progress.setLearnerName(draftName)
                    isEditingName = false
                }) { Text("Save", color = Brand.Red) }
            },
            dismissButton = {
                TextButton(onClick = { isEditingName = false }) {
                    Text("Cancel", color = Brand.SecondaryInk)
                }
            },
            containerColor = Color.White,
        )
    }

    if (isDeleteConfirmVisible) {
        AlertDialog(
            onDismissRequest = { isDeleteConfirmVisible = false },
            title = { Text("Delete account?") },
            text = {
                Text(
                    "This permanently removes your profile, streak and lesson progress. This cannot be undone.",
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    progress.deleteAccount()
                    isDeleteConfirmVisible = false
                }) { Text("Delete", color = Brand.Red) }
            },
            dismissButton = {
                TextButton(onClick = { isDeleteConfirmVisible = false }) {
                    Text("Cancel", color = Brand.SecondaryInk)
                }
            },
            containerColor = Color.White,
        )
    }
}

@Composable
private fun IconStatTile(
    value: String,
    label: String,
    icon: ImageVector,
    tint: Color,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(22.dp))
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Brand.Ink)
            Text(
                label,
                fontSize = 12.sp,
                color = Brand.SecondaryInk,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            )
        }
    }
}

@Composable
private fun SettingBadge(icon: ImageVector, tint: Color, background: Color) {
    Box(
        modifier = Modifier.size(30.dp).background(background, RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(16.dp))
    }
}

@Composable
private fun ToggleRow(
    label: String,
    icon: ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        SettingBadge(icon, Brand.SecondaryInk, Brand.Fill)
        Text(label, fontSize = 16.sp, color = Brand.Ink, modifier = Modifier.weight(1f))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = Brand.Red,
                uncheckedTrackColor = Brand.Hairline,
            ),
        )
    }
}

@Composable
private fun ActionRow(
    label: String,
    icon: ImageVector,
    tint: Color,
    labelColor: Color = Brand.Ink,
    badgeBackground: Color = Brand.Fill,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        SettingBadge(icon, tint, badgeBackground)
        Text(label, fontSize = 16.sp, color = labelColor, modifier = Modifier.weight(1f))
    }
}

@Composable
private fun RowRule() {
    androidx.compose.material3.HorizontalDivider(
        modifier = Modifier.padding(start = 58.dp),
        thickness = 1.dp,
        color = Brand.Hairline,
    )
}

/** Kept for parity with the iOS summary tiles. */
@Suppress("unused")
@Composable
private fun PlainStat(value: String, label: String) {
    StatTile(value, label)
}
