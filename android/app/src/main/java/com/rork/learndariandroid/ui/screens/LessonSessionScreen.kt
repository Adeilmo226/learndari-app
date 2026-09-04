package com.rork.learndariandroid.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.domain.ExerciseKind
import com.rork.learndariandroid.domain.SessionState
import com.rork.learndariandroid.ui.components.PrimaryButton
import com.rork.learndariandroid.ui.components.StatTile
import com.rork.learndariandroid.ui.components.TagPill
import com.rork.learndariandroid.ui.theme.Brand
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

/**
 * The practice half of a lesson: a mixed queue of exercises that keeps going
 * until every item has been answered correctly, then a summary.
 */
@Composable
fun LessonSessionScreen(
    state: SessionState,
    lessonSubtitle: String,
    streak: Int,
    onPlay: (String, String?) -> Unit,
    onAnswer: (Boolean) -> Unit,
    onMatchComplete: (Set<String>, Set<String>) -> Unit,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (state.isFinished) {
        LessonSummary(state, streak, onDone, modifier)
        return
    }

    var lastXp by remember { mutableStateOf(state.earnedXp) }
    var floatingXp by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(state.earnedXp) {
        val gained = state.earnedXp - lastXp
        lastXp = state.earnedXp
        if (gained > 0) {
            floatingXp = gained
            delay(700)
            floatingXp = null
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        SessionHeader(state, lessonSubtitle, floatingXp)

        val exercise = state.current
        if (exercise != null) {
            when (exercise.kind) {
                ExerciseKind.MatchPairs -> ExerciseMatchView(
                    words = exercise.pairs,
                    onPlay = onPlay,
                    onComplete = onMatchComplete,
                )

                ExerciseKind.MultipleChoice, ExerciseKind.Listening -> ExerciseChoiceView(
                    exercise = exercise,
                    onPlay = onPlay,
                    onAnswer = onAnswer,
                )
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

/**
 * The running XP total, with a short-lived "+10" popping above it.
 *
 * Lives in its own composable so [AnimatedVisibility] resolves against the Box
 * rather than the enclosing Row.
 */
@Composable
private fun XpBadge(total: Int, floating: Int?) {
    Box(contentAlignment = Alignment.CenterEnd) {
        Text(
            "+$total XP",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Brand.Red,
        )
        AnimatedVisibility(
            visible = floating != null,
            enter = fadeIn() + scaleIn(),
            exit = fadeOut() + scaleOut(),
        ) {
            Text(
                "+${floating ?: 0}",
                fontSize = 14.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Brand.Green,
                modifier = Modifier.offset(y = (-22).dp),
            )
        }
    }
}

@Composable
private fun SessionHeader(state: SessionState, lessonSubtitle: String, floatingXp: Int?) {
    val progress by animateFloatAsState(state.progressFraction, label = "sessionProgress")

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (state.current?.item?.isReview == true) {
                TagPill("Review")
            } else {
                Text(lessonSubtitle, fontSize = 14.sp, color = Brand.MutedInk)
            }

            Spacer(Modifier.weight(1f))

            XpBadge(total = state.earnedXp, floating = floatingXp)
        }

        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier.fillMaxWidth().height(8.dp),
            color = Brand.Red,
            trackColor = Brand.Hairline,
            strokeCap = androidx.compose.ui.graphics.StrokeCap.Round,
            gapSize = 0.dp,
            drawStopIndicator = {},
        )
    }
}

/** End-of-session recap: what was practised, how accurately, and what it earned. */
@Composable
private fun LessonSummary(
    state: SessionState,
    streak: Int,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val accuracyPercent = (state.let {
        if (it.answeredCount == 0) 0f else it.correctCount.toFloat() / it.answeredCount
    } * 100).roundToInt()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(horizontal = 20.dp, vertical = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(22.dp),
    ) {
        Spacer(Modifier.weight(1f))

        Icon(
            imageVector = if (state.isFlawless) Icons.Filled.EmojiEvents else Icons.Filled.Verified,
            contentDescription = null,
            tint = Brand.Red,
            modifier = Modifier.size(64.dp),
        )

        Text(
            if (state.isFlawless) "Flawless!" else "Lesson complete",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Brand.Ink,
        )

        Text(
            text = if (state.isFlawless) {
                "Every answer first time. Outstanding."
            } else {
                "You worked through every word — that's how it sticks."
            },
            fontSize = 16.sp,
            color = Brand.SecondaryInk,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            modifier = Modifier.padding(horizontal = 24.dp),
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            StatTile("${state.wordsPractisedCount}", "Words practised", Modifier.weight(1f))
            StatTile("$accuracyPercent%", "Accuracy", Modifier.weight(1f))
            StatTile("+${state.earnedXp}", "XP earned", Modifier.weight(1f))
        }

        Row(
            modifier = Modifier
                .background(Brand.Fill, CircleShape)
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(
                Icons.Filled.LocalFireDepartment,
                contentDescription = null,
                tint = Brand.Amber,
                modifier = Modifier.size(18.dp),
            )
            Text(
                "$streak day streak",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Brand.SecondaryInk,
            )
        }

        Spacer(Modifier.weight(1f))

        PrimaryButton("Continue", onDone)
    }
}
