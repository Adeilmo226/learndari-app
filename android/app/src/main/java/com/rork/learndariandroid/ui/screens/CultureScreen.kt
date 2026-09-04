package com.rork.learndariandroid.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.CultureTopic
import com.rork.learndariandroid.data.Proverb
import com.rork.learndariandroid.data.TopicIcon
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.data.cultureTopics
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.ProverbCard
import com.rork.learndariandroid.ui.components.SectionHeading
import com.rork.learndariandroid.ui.components.WordOfTheDayCard
import com.rork.learndariandroid.ui.theme.Brand

/** Tab 4 — Afghan wisdom and traditions. */
@Composable
fun CultureScreen(
    proverbOfTheDay: Proverb?,
    onPlay: (String, String?) -> Unit,
    onProverbs: () -> Unit,
    onTraditions: () -> Unit,
    onWordOfTheDay: () -> Unit,
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
        if (proverbOfTheDay != null) {
            ProverbCard(
                proverb = proverbOfTheDay,
                onPlay = onPlay,
                modifier = Modifier.padding(top = 6.dp),
                onBrowse = onProverbs,
            )
        }

        SectionHeading("Culture & Language")

        AppCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                CategoryRow("🇦🇫", Brand.RedSoft, "Afghan Proverbs", "Traditional Afghan wisdom and sayings", onProverbs)
                androidx.compose.material3.HorizontalDivider(
                    modifier = Modifier.padding(start = 74.dp),
                    thickness = 1.dp,
                    color = Brand.Hairline,
                )
                CategoryRow("🏛️", Brand.Amber.copy(alpha = 0.16f), "Culture & Traditions", "Afghan food culture, holidays, and customs", onTraditions)
                androidx.compose.material3.HorizontalDivider(
                    modifier = Modifier.padding(start = 74.dp),
                    thickness = 1.dp,
                    color = Brand.Hairline,
                )
                CategoryRow("📖", Brand.GreenSoft, "Word of the Day", "Today's word with pronunciation", onWordOfTheDay)
            }
        }
    }
}

@Composable
private fun CategoryRow(
    emoji: String,
    tint: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(tint, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Text(emoji, fontSize = 22.sp)
        }

        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(title, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Brand.Ink)
            Text(subtitle, fontSize = 14.sp, color = Brand.SecondaryInk)
        }

        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = Brand.MutedInk,
            modifier = Modifier.size(20.dp),
        )
    }
}

/** Every proverb, searchable by nothing more than scrolling. */
@Composable
fun ProverbsScreen(
    proverbs: List<Proverb>,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp, top = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        proverbs.forEach { proverb ->
            ProverbCard(proverb = proverb, onPlay = onPlay)
        }
    }
}

/** The Culture & Traditions long-read. */
@Composable
fun TraditionsScreen(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp, top = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        cultureTopics.forEach { topic ->
            TraditionCard(topic)
        }
    }
}

private fun TopicIcon.vector(): ImageVector = when (this) {
    TopicIcon.People -> Icons.Filled.Groups
    TopicIcon.Tea -> Icons.Filled.LocalCafe
    TopicIcon.Calendar -> Icons.Filled.CalendarMonth
    TopicIcon.House -> Icons.Filled.Home
    TopicIcon.Music -> Icons.Filled.MusicNote
    TopicIcon.Heart -> Icons.Filled.Favorite
}

@Composable
private fun TraditionCard(topic: CultureTopic) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Brand.CardRadius))
            .border(1.dp, Brand.Hairline, RoundedCornerShape(Brand.CardRadius)),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brand.TopicGradient)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    topic.icon.vector(),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(22.dp),
                )
            }
            Text(topic.title, fontSize = 19.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            topic.sections.forEach { section ->
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        section.subtitle,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Brand.Ink,
                    )
                    Text(
                        section.text,
                        fontSize = 14.sp,
                        lineHeight = 21.sp,
                        color = Brand.SecondaryInk,
                    )
                }
            }
        }
    }
}

/** Standalone Word of the Day screen reached from the Culture tab. */
@Composable
fun WordOfTheDayScreen(
    word: Word,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        WordOfTheDayCard(word, onPlay)

        AppCard(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.MenuBook,
                        contentDescription = null,
                        tint = Brand.Red,
                        modifier = Modifier.size(18.dp),
                    )
                    Text("Use it today", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Brand.Ink)
                }
                Text(
                    "A new word appears here every day. Say it out loud with the audio button, then try to use it in a sentence before the day is over.",
                    fontSize = 14.sp,
                    lineHeight = 21.sp,
                    color = Brand.SecondaryInk,
                )
            }
        }
    }
}
