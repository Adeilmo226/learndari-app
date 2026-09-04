package com.rork.learndariandroid.data

import kotlinx.serialization.Serializable

/** A single vocabulary entry: English, Dari script and phonetic transliteration. */
@Serializable
data class Word(
    val id: String,
    val english: String,
    val dari: String,
    val phonetic: String,
    val category: String? = null,
    /** Key of a human recording on the backend. Null means speech synthesis is used. */
    val audioKey: String? = null,
    /** Optional sentence showing the word in use, taught during the lesson intro. */
    val exampleDari: String? = null,
    val exampleEnglish: String? = null,
) {
    /** True when both halves of the example sentence are present. */
    val hasExample: Boolean
        get() = !exampleDari.isNullOrEmpty() && !exampleEnglish.isNullOrEmpty()
}

/** A themed collection of words shown on the Vocab tab. */
@Serializable
data class VocabSet(
    val id: String,
    val emoji: String,
    val name: String,
    val summary: String,
    val words: List<Word>,
) {
    val wordCount: Int get() = words.size
}

enum class LessonState { Completed, Current, Locked }

/** One node on the Learn path. */
@Serializable
data class Lesson(
    val id: String,
    val title: String,
    val subtitle: String,
    val words: List<Word>,
)

/** A group of lessons on the Learn path. */
@Serializable
data class LearnUnit(
    val id: String,
    val index: Int,
    val title: String,
    val lessons: List<Lesson>,
)

@Serializable
data class Proverb(
    val id: String,
    val english: String,
    val dari: String,
    val phonetic: String,
    val meaning: String,
    val category: String,
    val audioKey: String? = null,
)

/** A word pinned to a calendar date in the Studio. */
@Serializable
data class ScheduledWord(
    /** ISO date, `yyyy-MM-dd`. */
    val date: String,
    val word: Word,
)

/** Everything the app renders, as published by the Studio. */
@Serializable
data class ContentDocument(
    val vocabSets: List<VocabSet> = emptyList(),
    val units: List<LearnUnit> = emptyList(),
    val proverbs: List<Proverb> = emptyList(),
    val popularWords: List<Word> = emptyList(),
    val phrases: List<Word> = emptyList(),
    val wordOfTheDaySchedule: List<ScheduledWord> = emptyList(),
)

/** Server response wrapper — the version lets the app tell fresh content from stale. */
@Serializable
data class ContentEnvelope(
    val version: Int = 0,
    val updatedAt: Double = 0.0,
    val content: ContentDocument,
)

/**
 * How well the learner knows one word.
 *
 * `strength` is deliberately a single 0–100 score rather than a full spaced
 * repetition schedule: it climbs on correct answers, drops on mistakes and
 * fades with time, which is enough to decide what deserves review.
 */
@Serializable
data class VocabProgress(
    val vocabItemId: String,
    /** Epoch milliseconds. */
    val lastSeenAt: Long,
    val lastCorrect: Boolean,
    /** Consecutive correct answers, carried across sessions. */
    val correctStreak: Int,
    val timesSeen: Int,
    /** Stored strength, 0–100, before time decay is applied. */
    val strength: Double,
)
