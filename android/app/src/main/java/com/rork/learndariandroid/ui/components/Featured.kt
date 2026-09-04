package com.rork.learndariandroid.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Proverb
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.ui.theme.Brand

/** The gradient Word of the Day banner, shared by Explore and Culture. */
@Composable
fun WordOfTheDayCard(
    word: Word,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    GradientCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Icon(
                    Icons.Filled.Star,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.95f),
                    modifier = Modifier.size(16.dp),
                )
                Text(
                    "WORD OF THE DAY",
                    color = Color.White.copy(alpha = 0.95f),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.6.sp,
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.16f), RoundedCornerShape(14.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                FeaturedColumn("English", modifier = Modifier.weight(1f)) {
                    Text(
                        word.english,
                        color = Color.White,
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                    )
                }
                FeaturedColumn("Dari", modifier = Modifier.weight(1f)) {
                    DariText(word.dari, fontSize = 21.sp, color = Color.White, maxLines = 1)
                }
                FeaturedColumn("Pronunciation", modifier = Modifier.weight(1f)) {
                    Text(
                        word.phonetic,
                        color = Color.White,
                        fontSize = 17.sp,
                        fontStyle = FontStyle.Italic,
                        maxLines = 1,
                    )
                }
                AudioButton(word.dari, word.audioKey, onPlay, size = 48.dp, onFeatured = true)
            }
        }
    }
}

@Composable
private fun FeaturedColumn(
    label: String,
    modifier: Modifier = Modifier,
    value: @Composable () -> Unit,
) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, color = Color.White.copy(alpha = 0.85f), fontSize = 11.sp)
        value()
    }
}

/** The featured proverb card, used both on Culture and in the proverbs list. */
@Composable
fun ProverbCard(
    proverb: Proverb,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
    onBrowse: (() -> Unit)? = null,
) {
    GradientCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = if (onBrowse == null) proverb.category.uppercase() else "PROVERB OF THE DAY",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.6.sp,
                    modifier = Modifier.weight(1f),
                )
                AudioButton(proverb.dari, proverb.audioKey, onPlay, onFeatured = true)
            }

            Text(
                text = "\u201C${proverb.english}\u201D",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 29.sp,
            )

            DariText(
                proverb.dari,
                modifier = Modifier.fillMaxWidth(),
                fontSize = 22.sp,
                color = Color.White,
                textAlign = TextAlign.End,
            )

            Text(
                text = proverb.phonetic,
                color = Color.White.copy(alpha = 0.92f),
                fontSize = 14.sp,
                fontStyle = FontStyle.Italic,
                textAlign = TextAlign.End,
                modifier = Modifier.fillMaxWidth(),
            )

            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { append("Meaning: ") }
                    append(proverb.meaning)
                },
                color = Color.White,
                fontSize = 14.sp,
                lineHeight = 20.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.18f), RoundedCornerShape(12.dp))
                    .padding(14.dp),
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = proverb.category,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier
                        .background(Color.White.copy(alpha = 0.2f), CircleShape)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                )

                if (onBrowse != null) {
                    androidx.compose.foundation.layout.Spacer(Modifier.weight(1f))
                    TextButton(onClick = onBrowse) {
                        Text(
                            "Browse all proverbs",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Icon(
                            Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                }
            }
        }
    }
}
