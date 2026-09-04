package com.rork.learndariandroid.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Award
import com.rork.learndariandroid.data.ProgressStore
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.AudioButton
import com.rork.learndariandroid.ui.components.DariText
import com.rork.learndariandroid.ui.components.PrimaryButton
import com.rork.learndariandroid.ui.components.PromptLabel
import com.rork.learndariandroid.ui.components.StatTile
import com.rork.learndariandroid.ui.theme.Brand
import kotlinx.coroutines.delay

private data class QuizOption(val id: String, val text: String)

private data class QuizQuestion(
    val id: String,
    val dari: String,
    val phonetic: String,
    val audioKey: String?,
    val options: List<QuizOption>,
    val correctId: String,
)

/** Up to six Dari → English questions, each with three distractors. */
private fun buildQuestions(words: List<Word>): List<QuizQuestion> {
    if (words.size < 2) return emptyList()
    return words.shuffled().take(6).mapIndexed { offset, word ->
        val options = words
            .filter { it.id != word.id }
            .shuffled()
            .take(3)
            .map { QuizOption(it.id, it.english) } + QuizOption(word.id, word.english)

        QuizQuestion(
            id = "${word.id}-$offset",
            dari = word.dari,
            phonetic = word.phonetic,
            audioKey = word.audioKey,
            options = options.shuffled(),
            correctId = word.id,
        )
    }
}

/**
 * Four-option multiple choice. Every question shows the Dari word with its
 * phonetic spelling and asks for the English meaning — consistent across all sets.
 */
@Composable
fun QuizScreen(
    words: List<Word>,
    progress: ProgressStore,
    onPlay: (String, String?) -> Unit,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var round by remember { mutableIntStateOf(0) }
    val questions = remember(words, round) { buildQuestions(words) }

    var index by remember(round) { mutableIntStateOf(0) }
    var selectedId by remember(round) { mutableStateOf<String?>(null) }
    var score by remember(round) { mutableIntStateOf(0) }
    var isFinished by remember(round) { mutableStateOf(false) }
    var earnedXp by remember(round) { mutableIntStateOf(0) }
    var floatingXp by remember { mutableStateOf<Int?>(null) }

    if (questions.isEmpty()) {
        Box(modifier.fillMaxSize().background(Color.White), contentAlignment = Alignment.Center) {
            Text(
                "This set needs at least a few words before it can be quizzed.",
                color = Brand.SecondaryInk,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(32.dp),
            )
        }
        return
    }

    LaunchedEffect(selectedId) {
        val picked = selectedId ?: return@LaunchedEffect
        val question = questions[index]
        val isCorrect = picked == question.correctId

        if (isCorrect) {
            score += 1
            val gained = progress.award(Award.CorrectAnswer)
            earnedXp += gained
            floatingXp = gained
        }

        delay(850)
        floatingXp = null
        selectedId = null

        if (index < questions.lastIndex) {
            index += 1
        } else {
            if (score == questions.size) earnedXp += progress.award(Award.PerfectQuiz)
            isFinished = true
        }
    }

    if (isFinished) {
        QuizResults(
            score = score,
            total = questions.size,
            earnedXp = earnedXp,
            onDone = onDone,
            onRetry = { round += 1 },
            modifier = modifier,
        )
        return
    }

    val question = questions[index]

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(22.dp),
    ) {
        Column(
            modifier = Modifier.padding(top = 8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "Question ${index + 1} of ${questions.size}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Brand.SecondaryInk,
                    modifier = Modifier.weight(1f),
                )
                XpBadge(total = earnedXp, floating = floatingXp)
            }

            LinearProgressIndicator(
                progress = { (index + 1).toFloat() / questions.size },
                modifier = Modifier.fillMaxWidth().height(8.dp),
                color = Brand.Red,
                trackColor = Brand.Hairline,
                strokeCap = androidx.compose.ui.graphics.StrokeCap.Round,
                gapSize = 0.dp,
                drawStopIndicator = {},
            )
        }

        AppCard(modifier = Modifier.fillMaxWidth(), radius = Brand.FeaturedRadius) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                PromptLabel("WHAT DOES THIS MEAN?")
                DariText(
                    question.dari,
                    fontSize = 44.sp,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                )
                Text(
                    question.phonetic,
                    fontSize = 20.sp,
                    fontStyle = FontStyle.Italic,
                    color = Brand.SecondaryInk,
                    textAlign = TextAlign.Center,
                )
                AudioButton(question.dari, question.audioKey, onPlay, size = 52.dp)
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            question.options.forEach { option ->
                val revealed = selectedId != null
                val isCorrect = option.id == question.correctId
                val isSelected = selectedId == option.id

                val fill = when {
                    !revealed -> Color.White
                    isCorrect -> Brand.GreenSoft
                    isSelected -> Brand.RedSoft
                    else -> Color.White
                }
                val stroke = when {
                    !revealed -> Brand.Hairline
                    isCorrect -> Brand.Green.copy(alpha = 0.6f)
                    isSelected -> Brand.Red.copy(alpha = 0.6f)
                    else -> Brand.Hairline
                }

                Surface(
                    onClick = { if (selectedId == null) selectedId = option.id },
                    enabled = !revealed,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(Brand.CardRadius),
                    color = fill,
                    border = BorderStroke(1.5.dp, stroke),
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 18.dp, vertical = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            option.text,
                            fontSize = 19.sp,
                            color = Brand.Ink,
                            modifier = Modifier.weight(1f),
                        )
                        if (revealed && isCorrect) {
                            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Brand.Green)
                        } else if (revealed && isSelected) {
                            Icon(Icons.Filled.Cancel, contentDescription = null, tint = Brand.Red)
                        }
                    }
                }
            }
        }
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
private fun QuizResults(
    score: Int,
    total: Int,
    earnedXp: Int,
    onDone: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val percent = if (total == 0) 0 else (score.toFloat() / total * 100).toInt()

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
            imageVector = if (score == total) Icons.Filled.EmojiEvents else Icons.Filled.Verified,
            contentDescription = null,
            tint = Brand.Red,
            modifier = Modifier.size(64.dp),
        )

        Text(
            if (score == total) "Perfect!" else "Nice work",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Brand.Ink,
        )

        Text(
            "You scored $score out of $total",
            fontSize = 18.sp,
            color = Brand.SecondaryInk,
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            StatTile("$score", "Correct", Modifier.weight(1f))
            StatTile("$percent%", "Accuracy", Modifier.weight(1f))
            StatTile("+$earnedXp", "XP earned", Modifier.weight(1f))
        }

        Spacer(Modifier.weight(1f))

        PrimaryButton("Done", onDone)

        TextButton(onClick = onRetry) {
            Text("Try again", color = Brand.Red, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}
