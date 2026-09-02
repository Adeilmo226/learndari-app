import Foundation
import Observation

/// The three exercise formats a lesson session mixes together.
nonisolated enum ExerciseKind: String, Hashable, Sendable, Codable {
    case multipleChoice
    case listening
    case matchPairs
}

/// Which way round a question is asked.
nonisolated enum PromptDirection: Hashable, Sendable {
    case dariToEnglish
    case englishToDari
}

/// One slot in the practice queue. The same word appears as several items.
nonisolated struct SessionItem: Identifiable, Hashable, Sendable {
    let id: String
    let word: Word
    var kind: ExerciseKind
    /// True for words blended in from earlier lessons.
    let isReview: Bool
}

/// A queue item with its answer options resolved, ready to render.
nonisolated struct Exercise: Identifiable, Sendable {
    let id: String
    let item: SessionItem
    let direction: PromptDirection
    /// Four choices for multiple choice and listening; empty for match pairs.
    let options: [Word]
    /// Four words to pair up; empty for the other kinds.
    let pairs: [Word]

    var kind: ExerciseKind { item.kind }
    var word: Word { item.word }
    var correctID: String { item.word.id }
}

/// Drives one lesson practice session: builds the queue, hands out exercises,
/// requeues anything the learner gets wrong and tracks the running score.
///
/// Sessions are deliberately not persisted — leaving mid-way and coming back
/// starts a fresh session, which keeps the model simple.
@Observable
final class LessonSession {
    /// Every new word is tested at least this many times.
    private static let repeatsPerWord: Int = 2
    /// Match pairs needs a full grid, so short lessons skip it.
    private static let wordsPerMatch: Int = 4
    /// More than a couple of match grids per session starts to drag.
    private static let maxMatchSlots: Int = 2
    private static let reviewRange: ClosedRange<Int> = 2...4
    /// A missed word comes back this far down the queue — far enough that the
    /// learner has to recall it rather than echo the answer they just saw.
    private static let requeueRange: ClosedRange<Int> = 3...5

    let lesson: Lesson

    private(set) var current: Exercise?
    private(set) var isFinished: Bool = false
    private(set) var answeredCount: Int = 0
    private(set) var correctCount: Int = 0
    private(set) var earnedXP: Int = 0

    private var queue: [SessionItem] = []
    private var clearedCount: Int = 0
    private var misses: [String: Int] = [:]
    private var practisedWordIDs: Set<String> = []

    private let milestoneWords: [Word]
    private let corpus: [Word]
    private let progress: ProgressStore

    /// - Parameters:
    ///   - milestoneWords: words from the same unit, the preferred distractor source.
    ///   - corpus: every other word in the curriculum, for distractors and review.
    init(lesson: Lesson, milestoneWords: [Word], corpus: [Word], progress: ProgressStore) {
        self.lesson = lesson
        self.milestoneWords = milestoneWords
        self.corpus = corpus
        self.progress = progress
        buildQueue()
        advance()
    }

    // MARK: - Progress

    /// Fraction of the session cleared. The denominator grows when an answer is
    /// missed, so the bar eases back rather than jumping — as it should.
    var progressFraction: Double {
        let total = clearedCount + queue.count
        guard total > 0 else { return 1 }
        return Double(clearedCount) / Double(total)
    }

    var accuracy: Double {
        guard answeredCount > 0 else { return 0 }
        return Double(correctCount) / Double(answeredCount)
    }

    var wordsPractisedCount: Int { practisedWordIDs.count }

    var isFlawless: Bool { answeredCount > 0 && correctCount == answeredCount }

    // MARK: - Answering

    /// Records the answer to the current multiple choice or listening exercise.
    func submit(correct: Bool) {
        guard let exercise = current, !queue.isEmpty else { return }
        register(word: exercise.word, correct: correct)

        var item = queue.removeFirst()
        if correct {
            clearedCount += 1
        } else {
            // Third time unlucky: drop to multiple choice so the correct answer
            // can actually land before the session ends.
            if misses[item.word.id, default: 0] >= 2 {
                item.kind = .multipleChoice
            }
            let offset = min(queue.count, Int.random(in: Self.requeueRange))
            queue.insert(item, at: offset)
        }
        advance()
    }

    /// Records a finished match-pairs grid.
    /// Words paired without a mistake also clear one pending queue slot.
    func submitMatch(firstTryCorrect: Set<String>, missed: Set<String>) {
        guard current != nil, !queue.isEmpty else { return }

        for word in current?.pairs ?? [] where !missed.contains(word.id) {
            register(word: word, correct: true)
        }
        for word in (current?.pairs ?? []).filter({ missed.contains($0.id) }) {
            register(word: word, correct: false)
        }

        queue.removeFirst()
        clearedCount += 1

        for wordID in firstTryCorrect {
            guard let index = queue.firstIndex(where: { $0.word.id == wordID }) else { continue }
            queue.remove(at: index)
            clearedCount += 1
        }
        advance()
    }

    private func register(word: Word, correct: Bool) {
        practisedWordIDs.insert(word.id)
        answeredCount += 1
        if correct {
            correctCount += 1
            earnedXP += progress.award(.correctAnswer)
        } else {
            misses[word.id, default: 0] += 1
        }
        progress.recordAnswer(wordID: word.id, correct: correct)
    }

    private func advance() {
        guard let next = queue.first else {
            if isFlawless { earnedXP += progress.award(.perfectQuiz) }
            current = nil
            isFinished = true
            return
        }
        current = makeExercise(for: next)
    }

    // MARK: - Queue construction

    private func buildQueue() {
        let newWords = lesson.words
        guard !newWords.isEmpty else { return }

        let canMatch = newWords.count >= Self.wordsPerMatch
        var matchSlots = canMatch ? Self.maxMatchSlots : 0
        var items: [SessionItem] = []

        // Each word gets one multiple choice plus one other format, which lands
        // close to the intended 50 / 25 / 25 split while keeping variety per word.
        for (offset, word) in newWords.enumerated() {
            items.append(SessionItem(id: "\(word.id)-mc", word: word, kind: .multipleChoice, isReview: false))

            let wantsMatch = canMatch && matchSlots > 0 && offset.isMultiple(of: 2)
            if wantsMatch { matchSlots -= 1 }
            items.append(
                SessionItem(
                    id: "\(word.id)-alt",
                    word: word,
                    kind: wantsMatch ? .matchPairs : .listening,
                    isReview: false
                )
            )
        }

        items.append(contentsOf: reviewItems(queueSize: newWords.count * Self.repeatsPerWord))
        queue = items.shuffled()
    }

    /// Weakest previously-seen words from earlier lessons, roughly a quarter of
    /// the queue. Review never uses match pairs — it stays one word at a time.
    private func reviewItems(queueSize: Int) -> [SessionItem] {
        let target = min(
            Self.reviewRange.upperBound,
            max(Self.reviewRange.lowerBound, Int((Double(queueSize) * 0.25).rounded()))
        )
        let lessonIDs = Set(lesson.words.map(\.id))
        let candidates = progress.reviewWords(from: corpus, excluding: lessonIDs, limit: target)

        return candidates.enumerated().map { offset, word in
            SessionItem(
                id: "\(word.id)-review-\(offset)",
                word: word,
                kind: offset.isMultiple(of: 2) ? .multipleChoice : .listening,
                isReview: true
            )
        }
    }

    // MARK: - Exercise assembly

    private func makeExercise(for item: SessionItem) -> Exercise {
        let instanceID = "\(item.id)-\(clearedCount)-\(answeredCount)"

        switch item.kind {
        case .matchPairs:
            return Exercise(
                id: instanceID,
                item: item,
                direction: .dariToEnglish,
                options: [],
                pairs: matchGroup(around: item.word)
            )
        case .listening:
            // Listening always asks for the meaning, so the task never changes
            // shape while the audio is playing.
            return Exercise(
                id: instanceID,
                item: item,
                direction: .dariToEnglish,
                options: options(for: item.word),
                pairs: []
            )
        case .multipleChoice:
            return Exercise(
                id: instanceID,
                item: item,
                direction: Bool.random() ? .dariToEnglish : .englishToDari,
                options: options(for: item.word),
                pairs: []
            )
        }
    }

    /// The correct word plus three distractors, preferring words the learner is
    /// already working with so the choice is a real discrimination test.
    private func options(for word: Word) -> [Word] {
        var chosen: [Word] = [word]
        let tiers = [lesson.words, milestoneWords, corpus]

        for tier in tiers where chosen.count < 4 {
            for candidate in tier.shuffled() where chosen.count < 4 {
                let clashes = chosen.contains {
                    $0.id == candidate.id || $0.english == candidate.english || $0.dari == candidate.dari
                }
                if !clashes { chosen.append(candidate) }
            }
        }
        return chosen.shuffled()
    }

    /// Four words for a grid: the queued word plus others from this lesson,
    /// favouring ones already drilled so the grid reinforces rather than surprises.
    private func matchGroup(around word: Word) -> [Word] {
        var group: [Word] = [word]
        let others = lesson.words.filter { $0.id != word.id }
        let drilled = others.filter { practisedWordIDs.contains($0.id) }.shuffled()
        let fresh = others.filter { !practisedWordIDs.contains($0.id) }.shuffled()

        for candidate in drilled + fresh where group.count < Self.wordsPerMatch {
            group.append(candidate)
        }
        return group.shuffled()
    }
}
