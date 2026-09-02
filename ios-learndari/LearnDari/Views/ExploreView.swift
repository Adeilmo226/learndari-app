import SwiftUI

/// Tab 3 — translation search that behaves like a real translator over mock data.
struct ExploreView: View {
    @Environment(ContentService.self) private var content

    @State private var query: String = ""
    @FocusState private var isSearchFocused: Bool

    private var results: [Word] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }
        let matches = content.searchCorpus.filter { word in
            word.english.localizedStandardContains(trimmed)
                || word.phonetic.localizedStandardContains(trimmed)
                || word.dari.contains(trimmed)
        }
        return Array(matches.prefix(20))
    }

    private var isSearching: Bool {
        !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    searchField

                    if isSearching {
                        resultsSection
                    } else {
                        WordOfTheDayCard()
                        SectionHeading(title: "Popular Words", systemImage: "chart.line.uptrend.xyaxis")
                        popularList
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
            .background(Color.white)
            .scrollDismissesKeyboard(.interactively)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { LogoToolbar() }
        }
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Theme.secondaryInk)

            TextField("Search a word or phrase…", text: $query)
                .textFieldStyle(.plain)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .focused($isSearchFocused)
                .submitLabel(.search)
                .foregroundStyle(Theme.ink)

            if !query.isEmpty {
                Button {
                    query = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Theme.mutedInk)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 15)
        .background(Theme.fill, in: .rect(cornerRadius: 14))
        .overlay {
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(isSearchFocused ? Theme.red.opacity(0.5) : Theme.hairline, lineWidth: 1)
        }
        .padding(.top, 6)
    }

    private var popularList: some View {
        VStack(spacing: 0) {
            ForEach(Array(content.popularWords.enumerated()), id: \.element.id) { index, word in
                WordRow(word: word, showsCategory: true)
                if index < content.popularWords.count - 1 {
                    Divider().padding(.leading, 16)
                }
            }
        }
        .cardStyle()
    }

    @ViewBuilder
    private var resultsSection: some View {
        if results.isEmpty {
            VStack(spacing: 10) {
                Image(systemName: "text.magnifyingglass")
                    .font(.system(size: 38))
                    .foregroundStyle(Theme.mutedInk)
                Text("No translation yet")
                    .font(.headline)
                    .foregroundStyle(Theme.ink)
                Text("We couldn't find “\(query)”. Try another word or phrase — more are added every week.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.secondaryInk)
                    .multilineTextAlignment(.center)
            }
            .padding(28)
            .frame(maxWidth: .infinity)
            .cardStyle()
        } else {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeading(title: "\(results.count) result\(results.count == 1 ? "" : "s")")

                VStack(spacing: 0) {
                    ForEach(Array(results.enumerated()), id: \.element.id) { index, word in
                        WordRow(word: word, showsCategory: true)
                        if index < results.count - 1 {
                            Divider().padding(.leading, 16)
                        }
                    }
                }
                .cardStyle()
            }
        }
    }
}

#Preview {
    ExploreView()
        .environment(AudioService())
        .environment(ContentService())
}
