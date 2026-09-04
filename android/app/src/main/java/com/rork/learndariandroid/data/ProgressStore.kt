package com.rork.learndariandroid.data

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.json.Json
import kotlin.math.max
import kotlin.math.min

/** XP awarded for each action, so the numbers are always explainable to the learner. */
enum class Award(val amount: Int) {
    CorrectAnswer(10),
    PerfectQuiz(15),
    LessonComplete(25),
}

/** Everything the learner has done, in one immutable snapshot. */
data class ProgressState(
    val completedLessonIds: Set<String> = emptySet(),
    val xp: Int = 0,
    val streak: Int = 0,
    val learnerName: String = "Learner",
    val notificationsEnabled: Boolean = true,
    val soundEnabled: Boolean = true,
    val vocab: Map<String, VocabProgress> = emptyMap(),
)

/**
 * Learner progress: completed lessons, streak, XP and per-word recall history.
 *
 * Mirrors the iOS `ProgressStore` exactly — same XP awards, same level size,
 * same word-strength decay — so one account can be driven from either platform
 * without the numbers disagreeing.
 */
class ProgressStore(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("learndari-progress", Context.MODE_PRIVATE)

    private val json = Json { ignoreUnknownKeys = true }

    private val _state = MutableStateFlow(ProgressState())
    val state: StateFlow<ProgressState> = _state.asStateFlow()

    /** The published lesson path, kept in sync with [ContentRepository]. */
    private val _units = MutableStateFlow(MockData.units)
    val units: StateFlow<List<LearnUnit>> = _units.asStateFlow()

    companion object {
        /** XP needed to move from one level to the next. */
        const val XP_PER_LEVEL = 500

        /**
         * How much of a word's strength fades per day without practice. A
         * starting constant — worth revisiting once there is real usage data.
         */
        const val STRENGTH_DECAY_PER_DAY = 5.0
        const val STRENGTH_GAIN = 15.0
        const val STRENGTH_PENALTY = 20.0

        private const val DAY_MS = 86_400_000.0

        private const val KEY_COMPLETED = "completedLessonIDs"
        private const val KEY_STREAK = "streakDays"
        private const val KEY_NAME = "learnerName"
        private const val KEY_XP = "experiencePoints"
        private const val KEY_NOTIFICATIONS = "notificationsEnabled"
        private const val KEY_SOUND = "soundEnabled"
        private const val KEY_VOCAB = "vocabProgress"
    }

    init {
        val storedCompleted = prefs.getStringSet(KEY_COMPLETED, null)
        val vocab = runCatching {
            prefs.getString(KEY_VOCAB, null)?.let {
                json.decodeFromString<Map<String, VocabProgress>>(it)
            }
        }.getOrNull() ?: emptyMap()

        _state.value = if (storedCompleted.isNullOrEmpty()) {
            // Seed the prototype mid-journey so the path shows all three states.
            val seeded = setOf("u1l1", "u1l2", "u1l3", "u2l1", "u2l2", "u2l3", "u3l1", "u3l2")
            prefs.edit {
                putStringSet(KEY_COMPLETED, seeded)
                putInt(KEY_STREAK, 6)
                putInt(KEY_XP, 640)
            }
            ProgressState(
                completedLessonIds = seeded,
                xp = 640,
                streak = 6,
                learnerName = prefs.getString(KEY_NAME, null) ?: "Learner",
                notificationsEnabled = prefs.getBoolean(KEY_NOTIFICATIONS, true),
                soundEnabled = prefs.getBoolean(KEY_SOUND, true),
                vocab = vocab,
            )
        } else {
            ProgressState(
                completedLessonIds = storedCompleted,
                xp = prefs.getInt(KEY_XP, 0),
                streak = max(prefs.getInt(KEY_STREAK, 1), 1),
                learnerName = prefs.getString(KEY_NAME, null) ?: "Learner",
                notificationsEnabled = prefs.getBoolean(KEY_NOTIFICATIONS, true),
                soundEnabled = prefs.getBoolean(KEY_SOUND, true),
                vocab = vocab,
            )
        }
    }

    fun setUnits(units: List<LearnUnit>) {
        if (units.isNotEmpty()) _units.value = units
    }

    // MARK: - Lesson state

    val orderedLessons: List<Lesson> get() = _units.value.flatMap { it.lessons }

    /** A lesson is unlocked when every lesson before it in the flattened path is complete. */
    fun stateFor(lesson: Lesson): LessonState {
        if (_state.value.completedLessonIds.contains(lesson.id)) return LessonState.Completed
        return if (lesson.id == currentLesson()?.id) LessonState.Current else LessonState.Locked
    }

    fun currentLesson(): Lesson? =
        orderedLessons.firstOrNull { !_state.value.completedLessonIds.contains(it.id) }

    fun lessonById(id: String): Lesson? = orderedLessons.firstOrNull { it.id == id }

    fun unitContaining(lessonId: String): LearnUnit? =
        _units.value.firstOrNull { unit -> unit.lessons.any { it.id == lessonId } }

    // MARK: - Metrics

    val completedLessonCount: Int get() = _state.value.completedLessonIds.size
    val totalLessonCount: Int get() = orderedLessons.size

    /** Distinct vocabulary encountered across every completed lesson. */
    val wordsLearned: Int
        get() = orderedLessons
            .filter { _state.value.completedLessonIds.contains(it.id) }
            .flatMap { it.words }
            .map { it.english.lowercase() }
            .toSet()
            .size

    val level: Int get() = _state.value.xp / XP_PER_LEVEL + 1
    val xpIntoLevel: Int get() = _state.value.xp % XP_PER_LEVEL
    val xpToNextLevel: Int get() = XP_PER_LEVEL - xpIntoLevel
    val levelProgress: Float get() = xpIntoLevel.toFloat() / XP_PER_LEVEL

    val overallProgress: Float
        get() = if (totalLessonCount == 0) 0f else completedLessonCount.toFloat() / totalLessonCount

    // MARK: - XP

    /** Adds XP and persists it. Returns the amount added so callers can animate it. */
    fun award(award: Award, times: Int = 1): Int {
        val amount = award.amount * max(times, 0)
        if (amount <= 0) return 0
        val next = _state.value.xp + amount
        _state.value = _state.value.copy(xp = next)
        prefs.edit { putInt(KEY_XP, next) }
        return amount
    }

    // MARK: - Word strength

    /** Records one answer against a word, moving its strength and streak. */
    fun recordAnswer(wordId: String, correct: Boolean, now: Long = System.currentTimeMillis()) {
        val existing = _state.value.vocab[wordId]
        val base = existing?.let { decayedStrength(it, now) } ?: 0.0
        val strength = if (correct) min(100.0, base + STRENGTH_GAIN) else max(0.0, base - STRENGTH_PENALTY)

        val updated = _state.value.vocab + (
            wordId to VocabProgress(
                vocabItemId = wordId,
                lastSeenAt = now,
                lastCorrect = correct,
                correctStreak = if (correct) (existing?.correctStreak ?: 0) + 1 else 0,
                timesSeen = (existing?.timesSeen ?: 0) + 1,
                strength = strength,
            )
            )

        _state.value = _state.value.copy(vocab = updated)
        persistVocab(updated)
    }

    /** Strength after time decay, or null when the learner has never seen the word. */
    fun effectiveStrength(wordId: String, now: Long = System.currentTimeMillis()): Double? =
        _state.value.vocab[wordId]?.let { decayedStrength(it, now) }

    /**
     * The weakest previously-seen words, for blending review into a new lesson.
     * Words from the lesson being studied are excluded by the caller.
     */
    fun reviewWords(
        pool: List<Word>,
        excluding: Set<String>,
        limit: Int,
        now: Long = System.currentTimeMillis(),
    ): List<Word> {
        if (limit <= 0) return emptyList()
        return pool
            .mapNotNull { word ->
                if (excluding.contains(word.id)) return@mapNotNull null
                effectiveStrength(word.id, now)?.let { word to it }
            }
            .sortedBy { it.second }
            .take(limit)
            .map { it.first }
    }

    private fun decayedStrength(record: VocabProgress, now: Long): Double {
        val days = (now - record.lastSeenAt) / DAY_MS
        if (days <= 0) return record.strength
        return max(0.0, record.strength - days * STRENGTH_DECAY_PER_DAY)
    }

    private fun persistVocab(vocab: Map<String, VocabProgress>) {
        runCatching { prefs.edit { putString(KEY_VOCAB, json.encodeToString(vocab)) } }
    }

    // MARK: - Mutations

    fun completeLesson(lesson: Lesson) {
        if (_state.value.completedLessonIds.contains(lesson.id)) return
        val updated = _state.value.completedLessonIds + lesson.id
        _state.value = _state.value.copy(completedLessonIds = updated)
        prefs.edit { putStringSet(KEY_COMPLETED, updated) }
    }

    fun setLearnerName(name: String) {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) return
        _state.value = _state.value.copy(learnerName = trimmed)
        prefs.edit { putString(KEY_NAME, trimmed) }
    }

    fun setNotificationsEnabled(enabled: Boolean) {
        _state.value = _state.value.copy(notificationsEnabled = enabled)
        prefs.edit { putBoolean(KEY_NOTIFICATIONS, enabled) }
    }

    fun setSoundEnabled(enabled: Boolean) {
        _state.value = _state.value.copy(soundEnabled = enabled)
        prefs.edit { putBoolean(KEY_SOUND, enabled) }
    }

    fun resetProgress() {
        _state.value = _state.value.copy(
            completedLessonIds = emptySet(),
            xp = 0,
            vocab = emptyMap(),
        )
        prefs.edit {
            putStringSet(KEY_COMPLETED, emptySet())
            putInt(KEY_XP, 0)
            remove(KEY_VOCAB)
        }
    }

    /** Full account deletion — the Play equivalent of Apple's 5.1.1(v) requirement. */
    fun deleteAccount() {
        resetProgress()
        _state.value = ProgressState()
        prefs.edit {
            putInt(KEY_STREAK, 0)
            putString(KEY_NAME, "Learner")
            putBoolean(KEY_NOTIFICATIONS, true)
            putBoolean(KEY_SOUND, true)
        }
    }
}
