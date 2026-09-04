package com.rork.learndariandroid.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rork.learndariandroid.data.Word
import com.rork.learndariandroid.ui.theme.Brand
import com.rork.learndariandroid.ui.theme.DariTextDirection

/** White surface, hairline border, generous rounding — the app's default card. */
@Composable
fun AppCard(
    modifier: Modifier = Modifier,
    radius: Dp = Brand.CardRadius,
    content: @Composable () -> Unit,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(radius),
        color = Color.White,
        border = BorderStroke(1.dp, Brand.Hairline),
        shadowElevation = 1.dp,
        content = content,
    )
}

/** Dari script, always laid out right to left. */
@Composable
fun DariText(
    text: String,
    modifier: Modifier = Modifier,
    fontSize: androidx.compose.ui.unit.TextUnit = 20.sp,
    color: Color = Brand.Ink,
    fontWeight: FontWeight? = null,
    textAlign: TextAlign = TextAlign.Unspecified,
    maxLines: Int = Int.MAX_VALUE,
) {
    Text(
        text = text,
        modifier = modifier,
        style = TextStyle(
            fontSize = fontSize,
            color = color,
            fontWeight = fontWeight,
            textDirection = DariTextDirection,
            textAlign = textAlign,
        ),
        maxLines = maxLines,
        overflow = TextOverflow.Ellipsis,
    )
}

/** Circular speaker button that accompanies every Dari word or phrase. */
@Composable
fun AudioButton(
    text: String,
    audioKey: String?,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    onFeatured: Boolean = false,
) {
    IconButton(
        onClick = { onPlay(text, audioKey) },
        modifier = modifier
            .size(size)
            .background(
                if (onFeatured) Color.White.copy(alpha = 0.22f) else Brand.RedSoft,
                CircleShape,
            ),
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.VolumeUp,
            contentDescription = "Play pronunciation",
            tint = if (onFeatured) Color.White else Brand.Red,
            modifier = Modifier.size(size * 0.46f),
        )
    }
}

/** Small pill used for locked content and category tags. */
@Composable
fun TagPill(
    text: String,
    modifier: Modifier = Modifier,
    foreground: Color = Brand.Red,
    background: Color = Brand.RedSoft,
) {
    Text(
        text = text,
        color = foreground,
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = modifier
            .background(background, CircleShape)
            .padding(horizontal = 8.dp, vertical = 4.dp),
    )
}

/** Section heading used above lists throughout the app. */
@Composable
fun SectionHeading(title: String, modifier: Modifier = Modifier) {
    Text(
        text = title,
        modifier = modifier.fillMaxWidth(),
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = Brand.Ink,
    )
}

/**
 * The recurring English / Dari / pronunciation row used across Vocab, Explore
 * and lessons.
 */
@Composable
fun WordRow(
    word: Word,
    onPlay: (String, String?) -> Unit,
    modifier: Modifier = Modifier,
    showsCategory: Boolean = false,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = word.english,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Brand.Ink,
            )
            val category = word.category
            if (showsCategory && category != null) {
                Text(
                    text = category,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Brand.SecondaryInk,
                    modifier = Modifier
                        .background(Brand.Fill, CircleShape)
                        .padding(horizontal = 7.dp, vertical = 3.dp),
                )
            }
        }

        Column(horizontalAlignment = Alignment.End) {
            DariText(word.dari, fontSize = 20.sp)
            Text(
                text = word.phonetic,
                fontSize = 14.sp,
                fontStyle = FontStyle.Italic,
                color = Brand.SecondaryInk,
            )
        }

        AudioButton(word.dari, word.audioKey, onPlay, size = 40.dp)
    }
}

/** Hairline rule between rows inside a card. */
@Composable
fun RowDivider(startIndent: Dp = 16.dp) {
    HorizontalDivider(
        modifier = Modifier.padding(start = startIndent),
        thickness = 1.dp,
        color = Brand.Hairline,
    )
}

/** Wraps a list of rows in one card with dividers between them. */
@Composable
fun <T> CardList(
    items: List<T>,
    modifier: Modifier = Modifier,
    dividerIndent: Dp = 16.dp,
    row: @Composable (T) -> Unit,
) {
    AppCard(modifier = modifier.fillMaxWidth()) {
        Column {
            items.forEachIndexed { index, item ->
                row(item)
                if (index < items.size - 1) RowDivider(dividerIndent)
            }
        }
    }
}

/** A value with a caption underneath, three across — used on every summary. */
@Composable
fun StatTile(value: String, label: String, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = value,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Brand.Ink,
            )
            Text(
                text = label,
                fontSize = 12.sp,
                color = Brand.SecondaryInk,
                textAlign = TextAlign.Center,
            )
        }
    }
}

/** The prompt label above every exercise card. */
@Composable
fun PromptLabel(text: String) {
    Text(
        text = text,
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.5.sp,
        color = Brand.SecondaryInk,
        textAlign = TextAlign.Center,
    )
}

/** Horizontal spacer used inside rows. */
@Composable
fun HSpace(width: Dp) {
    Spacer(Modifier.width(width))
}

/** Content padding shared by every scrolling screen. */
val ScreenContentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp)

/** A tinted square holding an emoji or icon, used on list rows. */
@Composable
fun TintedBadge(
    background: Color,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    radius: Dp = 12.dp,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .size(size)
            .background(background, RoundedCornerShape(radius)),
        contentAlignment = Alignment.Center,
        content = { content() },
    )
}

/** Full-width primary action, the app's only filled button style. */
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    androidx.compose.material3.Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        shape = RoundedCornerShape(14.dp),
        colors = androidx.compose.material3.ButtonDefaults.buttonColors(
            containerColor = Brand.Red,
            contentColor = Color.White,
        ),
        contentPadding = PaddingValues(vertical = 16.dp),
    ) {
        Text(text, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
    }
}

/** Bordered, quieter action used beside [PrimaryButton]. */
@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    androidx.compose.material3.OutlinedButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, Brand.Hairline),
        colors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(
            contentColor = Brand.SecondaryInk,
        ),
        contentPadding = PaddingValues(vertical = 14.dp),
    ) {
        Text(text, fontSize = 15.sp, fontWeight = FontWeight.Medium)
    }
}

/** A card whose whole surface is tappable. */
@Composable
fun ClickableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    radius: Dp = Brand.CardRadius,
    borderColor: Color = Brand.Hairline,
    background: Color = Color.White,
    content: @Composable () -> Unit,
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(radius),
        color = background,
        border = BorderStroke(1.dp, borderColor),
        shadowElevation = 1.dp,
        content = content,
    )
}

/** Featured surface painted with the brand gradient. */
@Composable
fun GradientCard(
    modifier: Modifier = Modifier,
    radius: Dp = Brand.FeaturedRadius,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .background(Brand.FeaturedGradient, RoundedCornerShape(radius))
            .border(1.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(radius)),
    ) {
        content()
    }
}
