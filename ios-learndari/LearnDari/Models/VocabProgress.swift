import Foundation

/// How well the learner knows one word.
///
/// `strength` is deliberately a single 0–100 score rather than a full spaced
/// repetition schedule: it climbs on correct answers, drops on mistakes and
/// fades with time, which is enough to decide what deserves review.
nonisolated struct VocabProgress: Hashable, Sendable, Codable {
    let vocabItemID: String
    var lastSeenAt: Date
    var lastCorrect: Bool
    /// Consecutive correct answers, carried across sessions.
    var correctStreak: Int
    var timesSeen: Int
    /// Stored strength, 0–100, before time decay is applied.
    var strength: Double
}
