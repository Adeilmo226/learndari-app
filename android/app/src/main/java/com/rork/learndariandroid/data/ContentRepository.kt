package com.rork.learndariandroid.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.abs

private const val TAG = "ContentRepository"
private const val CACHE_FILE = "learndari-content.json"

/**
 * Live content for the app.
 *
 * Three layers, in order of preference:
 * 1. the last document downloaded from the backend (cached on disk),
 * 2. the copy bundled with the app ([MockData]) for a brand-new install,
 * 3. a background refresh that quietly replaces the above when it lands.
 *
 * The app therefore never shows a loading spinner and never goes blank offline.
 */
class ContentRepository(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    private val _document = MutableStateFlow(MockData.bundledDocument)
    val document: StateFlow<ContentDocument> = _document.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val cacheFile: File get() = File(context.filesDir, CACHE_FILE)

    private val baseUrl: String get() = Backend.baseUrl

    init {
        loadCache()?.let { _document.value = it.content }
    }

    /**
     * Pulls the latest published content. Failures are silent by design — the
     * learner keeps whatever they already have.
     */
    fun refresh(scope: CoroutineScope) {
        val base = baseUrl
        if (_isRefreshing.value) return

        scope.launch {
            _isRefreshing.value = true
            try {
                val body = withContext(Dispatchers.IO) { fetch("$base/content") }
                if (body != null) {
                    val envelope = json.decodeFromString<ContentEnvelope>(body)
                    if (looksComplete(envelope.content)) {
                        _document.value = envelope.content
                        withContext(Dispatchers.IO) { runCatching { cacheFile.writeText(body) } }
                    } else {
                        Log.w(TAG, "Ignored an incomplete content document")
                    }
                }
            } catch (error: Exception) {
                Log.i(TAG, "Refresh skipped: ${error.message}")
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    private fun fetch(urlString: String): String? {
        val connection = URL(urlString).openConnection() as HttpURLConnection
        return try {
            connection.connectTimeout = 12_000
            connection.readTimeout = 12_000
            connection.requestMethod = "GET"
            if (connection.responseCode != 200) return null
            connection.inputStream.bufferedReader().use { it.readText() }
        } catch (error: Exception) {
            Log.i(TAG, "Content request failed: ${error.message}")
            null
        } finally {
            connection.disconnect()
        }
    }

    private fun loadCache(): ContentEnvelope? = runCatching {
        if (!cacheFile.exists()) return null
        val envelope = json.decodeFromString<ContentEnvelope>(cacheFile.readText())
        if (looksComplete(envelope.content)) envelope else null
    }.getOrNull()

    /** Last line of defence against a half-written document blanking the app. */
    private fun looksComplete(document: ContentDocument): Boolean =
        document.units.isNotEmpty() &&
            document.vocabSets.isNotEmpty() &&
            document.units.all { unit ->
                unit.lessons.isNotEmpty() && unit.lessons.all { it.words.isNotEmpty() }
            }
}

// MARK: - Derived content

private val isoDay = SimpleDateFormat("yyyy-MM-dd", Locale.US)

/** Today's scheduled word, or a stable automatic pick so the card is never empty. */
fun ContentDocument.wordOfTheDay(): Word {
    val today = isoDay.format(Date())
    wordOfTheDaySchedule.firstOrNull { it.date == today }?.let { return it.word }

    val pool = vocabSets.flatMap { it.words }
    if (pool.isEmpty()) return popularWords.firstOrNull() ?: MockData.fallbackWord

    // Rotate deterministically by day so everyone sees the same word.
    val dayNumber = (System.currentTimeMillis() / 86_400_000L).toInt()
    return pool[abs(dayNumber) % pool.size]
}

/** Rotates daily so the featured proverb changes without any scheduling. */
fun ContentDocument.proverbOfTheDay(): Proverb? {
    if (proverbs.isEmpty()) return null
    val dayNumber = (System.currentTimeMillis() / 86_400_000L).toInt()
    return proverbs[abs(dayNumber) % proverbs.size]
}

/** Everything searchable on the Explore tab, de-duplicated by English term. */
fun ContentDocument.searchCorpus(): List<Word> {
    val all = phrases + vocabSets.flatMap { it.words } + popularWords
    val seen = mutableSetOf<String>()
    return all.filter { seen.add(it.english.lowercase()) }
}

/** Every word on the learning path — the distractor and review pool. */
fun ContentDocument.pathCorpus(): List<Word> =
    units.flatMap { unit -> unit.lessons.flatMap { it.words } }
