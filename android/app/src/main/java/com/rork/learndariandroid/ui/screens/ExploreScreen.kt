package com.rork.learndariandroid.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.TravelExplore
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.ui.components.AppCard
import com.rork.learndariandroid.ui.components.CardList
import com.rork.learndariandroid.ui.components.SectionHeading
import com.rork.learndariandroid.ui.components.WordOfTheDayCard
import com.rork.learndariandroid.ui.components.WordRow
import com.rork.learndariandroid.ui.theme.Brand

/** Tab 3 — translation search that behaves like a real translator. */
@Composable
fun ExploreScreen(
    corpus: List<Word>,
    popularWords: List<Word>,
    wordOfTheDay: Word,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    var query by remember { mutableStateOf("") }
    val trimmed = query.trim()
    val isSearching = trimmed.isNotEmpty()

    val results = remember(trimmed, corpus) {
        if (trimmed.isEmpty()) {
            emptyList()
        } else {
            corpus.filter { word ->
                word.english.contains(trimmed, ignoreCase = true) ||
                    word.phonetic.contains(trimmed, ignoreCase = true) ||
                    word.dari.contains(trimmed)
            }.take(20)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        SearchField(
            query = query,
            onQueryChange = { query = it },
            onClear = { query = "" },
            modifier = Modifier.padding(top = 6.dp),
        )

        if (isSearching) {
            if (results.isEmpty()) {
                AppCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Icon(
                            Icons.Filled.TravelExplore,
                            contentDescription = null,
                            tint = Brand.MutedInk,
                            modifier = Modifier.size(38.dp),
                        )
                        Text(
                            "No translation yet",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Brand.Ink,
                        )
                        Text(
                            "We couldn't find \u201C$trimmed\u201D. Try another word or phrase — more are added every week.",
                            fontSize = 14.sp,
                            color = Brand.SecondaryInk,
                            textAlign = TextAlign.Center,
                        )
                    }
                }
            } else {
                SectionHeading("${results.size} result${if (results.size == 1) "" else "s"}")
                CardList(items = results) { word ->
                    WordRow(word = word, onPlay = onPlay, showsCategory = true)
                }
            }
        } else {
            WordOfTheDayCard(wordOfTheDay, onPlay)

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Icon(
                    Icons.Filled.TrendingUp,
                    contentDescription = null,
                    tint = Brand.Red,
                    modifier = Modifier.size(18.dp),
                )
                SectionHeading("Popular Words")
            }

            CardList(items = popularWords) { word ->
                WordRow(word = word, onPlay = onPlay, showsCategory = true)
            }
        }
    }
}

@Composable
private fun SearchField(
    query: String,
    onQueryChange: (String) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Brand.Fill, RoundedCornerShape(14.dp))
            .border(1.dp, Brand.Hairline, RoundedCornerShape(14.dp))
            .padding(horizontal = 16.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Icon(
            Icons.Filled.Search,
            contentDescription = null,
            tint = Brand.SecondaryInk,
            modifier = Modifier.size(20.dp),
        )

        androidx.compose.foundation.layout.Box(
            modifier = Modifier.weight(1f),
            contentAlignment = Alignment.CenterStart,
        ) {
            if (query.isEmpty()) {
                Text(
                    "Search a word or phrase…",
                    fontSize = 16.sp,
                    color = Brand.MutedInk,
                )
            }
            BasicTextField(
                value = query,
                onValueChange = onQueryChange,
                singleLine = true,
                textStyle = TextStyle(fontSize = 16.sp, color = Brand.Ink),
                cursorBrush = SolidColor(Brand.Red),
                modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp),
            )
        }

        if (query.isNotEmpty()) {
            IconButton(onClick = onClear, modifier = Modifier.size(28.dp)) {
                Icon(
                    Icons.Filled.Cancel,
                    contentDescription = "Clear search",
                    tint = Brand.MutedInk,
                    modifier = Modifier.size(20.dp),
                )
            }
        }
    }
}
