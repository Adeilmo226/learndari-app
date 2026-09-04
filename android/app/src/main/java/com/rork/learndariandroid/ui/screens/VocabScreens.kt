package com.rork.learndariandroid.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.VocabSet
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.AudioButton
import com.rork.learndariandroid.ui.components.CardList
import com.rork.learndariandroid.ui.components.ClickableCard
import com.rork.learndariandroid.ui.components.SectionHeading
import com.rork.learndariandroid.ui.components.WordRow
import com.rork.learndariandroid.ui.theme.Brand

/** Tab 2 — browse vocabulary sets. */
@Composable
fun VocabScreen(
    sets: List<VocabSet>,
    onPlay: (String, String?) -> Unit,
    onOpenSet: (VocabSet) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.fillMaxSize().background(Color.White),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            start = 16.dp, end = 16.dp, bottom = 32.dp,
        ),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
            Column(
                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    "Vocabulary Sets",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = Brand.Ink,
                )
                Text("Choose a set to start learning", fontSize = 18.sp, color = Brand.SecondaryInk)
                Text("More vocab sets coming soon.", fontSize = 14.sp, color = Brand.MutedInk)
            }
        }

        items(sets, key = { it.id }) { set ->
            VocabSetCard(set, onPlay) { onOpenSet(set) }
        }
    }
}

@Composable
private fun VocabSetCard(set: VocabSet, onPlay: (String, String?) -> Unit, onOpen: () -> Unit) {
    ClickableCard(onClick = onOpen, modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 200.dp)
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                Text(set.emoji, fontSize = 34.sp, modifier = Modifier.weight(1f))
                AudioButton(
                    text = set.words.firstOrNull()?.dari ?: set.name,
                    audioKey = set.words.firstOrNull()?.audioKey,
                    onPlay = onPlay,
                    size = 34.dp,
                )
            }

            Text(set.name, fontSize = 19.sp, fontWeight = FontWeight.Bold, color = Brand.Ink)

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.VolumeUp,
                    contentDescription = null,
                    tint = Brand.Green,
                    modifier = Modifier.size(12.dp),
                )
                Text("Audio", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Brand.Green)
            }

            Text(
                set.summary,
                fontSize = 13.sp,
                color = Brand.SecondaryInk,
                maxLines = 2,
                modifier = Modifier.weight(1f),
            )

            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "${set.wordCount} words",
                    fontSize = 12.sp,
                    color = Brand.MutedInk,
                    modifier = Modifier.weight(1f),
                )
                Text("Start", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Brand.Red)
            }
        }
    }
}

/** An opened vocabulary set: two study modes plus the full word list. */
@Composable
fun VocabSetScreen(
    set: VocabSet,
    onPlay: (String, String?) -> Unit,
    onFlashcards: () -> Unit,
    onQuiz: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        AppCard(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Text(set.emoji, fontSize = 42.sp)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(set.name, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Brand.Ink)
                    Text("${set.summary} in Dari", fontSize = 14.sp, color = Brand.SecondaryInk)
                }
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            ModeCard(
                title = "Flashcards",
                subtitle = "Review vocabulary with interactive cards",
                icon = Icons.Filled.Style,
                tint = Brand.Red,
                background = Brand.RedSoft,
                modifier = Modifier.weight(1f),
                onClick = onFlashcards,
            )
            ModeCard(
                title = "Quiz Mode",
                subtitle = "Test your knowledge with multiple choice",
                icon = Icons.Filled.FactCheck,
                tint = Brand.Green,
                background = Brand.GreenSoft,
                modifier = Modifier.weight(1f),
                onClick = onQuiz,
            )
        }

        SectionHeading("All Words (${set.wordCount})")

        CardList(items = set.words) { word ->
            WordRow(word = word, onPlay = onPlay)
        }
    }
}

@Composable
private fun ModeCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    tint: Color,
    background: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    ClickableCard(
        onClick = onClick,
        modifier = modifier,
        background = background.copy(alpha = 0.45f),
        borderColor = tint.copy(alpha = 0.18f),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 168.dp)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Column(
                modifier = Modifier
                    .size(46.dp)
                    .background(background, RoundedCornerShape(12.dp)),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(22.dp))
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, fontSize = 19.sp, fontWeight = FontWeight.Bold, color = Brand.Ink)
                Spacer(Modifier.size(4.dp))
                Icon(
                    Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = null,
                    tint = tint,
                    modifier = Modifier.size(18.dp),
                )
            }

            Text(subtitle, fontSize = 13.sp, color = Brand.SecondaryInk)
        }
    }
}

/** Fallback border used when a mode card needs a stronger edge. */
@Suppress("unused")
private fun Modifier.tintedBorder(tint: Color): Modifier =
    border(1.dp, tint.copy(alpha = 0.18f), RoundedCornerShape(Brand.CardRadius))
