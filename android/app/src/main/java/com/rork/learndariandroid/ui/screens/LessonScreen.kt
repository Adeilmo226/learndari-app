package com.rork.learndariandroid.ui.screens

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Lesson
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.AudioButton
import com.rork.learndariandroid.ui.components.DariText
import com.rork.learndariandroid.ui.components.PrimaryButton
import com.rork.learndariandroid.ui.theme.Brand
import com.rork.learndariandroid.ui.theme.DariTextDirection

/**
 * Phase one of a lesson: meet each new word on its own card, then start
 * practice. The Android twin of `LessonView`.
 */
@Composable
fun LessonScreen(
    lesson: Lesson,
    onPlay: (String, String?) -> Unit,
    onStartPractice: () -> Unit,
    onFlashcards: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var index by remember(lesson.id) { mutableIntStateOf(0) }
    val words = lesson.words
    val word: Word? = words.getOrNull(index.coerceAtMost(words.lastIndex.coerceAtLeast(0)))
    val isLastCard = index >= words.size - 1

    // Each card speaks once as it appears; the button replays it on demand.
    LaunchedEffect(lesson.id, index) {
        word?.let { onPlay(it.dari, it.audioKey) }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        ProgressDots(count = words.size, activeIndex = index)

        if (word == null) {
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                Text(
                    "This lesson has no words yet.",
                    fontSize = 16.sp,
                    color = Brand.SecondaryInk,
                )
            }
        } else {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState()),
            ) {
                IntroCard(word, onPlay)
            }
        }

        Column(
            modifier = Modifier.padding(bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            PrimaryButton(
                text = if (isLastCard) "Start practice" else "Next",
                onClick = { if (isLastCard) onStartPractice() else index += 1 },
                enabled = words.isNotEmpty(),
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                TextButton(onClick = { if (index > 0) index -= 1 }, enabled = index > 0) {
                    Text(
                        "Back",
                        color = if (index == 0) Brand.MutedInk else Brand.Red,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                    )
                }
                Spacer(Modifier.width(20.dp))
                TextButton(onClick = onFlashcards) {
                    Text(
                        "Review as flashcards",
                        color = Brand.Red,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                    )
                }
            }
        }
    }
}

@Composable
private fun ProgressDots(count: Int, activeIndex: Int) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        repeat(count) { position ->
            val isActive = position == activeIndex
            val width by animateDpAsState(
                targetValue = if (isActive) 22.dp else 8.dp,
                label = "dotWidth",
            )
            Box(
                Modifier
                    .width(width)
                    .height(8.dp)
                    .background(if (isActive) Brand.Red else Brand.Hairline, CircleShape),
            )
        }
    }
}

@Composable
private fun IntroCard(word: Word, onPlay: (String, String?) -> Unit) {
    AppCard(modifier = Modifier.fillMaxWidth(), radius = Brand.FeaturedRadius) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            DariText(word.dari, fontSize = 50.sp, textAlign = TextAlign.Center)

            Text(
                word.phonetic,
                fontSize = 22.sp,
                fontStyle = FontStyle.Italic,
                color = Brand.SecondaryInk,
                textAlign = TextAlign.Center,
            )

            HorizontalDivider(
                modifier = Modifier.padding(horizontal = 40.dp),
                thickness = 1.dp,
                color = Brand.Hairline,
            )

            Text(
                word.english,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Brand.Ink,
                textAlign = TextAlign.Center,
            )

            AudioButton(word.dari, word.audioKey, onPlay, size = 64.dp)

            if (word.hasExample) {
                ExampleBlock(word)
            }
        }
    }
}

@Composable
private fun ExampleBlock(word: Word) {
    val sentence = word.exampleDari.orEmpty()
    val target = word.dari

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brand.Fill, RoundedCornerShape(Brand.CardRadius))
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // Bolds the word being taught inside its example sentence.
        val annotated = buildAnnotatedString {
            val start = sentence.indexOf(target)
            if (target.isEmpty() || start < 0) {
                append(sentence)
            } else {
                append(sentence.substring(0, start))
                pushStyle(SpanStyle(fontWeight = FontWeight.Bold, color = Brand.Red))
                append(target)
                pop()
                append(sentence.substring(start + target.length))
            }
        }

        Text(
            text = annotated,
            style = TextStyle(
                fontSize = 19.sp,
                color = Brand.Ink,
                textDirection = DariTextDirection,
                textAlign = TextAlign.Center,
            ),
            modifier = Modifier.fillMaxWidth(),
        )

        Text(
            text = word.exampleEnglish.orEmpty(),
            fontSize = 14.sp,
            color = Brand.SecondaryInk,
            textAlign = TextAlign.Center,
        )
    }
}

/** A speaker icon sized for the intro card, kept here for layout symmetry. */
@Composable
@Suppress("unused")
private fun IntroAudioSpacer() {
    Spacer(Modifier.size(2.dp))
}
