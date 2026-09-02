import Foundation
import Observation

/// Learner progress: completed lessons, streak, words learned and subscription tier.
/// Persisted locally for the prototype; moves to the backend later.
@Observable
final class ProgressStore {
    private enum Keys {
        static let completed = "completedLessonIDs"
        static let streak = "streakDays"
        static let name = "learnerName"
        static let xp = "experiencePoints"
        static let subscribed = "isSubscribed"
        static let notifications = "notificationsEnabled"
        static let vocab = "vocabProgress"
    }

    private let defaults = UserDefaults.standard

    /// The published lesson path. Kept in sync with `ContentService` by the app
    /// entry point so progress always reflects the live curriculum.
    var units: [LearnUnit] = MockData.units

    private(set) var completedLessonIDs: Set<String>
    private(set) var streak: Int
    private(set) var xp: Int

    /// XP awarded for each action, so the numbers are always explainable to the learner.
    enum Award: Int {
        case correctAnswer = 10
        case perfectQuiz = 15
        case lessonComplete = 25
    }

    /// XP needed to move from one level to the next.
    static let xpPerLevel: Int = 500

    // MARK: - Word strength tuning

    /// How much of a word's strength fades per day without practice. A starting
    /// constant — worth revisiting once there is real usage data.
    static let strengthDecayPerDay: Double = 5
    static let strengthGain: Double = 15
    static let strengthPenalty: Double = 20

    /// Per-word recall history, used to resurface weak vocabulary in later lessons.
    private(set) var vocabProgress: [String: VocabProgress] = [:]

    var learnerName: String {
        didSet { defaults.set(learnerName, forKey: Keys.name) }
    }

    var isSubscribed: Bool {
        didSet { defaults.set(isSubscribed, forKey: Keys.subscribed) }
    }

    var notificationsEnabled: Bool {
        didSet { defaults.set(notificationsEnabled, forKey: Keys.notifications) }
    }

    init() {
        let stored = defaults.array(forKey: Keys.completed) as? [String] ?? []
        if stored.isEmpty {
            // Seed the prototype mid-journey so the path shows all three states.
            let seeded: Set<String> = ["u1l1", "u1l2", "u1l3", "u2l1", "u2l2", "u2l3", "u3l1", "u3l2"]
            completedLessonIDs = seeded
            streak = 6
            xp = 640
            defaults.set(Array(seeded), forKey: Keys.completed)
            defaults.set(6, forKey: Keys.streak)
            defaults.set(640, forKey: Keys.xp)
        } else {
            completedLessonIDs = Set(stored)
            streak = max(defaults.integer(forKey: Keys.streak), 1)
            xp = defaults.integer(forKey: Keys.xp)
        }
        if let data = defaults.data(forKey: Keys.vocab),
           let decoded = try? JSONDecoder().decode([String: VocabProgress].self, from: data) {
            vocabProgress = decoded
        }
        learnerName = defaults.string(forKey: Keys.name) ?? "Learner"
        isSubscribed = defaults.bool(forKey: Keys.subscribed)
        notificationsEnabled = defaults.object(forKey: Keys.notifications) as? Bool ?? true
    }

    // MARK: - Lesson state

    /// A lesson is unlocked when every lesson before it in the flattened path is complete.
    func state(for lesson: Lesson) -> LessonState {
        if completedLessonIDs.contains(lesson.id) { return .completed }
        return lesson.id == currentLesson?.id ? .current : .locked
    }

    var orderedLessons: [Lesson] {
        units.flatMap(\.lessons)
    }

    var currentLesson: Lesson? {
        orderedLessons.first { !completedLessonIDs.contains($0.id) }
    }

    var currentUnit: LearnUnit? {
        guard let currentLesson else { return units.last }
        return units.first { unit in
            unit.lessons.contains { $0.id == currentLesson.id }
        }
    }

    // MARK: - Metrics

    var completedLessonCount: Int {
        completedLessonIDs.count
    }

    var totalLessonCount: Int {
        orderedLessons.count
    }

    /// Distinct vocabulary encountered across every completed lesson.
    var wordsLearned: Int {
        let learned = orderedLessons
            .filter { completedLessonIDs.contains($0.id) }
            .flatMap(\.words)
            .map { $0.english.lowercased() }
        return Set(learned).count
    }

    // MARK: - XP

    var level: Int {
        xp / Self.xpPerLevel + 1
    }

    var xpIntoLevel: Int {
        xp % Self.xpPerLevel
    }

    var xpToNextLevel: Int {
        Self.xpPerLevel - xpIntoLevel
    }

    var levelProgress: Double {
        Double(xpIntoLevel) / Double(Self.xpPerLevel)
    }

    /// Adds XP and persists it. Returns the amount added so callers can animate it.
    @discardableResult
    func award(_ award: Award, times multiplier: Int = 1) -> Int {
        let amount = award.rawValue * max(multiplier, 0)
        guard amount > 0 else { return 0 }
        xp += amount
        defaults.set(xp, forKey: Keys.xp)
        return amount
    }

    // MARK: - Word strength

    /// Records one answer against a word, moving its strength and streak.
    func recordAnswer(wordID: String, correct: Bool, now: Date = .now) {
        let existing = vocabProgress[wordID]
        let base = existing.map { decayedStrength(of: $0, now: now) } ?? 0
        let strength = correct
            ? min(100, base + Self.strengthGain)
            : max(0, base - Self.strengthPenalty)

        vocabProgress[wordID] = VocabProgress(
            vocabItemID: wordID,
            lastSeenAt: now,
            lastCorrect: correct,
            correctStreak: correct ? (existing?.correctStreak ?? 0) + 1 : 0,
            timesSeen: (existing?.timesSeen ?? 0) + 1,
            strength: strength
        )
        persistVocabProgress()
    }

    /// Strength after time decay, or nil when the learner has never seen the word.
    func effectiveStrength(for wordID: String, now: Date = .now) -> Double? {
        guard let record = vocabProgress[wordID] else { return nil }
        return decayedStrength(of: record, now: now)
    }

    /// The weakest previously-seen words, for blending review into a new lesson.
    /// Words from the lesson being studied are excluded by the caller.
    func reviewWords(from pool: [Word], excluding excluded: Set<String>, limit: Int, now: Date = .now) -> [Word] {
        guard limit > 0 else { return [] }

        let seen = pool.compactMap { word -> (word: Word, strength: Double)? in
            guard !excluded.contains(word.id),
                  let strength = effectiveStrength(for: word.id, now: now) else { return nil }
            return (word, strength)
        }

        return seen
            .sorted { $0.strength < $1.strength }
            .prefix(limit)
            .map(\.word)
    }

    private func decayedStrength(of record: VocabProgress, now: Date) -> Double {
        let days = now.timeIntervalSince(record.lastSeenAt) / 86_400
        guard days > 0 else { return record.strength }
        return max(0, record.strength - days * Self.strengthDecayPerDay)
    }

    private func persistVocabProgress() {
        guard let data = try? JSONEncoder().encode(vocabProgress) else { return }
        defaults.set(data, forKey: Keys.vocab)
    }

    // MARK: - Account sync

    /// The account-portable form of everything the learner has done.
    var snapshot: ProgressSnapshot {
        var vocab: [String: VocabSnapshot] = [:]
        for (wordID, record) in vocabProgress {
            vocab[wordID] = VocabSnapshot(
                vocabItemId: record.vocabItemID,
                lastSeenAt: record.lastSeenAt.timeIntervalSince1970 * 1000,
                lastCorrect: record.lastCorrect,
                correctStreak: record.correctStreak,
                timesSeen: record.timesSeen,
                strength: record.strength
            )
        }

        return ProgressSnapshot(
            completedLessonIds: Array(completedLessonIDs),
            xp: xp,
            streak: streak,
            lastActiveDate: Self.isoDay.string(from: lastActiveDate ?? Date()),
            vocab: vocab
        )
    }

    /// Replaces local state with an account's record, after merging.
    func apply(_ snapshot: ProgressSnapshot) {
        completedLessonIDs = Set(snapshot.completedLessonIds)
        xp = snapshot.xp
        streak = snapshot.streak

        var restored: [String: VocabProgress] = [:]
        for (wordID, record) in snapshot.vocab {
            restored[wordID] = VocabProgress(
                vocabItemID: record.vocabItemId,
                lastSeenAt: Date(timeIntervalSince1970: record.lastSeenAt / 1000),
                lastCorrect: record.lastCorrect,
                correctStreak: record.correctStreak,
                timesSeen: record.timesSeen,
                strength: record.strength
            )
        }
        vocabProgress = restored

        defaults.set(Array(completedLessonIDs), forKey: Keys.completed)
        defaults.set(xp, forKey: Keys.xp)
        defaults.set(streak, forKey: Keys.streak)
        persistVocabProgress()
    }

    private static let isoDay: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()

    /// The most recent day any word was practised, used for streak merging.
    private var lastActiveDate: Date? {
        vocabProgress.values.map(\.lastSeenAt).max()
    }

    var overallProgress: Double {
        guard totalLessonCount > 0 else { return 0 }
        return Double(completedLessonCount) / Double(totalLessonCount)
    }

    func complete(lesson: Lesson) {
        guard !completedLessonIDs.contains(lesson.id) else { return }
        completedLessonIDs.insert(lesson.id)
        defaults.set(Array(completedLessonIDs), forKey: Keys.completed)
    }

    // MARK: - Account

    func resetProgress() {
        completedLessonIDs = []
        xp = 0
        vocabProgress = [:]
        defaults.set([String](), forKey: Keys.completed)
        defaults.set(0, forKey: Keys.xp)
        defaults.removeObject(forKey: Keys.vocab)
    }

    /// Full account deletion — required by App Store review guideline 5.1.1(v).
    func deleteAccount() {
        resetProgress()
        streak = 0
        learnerName = "Learner"
        isSubscribed = false
        notificationsEnabled = true
        defaults.set(0, forKey: Keys.streak)
    }
}
