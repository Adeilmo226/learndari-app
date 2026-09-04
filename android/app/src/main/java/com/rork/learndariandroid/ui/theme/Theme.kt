package com.rork.learndariandroid.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp

/**
 * The LearnDari brand, ported verbatim from the iOS `Theme` enum so both
 * platforms render the same red, the same green and the same hairline grey.
 */
object Brand {
    val Red = Color(0xFFD7222E)
    val RedSoft = Color(0xFFFDECEC)
    val Green = Color(0xFF17803D)
    val GreenSoft = Color(0xFFE8F6ED)
    val Amber = Color(0xFFD89828)
    val Ink = Color(0xFF111113)
    val SecondaryInk = Color(0xFF6B6B72)
    val MutedInk = Color(0xFFB6B6BC)
    val Hairline = Color(0xFFEAEAEC)
    val Fill = Color(0xFFF6F6F7)
    val Surface = Color.White

    val CardRadius = 16.dp
    val FeaturedRadius = 20.dp

    /** The website's diagonal red → amber → green wash, reserved for featured cards. */
    val FeaturedGradient = Brush.linearGradient(
        colors = listOf(
            Color(0xFFE23B34),
            Color(0xFFC98A2E),
            Color(0xFF12A150),
        ),
    )

    /** Red header used on the Culture topic cards. */
    val TopicGradient = Brush.horizontalGradient(
        colors = listOf(Color(0xFFEF4444), Red),
    )
}

private val LearnDariColors = lightColorScheme(
    primary = Brand.Red,
    onPrimary = Color.White,
    primaryContainer = Brand.RedSoft,
    onPrimaryContainer = Brand.Red,
    secondary = Brand.Green,
    onSecondary = Color.White,
    tertiary = Brand.Amber,
    background = Color.White,
    onBackground = Brand.Ink,
    surface = Color.White,
    onSurface = Brand.Ink,
    surfaceVariant = Brand.Fill,
    onSurfaceVariant = Brand.SecondaryInk,
    outline = Brand.Hairline,
    outlineVariant = Brand.Hairline,
    error = Brand.Red,
    onError = Color.White,
)

/** Dari script reads right to left; every Dari string uses this style. */
val DariTextDirection: TextDirection = TextDirection.Rtl

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LearnDariColors,
        typography = Typography(),
        content = content,
    )
}

/** White face, hairline border, generous rounding — the app's default card. */
fun Modifier.cardStyle(radius: androidx.compose.ui.unit.Dp = Brand.CardRadius): Modifier =
    this
        .background(Color.White, RoundedCornerShape(radius))
        .border(1.dp, Brand.Hairline, RoundedCornerShape(radius))

val ScreenPadding = PaddingValues(horizontal = 16.dp)
