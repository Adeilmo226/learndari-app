package com.rork.learndariandroid.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.speech.tts.TextToSpeech
import android.util.Log
import com.rork.learndariandroid.data.Backend
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Locale

private const val TAG = "AudioService"

/**
 * Speaks Dari text aloud.
 *
 * Preference order, each step falling through silently so audio never simply
 * stops working:
 * 1. the creator's own recording (`audioKey`) from the backend,
 * 2. neural TTS from the backend's `/tts` route,
 * 3. on-device [TextToSpeech] with a Persian voice.
 */
class AudioService(private val context: Context) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var player: MediaPlayer? = null
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    /** Downloaded clips, keyed by text or recording key. */
    private val cacheDir: File by lazy {
        File(context.cacheDir, "audio").apply { mkdirs() }
    }

    var isSoundEnabled: Boolean = true

    private val baseUrl: String get() = Backend.baseUrl

    init {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Dari is closest to Persian; Arabic then English are the fallbacks.
                val locales = listOf(Locale("fa", "IR"), Locale("ar", "SA"), Locale.US)
                for (locale in locales) {
                    val result = tts?.setLanguage(locale)
                    if (result != TextToSpeech.LANG_MISSING_DATA &&
                        result != TextToSpeech.LANG_NOT_SUPPORTED
                    ) {
                        break
                    }
                }
                tts?.setSpeechRate(0.85f)
                isTtsReady = true
            } else {
                Log.i(TAG, "On-device speech unavailable")
            }
        }
    }

    /** Speaks a Dari string. */
    fun speak(text: String, audioKey: String? = null) {
        if (!isSoundEnabled || text.isEmpty()) return
        stop()

        val base = baseUrl

        scope.launch {
            val clip = withContext(Dispatchers.IO) { resolveClip(base, text, audioKey) }
            if (clip != null) play(clip, text) else speakOnDevice(text)
        }
    }

    /** A human recording always wins when one exists; TTS is the backup. */
    private fun resolveClip(base: String, text: String, audioKey: String?): File? {
        if (!audioKey.isNullOrEmpty()) {
            download("$base/audio/$audioKey", "recording-$audioKey")?.let { return it }
        }
        val safeName = "tts-" + text.hashCode().toString().replace("-", "n")
        val encoded = URLEncoder.encode(text, "UTF-8")
        return download("$base/tts?text=$encoded", safeName)
    }

    private fun download(urlString: String, cacheName: String): File? {
        val cached = File(cacheDir, cacheName)
        if (cached.exists() && cached.length() > 0) return cached

        var connection: HttpURLConnection? = null
        return try {
            connection = URL(urlString).openConnection() as HttpURLConnection
            connection.connectTimeout = 10_000
            connection.readTimeout = 10_000
            if (connection.responseCode != 200) return null

            val bytes = connection.inputStream.use { it.readBytes() }
            if (bytes.isEmpty()) return null
            cached.writeBytes(bytes)
            cached
        } catch (error: Exception) {
            Log.i(TAG, "Audio unavailable, falling back: ${error.message}")
            null
        } finally {
            connection?.disconnect()
        }
    }

    private fun play(file: File, fallbackText: String) {
        try {
            val mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build(),
                )
                setDataSource(file.absolutePath)
                setOnCompletionListener { release(); player = null }
                prepare()
                start()
            }
            player = mediaPlayer
        } catch (error: Exception) {
            Log.i(TAG, "Playback failed, using on-device speech: ${error.message}")
            speakOnDevice(fallbackText)
        }
    }

    private fun speakOnDevice(text: String) {
        if (!isTtsReady) return
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, text.hashCode().toString())
    }

    fun stop() {
        runCatching {
            player?.stop()
            player?.release()
        }
        player = null
        runCatching { tts?.stop() }
    }

    fun shutdown() {
        stop()
        runCatching { tts?.shutdown() }
        tts = null
    }
}
