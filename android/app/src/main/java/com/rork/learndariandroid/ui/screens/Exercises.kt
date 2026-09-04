package com.rork.learndariandroid.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.domain.Exercise
import com.rork.learndariandroid.domain.ExerciseKind
import com.rork.learndariandroid.domain.PromptDirection
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.AudioButton
import com.rork.learndariandroid.ui.components.DariText
import com.rork.learndariandroid.ui.components.PromptLabel
import com.rork.learndariandroid.ui.theme.Brand
import kotlinx.coroutines.delay

/**
 * Multiple choice and listening share one layout: a prompt card on top, four
 * tappable options below, immediate colour feedback, then auto-advance.
 */
@Composable
fun ExerciseChoiceView(
    exercise: Exercise,
    onPlay: (String, String?) -> Unit,
    onAnswer: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    var selectedId by remember(exercise.id) { mutableStateOf<String?>(null) }
    val isListening = exercise.kind == ExerciseKind.Listening
    val revealed = selectedId != null

    // Listening plays itself once on arrival; the button replays it on demand.
    LaunchedEffect(exercise.id) {
        if (isListening) onPlay(exercise.word.dari, exercise.word.audioKey)
    }

    LaunchedEffect(selectedId) {
        val picked = selectedId ?: return@LaunchedEffect
        val isCorrect = picked == exercise.correctId
        // A wrong answer lingers so the correct option can be read properly.
        delay(if (isCorrect) 850L else 1500L)
        onAnswer(isCorrect)
    }

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        AppCard(modifier = Modifier.fillMaxWidth(), radius = Brand.FeaturedRadius) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                PromptLabel(
                    when {
                        isListening -> "WHAT DID YOU HEAR?"
                        exercise.direction == PromptDirection.DariToEnglish -> "WHAT DOES THIS MEAN?"
                        else -> "HOW DO YOU SAY THIS?"
                    },
                )

                when {
                    isListening -> {
                        Box(
                            modifier = Modifier
                                .size(96.dp)
                                .background(Brand.RedSoft, CircleShape)
                                .androidClickable { onPlay(exercise.word.dari, exercise.word.audioKey) },
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                Icons.AutoMirrored.Filled.VolumeUp,
                                contentDescription = "Play the audio again",
                                tint = Brand.Red,
                                modifier = Modifier.size(40.dp),
                            )
                        }
                        Text(
                            "Tap to hear it again",
                            fontSize = 13.sp,
                            color = Brand.MutedInk,
                        )
                    }

                    exercise.direction == PromptDirection.DariToEnglish -> {
                        DariText(
                            exercise.word.dari,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.Center,
                        )
                        Text(
                            exercise.word.phonetic,
                            fontSize = 20.sp,
                            fontStyle = FontStyle.Italic,
                            color = Brand.SecondaryInk,
                            textAlign = TextAlign.Center,
                        )
                        AudioButton(
                            exercise.word.dari,
                            exercise.word.audioKey,
                            onPlay,
                            size = 52.dp,
                        )
                    }

                    else -> {
                        Text(
                            exercise.word.english,
                            fontSize = 34.sp,
                            fontWeight = FontWeight.Bold,
                            color = Brand.Ink,
                            textAlign = TextAlign.Center,
                        )
                    }
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            exercise.options.forEach { option ->
                OptionButton(
                    option = option,
                    showsDari = exercise.direction == PromptDirection.EnglishToDari,
                    isCorrect = option.id == exercise.correctId,
                    isSelected = selectedId == option.id,
                    revealed = revealed,
                ) {
                    if (selectedId == null) selectedId = option.id
                }
            }
        }
    }
}

@Composable
private fun OptionButton(
    option: Word,
    showsDari: Boolean,
    isCorrect: Boolean,
    isSelected: Boolean,
    revealed: Boolean,
    onClick: () -> Unit,
) {
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
        onClick = onClick,
        enabled = !revealed,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Brand.CardRadius),
        color = fill,
        border = androidx.compose.foundation.BorderStroke(1.5.dp, stroke),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (showsDari) {
                DariText(option.dari, fontSize = 20.sp, modifier = Modifier.weight(1f))
            } else {
                Text(
                    option.english,
                    fontSize = 19.sp,
                    color = Brand.Ink,
                    modifier = Modifier.weight(1f),
                )
            }

            if (revealed && isCorrect) {
                Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Brand.Green)
            } else if (revealed && isSelected) {
                Icon(Icons.Filled.Cancel, contentDescription = null, tint = Brand.Red)
            }
        }
    }
}

/**
 * Tap a Dari word, then its English meaning, to connect the pair. Two
 * independently shuffled columns of four.
 */
@Composable
fun ExerciseMatchView(
    words: List<Word>,
    onPlay: (String, String?) -> Unit,
    onComplete: (firstTryCorrect: Set<String>, missed: Set<String>) -> Unit,
    modifier: Modifier = Modifier,
) {
    val dariColumn = remember(words) { words.shuffled() }
    val englishColumn = remember(words) { words.shuffled() }

    var selectedDariId by remember(words) { mutableStateOf<String?>(null) }
    var selectedEnglishId by remember(words) { mutableStateOf<String?>(null) }
    var matchedIds by remember(words) { mutableStateOf(emptySet<String>()) }
    var missedIds by rememberSaveable(words) { mutableStateOf(emptySet<String>()) }
    var wrongIds by remember(words) { mutableStateOf(emptySet<String>()) }

    // Clear the red flash after a beat, then let the learner try again.
    LaunchedEffect(wrongIds) {
        if (wrongIds.isEmpty()) return@LaunchedEffect
        delay(500)
        wrongIds = emptySet()
        selectedDariId = null
        selectedEnglishId = null
    }

    LaunchedEffect(matchedIds) {
        if (matchedIds.size != words.size || words.isEmpty()) return@LaunchedEffect
        delay(550)
        val firstTry = words.map { it.id }.toSet() - missedIds
        onComplete(firstTry, missedIds)
    }

    fun select(word: Word, isDari: Boolean) {
        if (isDari) {
            selectedDariId = word.id
            onPlay(word.dari, word.audioKey)
        } else {
            selectedEnglishId = word.id
        }

        val dariId = selectedDariId
        val englishId = selectedEnglishId
        if (dariId == null || englishId == null) return

        if (dariId == englishId) {
            matchedIds = matchedIds + dariId
            selectedDariId = null
            selectedEnglishId = null
        } else {
            missedIds = missedIds + dariId + englishId
            wrongIds = setOf(dariId, englishId)
        }
    }

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            PromptLabel("MATCH THE PAIRS")
            Text(
                "Tap a Dari word, then its meaning",
                fontSize = 14.sp,
                color = Brand.MutedInk,
            )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                dariColumn.forEach { word ->
                    MatchTile(
                        word = word,
                        isDari = true,
                        isMatched = matchedIds.contains(word.id),
                        isSelected = selectedDariId == word.id,
                        isWrong = wrongIds.contains(word.id) && selectedDariId == word.id,
                    ) { select(word, true) }
                }
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                englishColumn.forEach { word ->
                    MatchTile(
                        word = word,
                        isDari = false,
                        isMatched = matchedIds.contains(word.id),
                        isSelected = selectedEnglishId == word.id,
                        isWrong = wrongIds.contains(word.id) && selectedEnglishId == word.id,
                    ) { select(word, false) }
                }
            }
        }
    }
}

@Composable
private fun MatchTile(
    word: Word,
    isDari: Boolean,
    isMatched: Boolean,
    isSelected: Boolean,
    isWrong: Boolean,
    onClick: () -> Unit,
) {
    val fill = when {
        isWrong -> Brand.RedSoft
        isMatched -> Brand.GreenSoft
        isSelected -> Brand.RedSoft
        else -> Color.White
    }
    val stroke = when {
        isWrong -> Brand.Red.copy(alpha = 0.7f)
        isMatched -> Brand.Green.copy(alpha = 0.5f)
        isSelected -> Brand.Red.copy(alpha = 0.7f)
        else -> Brand.Hairline
    }
    val content = if (isMatched) Brand.Green else Brand.Ink

    Surface(
        onClick = onClick,
        enabled = !isMatched,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Brand.CardRadius),
        color = fill,
        border = androidx.compose.foundation.BorderStroke(1.5.dp, stroke),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 68.dp)
                .padding(horizontal = 10.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            if (isDari) {
                DariText(word.dari, fontSize = 19.sp, color = content, textAlign = TextAlign.Center)
                Text(
                    word.phonetic,
                    fontSize = 12.sp,
                    fontStyle = FontStyle.Italic,
                    color = Brand.SecondaryInk,
                    textAlign = TextAlign.Center,
                )
            } else {
                Text(
                    word.english,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = content,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

/** Tap handler for surfaces that draw their own feedback. */
private fun Modifier.androidClickable(onClick: () -> Unit): Modifier =
    this.clickable(onClick = onClick)
