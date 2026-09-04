package com.rork.learndariandroid.ui.screens

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FormatListNumbered
import androidx.compose.material.icons.filled.Landscape
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.LearnUnit
import com.rork.learndariandroid.data.Lesson
import com.rork.learndariandroid.data.LessonState
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.theme.Brand

/**
 * Tab 1 — a winding, game-style lesson path: unit banners, zigzagging nodes and
 * a trophy review at the end of every unit. The Android twin of `LearnView`.
 */
@Composable
fun LearnScreen(
    units: List<LearnUnit>,
    stateFor: (Lesson) -> LessonState,
    streak: Int,
    xp: Int,
    wordsLearned: Int,
    completedCount: Int,
    totalCount: Int,
    onLesson: (Lesson) -> Unit,
    onUnitReview: (LearnUnit) -> Unit,
    onGuidebook: (LearnUnit) -> Unit,
    onLocked: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize().background(Color.White)) {
        StatsStrip(streak, xp, wordsLearned, completedCount, totalCount)

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 40.dp),
        ) {
            units.forEach { unit ->
                item(key = "banner-${unit.id}") {
                    UnitBanner(unit, stateFor) { onGuidebook(unit) }
                }
                item(key = "path-${unit.id}") {
                    UnitPath(
                        unit = unit,
                        stateFor = stateFor,
                        onLesson = onLesson,
                        onReview = { onUnitReview(unit) },
                        onLocked = onLocked,
                    )
                }
            }

            item(key = "horizon") {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(top = 28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(
                        Icons.Filled.Landscape,
                        contentDescription = null,
                        tint = Brand.MutedInk.copy(alpha = 0.5f),
                        modifier = Modifier.size(30.dp),
                    )
                    Text(
                        "More units on the way",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Brand.MutedInk,
                    )
                }
            }
        }
    }
}

// MARK: - Top stats

@Composable
private fun StatsStrip(
    streak: Int,
    xp: Int,
    wordsLearned: Int,
    completedCount: Int,
    totalCount: Int,
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            StatChip(Icons.Filled.LocalFireDepartment, "$streak", Brand.Red, Modifier.weight(1f))
            StatChip(Icons.Filled.Bolt, "$xp", Brand.Amber, Modifier.weight(1f))
            StatChip(Icons.AutoMirrored.Filled.MenuBook, "$wordsLearned", Brand.Green, Modifier.weight(1f))
            StatChip(Icons.Filled.Check, "$completedCount/$totalCount", Brand.Ink, Modifier.weight(1f))
        }
        androidx.compose.material3.HorizontalDivider(thickness = 1.dp, color = Brand.Hairline)
    }
}

@Composable
private fun StatChip(icon: ImageVector, value: String, tint: Color, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .background(Brand.Fill, CircleShape)
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(15.dp))
        Spacer(Modifier.width(6.dp))
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Brand.Ink)
    }
}

// MARK: - Unit banner

@Composable
private fun UnitBanner(
    unit: LearnUnit,
    stateFor: (Lesson) -> LessonState,
    onGuidebook: () -> Unit,
) {
    val isActive = unit.lessons.any { stateFor(it) == LessonState.Current }
    val isComplete = unit.lessons.all { stateFor(it) == LessonState.Completed }
    val isLit = isActive || isComplete
    val foreground = if (isLit) Color.White else Brand.SecondaryInk

    val background: Modifier = when {
        isActive -> Modifier.background(Brand.FeaturedGradient, RoundedCornerShape(Brand.FeaturedRadius))
        isComplete -> Modifier.background(Brand.Green, RoundedCornerShape(Brand.FeaturedRadius))
        else -> Modifier
            .background(Brand.Fill, RoundedCornerShape(Brand.FeaturedRadius))
            .border(1.dp, Brand.Hairline, RoundedCornerShape(Brand.FeaturedRadius))
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 10.dp)
            .then(background)
            .padding(horizontal = 18.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(
                "UNIT ${unit.index}",
                color = foreground.copy(alpha = 0.85f),
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.8.sp,
            )
            Text(unit.title, color = foreground, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }

        Box(
            Modifier
                .width(1.dp)
                .height(40.dp)
                .background(foreground.copy(alpha = 0.28f)),
        )

        IconButton(onClick = onGuidebook, modifier = Modifier.size(44.dp)) {
            Icon(
                Icons.Filled.FormatListNumbered,
                contentDescription = "Unit contents",
                tint = foreground,
            )
        }
    }
}

// MARK: - The winding path

/** Repeating zigzag so the path snakes down the screen like a board game. */
private val SWAY = listOf(0, -54, -84, -54, 0, 54, 84, 54)

private val LANDMARKS = listOf("🕌", "🫖", "🏔️", "🪁", "🧿", "🍇", "🐫", "📜")

@Composable
private fun UnitPath(
    unit: LearnUnit,
    stateFor: (Lesson) -> LessonState,
    onLesson: (Lesson) -> Unit,
    onReview: () -> Unit,
    onLocked: (String) -> Unit,
) {
    val isUnitComplete = unit.lessons.all { stateFor(it) == LessonState.Completed }

    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        unit.lessons.forEachIndexed { index, lesson ->
            val state = stateFor(lesson)
            val glyph = when {
                state == LessonState.Completed -> NodeGlyph.Check
                state == LessonState.Locked -> NodeGlyph.Lock
                index % 3 == 0 -> NodeGlyph.Book
                else -> NodeGlyph.Star
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(x = SWAY[index % SWAY.size].dp),
                contentAlignment = Alignment.Center,
            ) {
                PathNode(
                    glyph = glyph,
                    label = lesson.title,
                    state = state,
                    showStartBubble = state == LessonState.Current,
                ) {
                    if (state == LessonState.Locked) {
                        onLocked("Finish the lesson before this one first")
                    } else {
                        onLesson(lesson)
                    }
                }

                // A landmark off to the side of the path — pure decoration.
                if (index == 1) {
                    Text(
                        text = LANDMARKS[(unit.index - 1) % LANDMARKS.size],
                        fontSize = 30.sp,
                        modifier = Modifier
                            .align(if (unit.index % 2 == 0) Alignment.CenterEnd else Alignment.CenterStart)
                            .padding(horizontal = 22.dp)
                            .size(62.dp)
                            .background(Brand.Fill, CircleShape)
                            .padding(14.dp),
                    )
                }
            }
        }

        PathNode(
            glyph = NodeGlyph.Trophy,
            label = "${unit.title} review",
            state = if (isUnitComplete) LessonState.Current else LessonState.Locked,
            isTrophy = true,
            showStartBubble = false,
        ) {
            if (isUnitComplete) {
                onReview()
            } else {
                onLocked("Complete every lesson in this unit to unlock the trophy")
            }
        }
    }
}

// MARK: - A single node

private enum class NodeGlyph { Check, Lock, Star, Book, Trophy }

private fun NodeGlyph.icon(): ImageVector = when (this) {
    NodeGlyph.Check -> Icons.Filled.Check
    NodeGlyph.Lock -> Icons.Filled.Lock
    NodeGlyph.Star -> Icons.Filled.Star
    NodeGlyph.Book -> Icons.AutoMirrored.Filled.MenuBook
    NodeGlyph.Trophy -> Icons.Filled.EmojiEvents
}

/**
 * One node on the path. Sits on a darker base so it reads as a physical button,
 * and presses down into it when tapped.
 */
@Composable
private fun PathNode(
    glyph: NodeGlyph,
    label: String,
    state: LessonState,
    isTrophy: Boolean = false,
    showStartBubble: Boolean,
    onClick: () -> Unit,
) {
    val diameter: Dp = if (isTrophy) 82.dp else 74.dp
    val isLocked = state == LessonState.Locked

    val face: Color = when {
        isTrophy -> if (isLocked) Brand.Fill else Brand.Amber
        state == LessonState.Completed -> Brand.Green
        state == LessonState.Current -> Brand.Red
        else -> Brand.Fill
    }
    val base: Color = if (isLocked) Brand.Hairline else face.mixWithBlack(0.22f)

    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val pressOffset = if (isPressed) 5.dp else 0.dp

    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (showStartBubble) {
            val transition = rememberInfiniteTransition(label = "bubble")
            val lift by transition.animateFloat(
                initialValue = 2f,
                targetValue = -3f,
                animationSpec = infiniteRepeatable(tween(850), RepeatMode.Reverse),
                label = "lift",
            )
            Text(
                text = if (isTrophy) "REVIEW" else "START",
                color = Brand.Red,
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.8.sp,
                modifier = Modifier
                    .offset(y = lift.dp)
                    .background(Color.White, CircleShape)
                    .border(1.5.dp, Brand.Hairline, CircleShape)
                    .padding(horizontal = 16.dp, vertical = 9.dp),
            )
        }

        Box(
            modifier = Modifier.size(width = diameter, height = diameter + 7.dp),
            contentAlignment = Alignment.TopCenter,
        ) {
            // The shadow the node presses into.
            Box(
                Modifier
                    .offset(y = 7.dp)
                    .size(diameter)
                    .background(base, CircleShape),
            )

            // A ring that swells and fades out of the live node.
            if (state == LessonState.Current && !isTrophy) {
                val transition = rememberInfiniteTransition(label = "halo")
                val scale by transition.animateFloat(
                    initialValue = 1f,
                    targetValue = 1.4f,
                    animationSpec = infiniteRepeatable(tween(1500), RepeatMode.Restart),
                    label = "haloScale",
                )
                val fade by transition.animateFloat(
                    initialValue = 1f,
                    targetValue = 0f,
                    animationSpec = infiniteRepeatable(tween(1500), RepeatMode.Restart),
                    label = "haloFade",
                )
                Box(
                    Modifier
                        .size(diameter)
                        .scale(scale)
                        .alpha(fade)
                        .border(5.dp, Brand.Red.copy(alpha = 0.3f), CircleShape),
                )
            }

            Box(
                modifier = Modifier
                    .offset(y = pressOffset)
                    .size(diameter)
                    .background(face, CircleShape)
                    .border(
                        2.dp,
                        if (isLocked) Color.Transparent else Color.White.copy(alpha = 0.35f),
                        CircleShape,
                    )
                    .clickable(
                        interactionSource = interactionSource,
                        indication = null,
                        onClick = onClick,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = glyph.icon(),
                    contentDescription = label,
                    tint = if (isLocked) Brand.MutedInk else Color.White,
                    modifier = Modifier.size(if (isTrophy) 34.dp else 29.dp),
                )
            }
        }
    }
}

/** Darkens a colour toward black, the way the iOS node base does. */
private fun Color.mixWithBlack(fraction: Float): Color = Color(
    red = red * (1f - fraction),
    green = green * (1f - fraction),
    blue = blue * (1f - fraction),
    alpha = alpha,
)

/** The lesson list behind a unit's contents button. */
@Composable
fun UnitGuidebook(
    unit: LearnUnit,
    stateFor: (Lesson) -> LessonState,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        unit.lessons.forEach { lesson ->
            val state = stateFor(lesson)
            AppCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    Icon(
                        imageVector = when (state) {
                            LessonState.Completed -> Icons.Filled.Check
                            LessonState.Current -> Icons.Filled.Star
                            LessonState.Locked -> Icons.Filled.Lock
                        },
                        contentDescription = null,
                        tint = when (state) {
                            LessonState.Completed -> Brand.Green
                            LessonState.Current -> Brand.Red
                            LessonState.Locked -> Brand.MutedInk
                        },
                        modifier = Modifier.size(24.dp),
                    )
                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(lesson.title, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Brand.Ink)
                        Text(lesson.subtitle, fontSize = 14.sp, color = Brand.SecondaryInk)
                    }
                    Text(
                        "${lesson.words.size}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Brand.MutedInk,
                    )
                }
            }
        }
    }
}
