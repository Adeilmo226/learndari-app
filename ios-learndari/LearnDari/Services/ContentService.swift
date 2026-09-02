import Foundation
import Observation

/// Live content for the app.
///
/// Three layers, in order of preference:
/// 1. the last document downloaded from the backend (cached on disk),
/// 2. the copy bundled with the app (`MockData`) for a brand-new install,
/// 3. a background refresh that quietly replaces the above when it lands.
///
/// The app therefore never shows a loading spinner and never goes blank offline.
@Observable
final class ContentService {
    private(set) var document: ContentDocument
    private(set) var version: Int
    private(set) var lastRefreshedAt: Date?
    private(set) var isRefreshing: Bool = false

    private let cacheURL: URL? = {
        let directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        return directory?.appendingPathComponent("learndari-content.json")
    }()

    private var backendBaseURL: URL? {
        let raw = Config.EXPO_PUBLIC_RORK_FUNCTIONS_URL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !raw.isEmpty, let url = URL(string: raw) else { return nil }
        return url
    }

    init() {
        if let cached = Self.loadCachedEnvelope() {
            document = cached.content
            version = cached.version
            lastRefreshedAt = Date(timeIntervalSince1970: cached.updatedAt / 1000)
        } else {
            document = MockData.bundledDocument
            version = 0
        }
    }

    // MARK: - Derived content

    var vocabSets: [VocabSet] { document.vocabSets }
    var units: [LearnUnit] { document.units }
    var proverbs: [Proverb] { document.proverbs }
    var popularWords: [Word] { document.popularWords }
    var phrases: [Word] { document.phrases }

    /// Today's scheduled word, or a stable automatic pick so the card is never empty.
    var wordOfTheDay: Word {
        let today = Self.isoFormatter.string(from: Date())
        if let scheduled = document.wordOfTheDaySchedule.first(where: { $0.date == today }) {
            return scheduled.word
        }

        let pool = document.vocabSets.flatMap(\.words)
        guard !pool.isEmpty else {
            return document.popularWords.first ?? MockData.fallbackWord
        }
        // Rotate deterministically by day so everyone sees the same word.
        let dayNumber = Int(Date().timeIntervalSince1970 / 86_400)
        return pool[abs(dayNumber) % pool.count]
    }

    /// Everything searchable on the Explore tab, de-duplicated by English term.
    var searchCorpus: [Word] {
        var all: [Word] = document.phrases
        all.append(contentsOf: document.vocabSets.flatMap(\.words))
        all.append(contentsOf: document.popularWords)
        var seen = Set<String>()
        return all.filter { seen.insert($0.english.lowercased()).inserted }
    }

    // MARK: - Refresh

    /// Pulls the latest published content. Failures are silent by design —
    /// the learner keeps whatever they already have.
    func refresh() async {
        guard let base = backendBaseURL, !isRefreshing else { return }
        isRefreshing = true
        defer { isRefreshing = false }

        var request = URLRequest(url: base.appendingPathComponent("content"))
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.timeoutInterval = 12

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            let envelope = try JSONDecoder().decode(ContentEnvelope.self, from: data)
            guard Self.looksComplete(envelope.content) else {
                print("[ContentService] Ignored an incomplete content document")
                return
            }

            document = envelope.content
            version = envelope.version
            lastRefreshedAt = Date()
            Self.writeCache(data, to: cacheURL)
        } catch {
            print("[ContentService] Refresh skipped: \(error.localizedDescription)")
        }
    }

    // MARK: - Cache

    /// Last line of defence against a half-written document blanking the app.
    private static func looksComplete(_ document: ContentDocument) -> Bool {
        !document.units.isEmpty
            && !document.vocabSets.isEmpty
            && document.units.allSatisfy { unit in
                !unit.lessons.isEmpty && unit.lessons.allSatisfy { !$0.words.isEmpty }
            }
    }

    private static func loadCachedEnvelope() -> ContentEnvelope? {
        guard let directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        else { return nil }
        let url = directory.appendingPathComponent("learndari-content.json")
        guard let data = try? Data(contentsOf: url),
              let envelope = try? JSONDecoder().decode(ContentEnvelope.self, from: data),
              looksComplete(envelope.content)
        else { return nil }
        return envelope
    }

    private static func writeCache(_ data: Data, to url: URL?) {
        guard let url else { return }
        do {
            try FileManager.default.createDirectory(
                at: url.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            try data.write(to: url, options: .atomic)
        } catch {
            print("[ContentService] Could not cache content: \(error.localizedDescription)")
        }
    }

    private static let isoFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()
}
