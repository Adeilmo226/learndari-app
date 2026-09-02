import Foundation

/// The account-portable form of a learner's progress.
///
/// Field names and units match the website's record exactly (timestamps are
/// epoch milliseconds, not `Date`), so one account can be driven from either
/// surface without translation on the server.
nonisolated struct ProgressSnapshot: Codable, Sendable {
    var completedLessonIds: [String]
    var xp: Int
    var streak: Int
    /// ISO date, YYYY-MM-DD.
    var lastActiveDate: String
    var vocab: [String: VocabSnapshot]

    static let empty = ProgressSnapshot(
        completedLessonIds: [],
        xp: 0,
        streak: 0,
        lastActiveDate: "",
        vocab: [:]
    )
}

nonisolated struct VocabSnapshot: Codable, Sendable {
    var vocabItemId: String
    /// Epoch milliseconds.
    var lastSeenAt: Double
    var lastCorrect: Bool
    var correctStreak: Int
    var timesSeen: Int
    var strength: Double
}

extension ProgressSnapshot {
    /// Combines two records without losing anything.
    ///
    /// A learner may have practised on their phone and in a browser since the
    /// last sync, so this takes the best of both rather than picking a winner:
    /// lessons are unioned, counters take the higher value, and each word keeps
    /// whichever record was touched most recently.
    func merged(with other: ProgressSnapshot) -> ProgressSnapshot {
        var vocab = self.vocab
        for (wordID, record) in other.vocab {
            if let existing = vocab[wordID], existing.lastSeenAt >= record.lastSeenAt { continue }
            vocab[wordID] = record
        }

        return ProgressSnapshot(
            completedLessonIds: Array(Set(completedLessonIds).union(other.completedLessonIds)),
            xp: max(xp, other.xp),
            streak: max(streak, other.streak),
            lastActiveDate: max(lastActiveDate, other.lastActiveDate),
            vocab: vocab
        )
    }

    var isEmpty: Bool {
        xp == 0 && completedLessonIds.isEmpty && vocab.isEmpty
    }
}
