package com.rork.learndariandroid.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.ui.components.AudioButton
import com.rork.learndariandroid.ui.components.DariText
import com.rork.learndariandroid.ui.components.SecondaryButton
import com.rork.learndariandroid.ui.theme.Brand

private enum class FlashcardSide(val label: String) {
    Dari("Dari first"),
    English("English first"),
}

/**
 * Quizlet-style cards: tap the card to flip, use the arrows to move between
 * words. The Dari face always pairs the script with its phonetic spelling.
 */
@Composable
fun FlashcardsScreen(
    words: List<Word>,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (words.isEmpty()) {
        Box(modifier.fillMaxSize().background(Color.White), contentAlignment = Alignment.Center) {
            Text("No words to review yet.", color = Brand.SecondaryInk)
        }
        return
    }

    var index by remember { mutableIntStateOf(0) }
    var isFlipped by remember { mutableStateOf(false) }
    var startSide by remember { mutableStateOf(FlashcardSide.Dari) }

    val word = words[index.coerceIn(0, words.lastIndex)]
    val visibleSide = if (isFlipped) {
        if (startSide == FlashcardSide.Dari) FlashcardSide.English else FlashcardSide.Dari
    } else {
        startSide
    }

    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(350),
        label = "flip",
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(horizontal = 20.dp)
            .padding(bottom = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
            FlashcardSide.entries.forEachIndexed { position, side ->
                SegmentedButton(
                    selected = startSide == side,
                    onClick = {
                        startSide = side
                        isFlipped = false
                    },
                    shape = SegmentedButtonDefaults.itemShape(position, FlashcardSide.entries.size),
                    colors = SegmentedButtonDefaults.colors(
                        activeContainerColor = Brand.RedSoft,
                        activeContentColor = Brand.Red,
                        inactiveContainerColor = Color.White,
                        inactiveContentColor = Brand.SecondaryInk,
                    ),
                ) {
                    Text(side.label, fontSize = 14.sp)
                }
            }
        }

        Text(
            "Card ${index + 1} of ${words.size}",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Brand.SecondaryInk,
        )

        LinearProgressIndicator(
            progress = { (index + 1).toFloat() / words.size },
            modifier = Modifier.fillMaxWidth(0.8f).height(6.dp),
            color = Brand.Red,
            trackColor = Brand.Hairline,
            strokeCap = androidx.compose.ui.graphics.StrokeCap.Round,
            gapSize = 0.dp,
            drawStopIndicator = {},
        )

        Spacer(Modifier.weight(1f))

        Surface(
            onClick = { isFlipped = !isFlipped },
            modifier = Modifier
                .fillMaxWidth()
                .height(340.dp)
                .graphicsLayer {
                    rotationX = rotation
                    cameraDistance = 12f * density
                },
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            border = BorderStroke(
                1.5.dp,
                if (isFlipped) Brand.Green.copy(alpha = 0.4f) else Brand.Hairline,
            ),
            shadowElevation = 4.dp,
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer { rotationX = rotation }
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                if (visibleSide == FlashcardSide.Dari) {
                    DariText(word.dari, fontSize = 50.sp, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(18.dp))
                    Text(
                        word.phonetic,
                        fontSize = 22.sp,
                        fontStyle = FontStyle.Italic,
                        color = Brand.SecondaryInk,
                        textAlign = TextAlign.Center,
                    )
                } else {
                    Text(
                        word.english,
                        fontSize = 38.sp,
                        fontWeight = FontWeight.Bold,
                        color = Brand.Ink,
                        textAlign = TextAlign.Center,
                    )
                }
                Spacer(Modifier.height(18.dp))
                AudioButton(word.dari, word.audioKey, onPlay, size = 56.dp)
            }
        }

        Text(
            "Tap the card to flip",
            fontSize = 13.sp,
            color = Brand.MutedInk,
            textAlign = TextAlign.Center,
        )

        Spacer(Modifier.weight(1f))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            SecondaryButton(
                text = "Previous",
                onClick = {
                    if (index > 0) {
                        isFlipped = false
                        index -= 1
                    }
                },
                modifier = Modifier.weight(1f),
                enabled = index > 0,
            )
            SecondaryButton(
                text = "Next",
                onClick = {
                    if (index < words.lastIndex) {
                        isFlipped = false
                        index += 1
                    }
                },
                modifier = Modifier.weight(1f),
                enabled = index < words.lastIndex,
            )
        }
    }
}
