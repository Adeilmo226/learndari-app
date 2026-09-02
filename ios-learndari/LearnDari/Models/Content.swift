import Foundation

/// A single vocabulary entry: English, Dari script and phonetic transliteration.
nonisolated struct Word: Identifiable, Hashable, Sendable, Codable {
    let id: String
    let english: String
    let dari: String
    let phonetic: String
    var category: String?
    /// Key of a human recording on the backend. Nil means speech synthesis is used.
    var audioKey: String?
    /// Optional sentence showing the word in use, taught during the lesson intro.
    var exampleDari: String?
    var exampleEnglish: String?

    /// True when both halves of the example sentence are present.
    var hasExample: Bool {
        guard let exampleDari, let exampleEnglish else { return false }
        return !exampleDari.isEmpty && !exampleEnglish.isEmpty
    }

    init(
        id: String = UUID().uuidString,
        english: String,
        dari: String,
        phonetic: String,
        category: String? = nil,
        audioKey: String? = nil,
        exampleDari: String? = nil,
        exampleEnglish: String? = nil
    ) {
        self.id = id
        self.english = english
        self.dari = dari
        self.phonetic = phonetic
        self.category = category
        self.audioKey = audioKey
        self.exampleDari = exampleDari
        self.exampleEnglish = exampleEnglish
    }
}

/// A themed collection of words shown on the Vocab tab.
nonisolated struct VocabSet: Identifiable, Hashable, Sendable, Codable {
    let id: String
    let emoji: String
    let name: String
    let summary: String
    let words: [Word]

    var wordCount: Int { words.count }
}

nonisolated enum LessonState: Sendable {
    case completed
    case current
    case locked
}

/// One node on the Learn path.
nonisolated struct Lesson: Identifiable, Hashable, Sendable, Codable {
    let id: String
    let title: String
    let subtitle: String
    let words: [Word]
}

/// A group of lessons on the Learn path.
nonisolated struct LearnUnit: Identifiable, Hashable, Sendable, Codable {
    let id: String
    let index: Int
    let title: String
    let lessons: [Lesson]
}

nonisolated struct Proverb: Identifiable, Hashable, Sendable, Codable {
    let id: String
    let english: String
    let dari: String
    let phonetic: String
    let meaning: String
    let category: String
    var audioKey: String?
}

nonisolated struct CultureEntry: Identifiable, Hashable, Sendable {
    let id: String
    let emoji: String
    let title: String
    let summary: String
    let body: String
}

/// A word pinned to a calendar date in the Studio.
nonisolated struct ScheduledWord: Hashable, Sendable, Codable {
    /// ISO date, `yyyy-MM-dd`.
    let date: String
    let word: Word
}

/// Everything the app renders, as published by the Studio.
nonisolated struct ContentDocument: Hashable, Sendable, Codable {
    var vocabSets: [VocabSet]
    var units: [LearnUnit]
    var proverbs: [Proverb]
    var popularWords: [Word]
    var phrases: [Word]
    var wordOfTheDaySchedule: [ScheduledWord]
}

/// Server response wrapper — the version lets the app tell fresh content from stale.
nonisolated struct ContentEnvelope: Sendable, Codable {
    let version: Int
    let updatedAt: Double
    let content: ContentDocument
}
