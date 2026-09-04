package com.rork.learndariandroid.domain

import com.rork.learndariandroid.data.Award
import com.rork.learndariandroid.data.Lesson
import com.rork.learndariandroid.data.ProgressStore
import com.rork.learndariandroid.data.Word
import kotlin.random.Random

/** The three exercise formats a lesson session mixes together. */
enum class ExerciseKind { MultipleChoice, Listening, MatchPairs }

/** Which way round a question is asked. */
enum class PromptDirection { DariToEnglish, EnglishToDari }

/** One slot in the practice queue. The same word appears as several items. */
data class SessionItem(
    val id: String,
    val word: Word,
    val kind: ExerciseKind,
    /** True for words blended in from earlier lessons. */
    val isReview: Boolean,
)

/** A queue item with its answer options resolved, ready to render. */
data class Exercise(
    val id: String,
    val item: SessionItem,
    val direction: PromptDirection,
    /** Four choices for multiple choice and listening; empty for match pairs. */
    val options: List<Word>,
    /** Four words to pair up; empty for the other kinds. */
    val pairs: List<Word>,
) {
    val kind: ExerciseKind get() = item.kind
    val word: Word get() = item.word
    val correctId: String get() = item.word.id
}

/** The whole visible state of a running session. */
data class SessionState(
    val current: Exercise? = null,
    val isFinished: Boolean = false,
    val answeredCount: Int = 0,
    val correctCount: Int = 0,
    val earnedXp: Int = 0,
    val progressFraction: Float = 0f,
    val wordsPractisedCount: Int = 0,
    val isFlawless: Boolean = false,
)

/**
 * Drives one lesson practice session: builds the queue, hands out exercises,
 * requeues anything the learner gets wrong and tracks the running score.
 *
 * Sessions are deliberately not persisted — leaving mid-way and coming back
 * starts a fresh session, which keeps the model simple.
 *
 * A direct port of the iOS `LessonSession`, tuning constants included.
 */
class LessonSession(
    private val lesson: Lesson,
    /** Words from the same unit, the preferred distractor source. */
    private val milestoneWords: List<Word>,
    /** Every other word in the curriculum, for distractors and review. */
    private val corpus: List<Word>,
    private val progress: ProgressStore,
) {
    companion object {
        /** Every new word is tested at least this many times. */
        private const val REPEATS_PER_WORD = 2

        /** Match pairs needs a full grid, so short lessons skip it. */
        private const val WORDS_PER_MATCH = 4

        /** More than a couple of match grids per session starts to drag. */
        private const val MAX_MATCH_SLOTS = 2

        private val REVIEW_RANGE = 2..4

        /**
         * A missed word comes back this far down the queue — far enough that the
         * learner has to recall it rather than echo the answer they just saw.
         */
        private val REQUEUE_RANGE = 3..5
    }

    private val queue = mutableListOf<SessionItem>()
    private var clearedCount = 0
    private val misses = mutableMapOf<String, Int>()
    private val practisedWordIds = mutableSetOf<String>()

    private var current: Exercise? = null
    private var isFinished = false
    private var answeredCount = 0
    private var correctCount = 0
    private var earnedXp = 0

    init {
        buildQueue()
        advance()
    }

    fun snapshot(): SessionState = SessionState(
        current = current,
        isFinished = isFinished,
        answeredCount = answeredCount,
        correctCount = correctCount,
        earnedXp = earnedXp,
        progressFraction = progressFraction(),
        wordsPractisedCount = practisedWordIds.size,
        isFlawless = answeredCount > 0 && correctCount == answeredCount,
    )

    /**
     * Fraction of the session cleared. The denominator grows when an answer is
     * missed, so the bar eases back rather than jumping — as it should.
     */
    private fun progressFraction(): Float {
        val total = clearedCount + queue.size
        if (total <= 0) return 1f
        return clearedCount.toFloat() / total
    }

    val accuracy: Float
        get() = if (answeredCount == 0) 0f else correctCount.toFloat() / answeredCount

    // MARK: - Answering

    /** Records the answer to the current multiple choice or listening exercise. */
    fun submit(correct: Boolean) {
        val exercise = current ?: return
        if (queue.isEmpty()) return
        register(exercise.word, correct)

        var item = queue.removeAt(0)
        if (correct) {
            clearedCount += 1
        } else {
            // Third time unlucky: drop to multiple choice so the correct answer
            // can actually land before the session ends.
            if ((misses[item.word.id] ?: 0) >= 2) {
                item = item.copy(kind = ExerciseKind.MultipleChoice)
            }
            val offset = minOf(queue.size, Random.nextInt(REQUEUE_RANGE.first, REQUEUE_RANGE.last + 1))
            queue.add(offset, item)
        }
        advance()
    }

    /**
     * Records a finished match-pairs grid. Words paired without a mistake also
     * clear one pending queue slot.
     */
    fun submitMatch(firstTryCorrect: Set<String>, missed: Set<String>) {
        val exercise = current ?: return
        if (queue.isEmpty()) return

        exercise.pairs.filter { !missed.contains(it.id) }.forEach { register(it, true) }
        exercise.pairs.filter { missed.contains(it.id) }.forEach { register(it, false) }

        queue.removeAt(0)
        clearedCount += 1

        for (wordId in firstTryCorrect) {
            val index = queue.indexOfFirst { it.word.id == wordId }
            if (index < 0) continue
            queue.removeAt(index)
            clearedCount += 1
        }
        advance()
    }

    private fun register(word: Word, correct: Boolean) {
        practisedWordIds.add(word.id)
        answeredCount += 1
        if (correct) {
            correctCount += 1
            earnedXp += progress.award(Award.CorrectAnswer)
        } else {
            misses[word.id] = (misses[word.id] ?: 0) + 1
        }
        progress.recordAnswer(word.id, correct)
    }

    private fun advance() {
        val next = queue.firstOrNull()
        if (next == null) {
            if (answeredCount > 0 && correctCount == answeredCount) {
                earnedXp += progress.award(Award.PerfectQuiz)
            }
            current = null
            isFinished = true
            return
        }
        current = makeExercise(next)
    }

    // MARK: - Queue construction

    private fun buildQueue() {
        val newWords = lesson.words
        if (newWords.isEmpty()) return

        val canMatch = newWords.size >= WORDS_PER_MATCH
        var matchSlots = if (canMatch) MAX_MATCH_SLOTS else 0
        val items = mutableListOf<SessionItem>()

        // Each word gets one multiple choice plus one other format, which lands
        // close to the intended 50 / 25 / 25 split while keeping variety per word.
        newWords.forEachIndexed { offset, word ->
            items.add(
                SessionItem("${word.id}-mc", word, ExerciseKind.MultipleChoice, isReview = false),
            )

            val wantsMatch = canMatch && matchSlots > 0 && offset % 2 == 0
            if (wantsMatch) matchSlots -= 1
            items.add(
                SessionItem(
                    id = "${word.id}-alt",
                    word = word,
                    kind = if (wantsMatch) ExerciseKind.MatchPairs else ExerciseKind.Listening,
                    isReview = false,
                ),
            )
        }

        items.addAll(reviewItems(newWords.size * REPEATS_PER_WORD))
        queue.addAll(items.shuffled())
    }

    /**
     * Weakest previously-seen words from earlier lessons, roughly a quarter of
     * the queue. Review never uses match pairs — it stays one word at a time.
     */
    private fun reviewItems(queueSize: Int): List<SessionItem> {
        val target = minOf(
            REVIEW_RANGE.last,
            maxOf(REVIEW_RANGE.first, Math.round(queueSize * 0.25).toInt()),
        )
        val lessonIds = lesson.words.map { it.id }.toSet()
        val candidates = progress.reviewWords(corpus, lessonIds, target)

        return candidates.mapIndexed { offset, word ->
            SessionItem(
                id = "${word.id}-review-$offset",
                word = word,
                kind = if (offset % 2 == 0) ExerciseKind.MultipleChoice else ExerciseKind.Listening,
                isReview = true,
            )
        }
    }

    // MARK: - Exercise assembly

    private fun makeExercise(item: SessionItem): Exercise {
        val instanceId = "${item.id}-$clearedCount-$answeredCount"

        return when (item.kind) {
            ExerciseKind.MatchPairs -> Exercise(
                id = instanceId,
                item = item,
                direction = PromptDirection.DariToEnglish,
                options = emptyList(),
                pairs = matchGroup(item.word),
            )
            // Listening always asks for the meaning, so the task never changes
            // shape while the audio is playing.
            ExerciseKind.Listening -> Exercise(
                id = instanceId,
                item = item,
                direction = PromptDirection.DariToEnglish,
                options = options(item.word),
                pairs = emptyList(),
            )
            ExerciseKind.MultipleChoice -> Exercise(
                id = instanceId,
                item = item,
                direction = if (Random.nextBoolean()) {
                    PromptDirection.DariToEnglish
                } else {
                    PromptDirection.EnglishToDari
                },
                options = options(item.word),
                pairs = emptyList(),
            )
        }
    }

    /**
     * The correct word plus three distractors, preferring words the learner is
     * already working with so the choice is a real discrimination test.
     */
    private fun options(word: Word): List<Word> {
        val chosen = mutableListOf(word)
        val tiers = listOf(lesson.words, milestoneWords, corpus)

        for (tier in tiers) {
            if (chosen.size >= 4) break
            for (candidate in tier.shuffled()) {
                if (chosen.size >= 4) break
                val clashes = chosen.any {
                    it.id == candidate.id ||
                        it.english == candidate.english ||
                        it.dari == candidate.dari
                }
                if (!clashes) chosen.add(candidate)
            }
        }
        return chosen.shuffled()
    }

    /**
     * Four words for a grid: the queued word plus others from this lesson,
     * favouring ones already drilled so the grid reinforces rather than surprises.
     */
    private fun matchGroup(word: Word): List<Word> {
        val group = mutableListOf(word)
        val others = lesson.words.filter { it.id != word.id }
        val drilled = others.filter { practisedWordIds.contains(it.id) }.shuffled()
        val fresh = others.filter { !practisedWordIds.contains(it.id) }.shuffled()

        for (candidate in drilled + fresh) {
            if (group.size >= WORDS_PER_MATCH) break
            group.add(candidate)
        }
        return group.shuffled()
    }
}
