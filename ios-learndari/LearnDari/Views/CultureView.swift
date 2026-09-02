import SwiftUI

/// Tab 4 — Afghan wisdom and traditions.
struct CultureView: View {
    enum Destination: Hashable {
        case proverbs
        case wordOfTheDay
    }

    @Environment(ContentService.self) private var content

    @State private var path: [Destination] = []

    /// Rotates daily so the featured proverb changes without any scheduling.
    private var proverb: Proverb? {
        let all = content.proverbs
        guard !all.isEmpty else { return nil }
        let dayNumber = Int(Date().timeIntervalSince1970 / 86_400)
        return all[abs(dayNumber) % all.count]
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    if let proverb {
                        ProverbCard(proverb: proverb) {
                            path.append(.proverbs)
                        }
                    }

                    SectionHeading(title: "Culture & Language")

                    VStack(spacing: 0) {
                        categoryRow(
                            emoji: "🇦🇫",
                            tint: Theme.redSoft,
                            title: "Afghan Proverbs",
                            subtitle: "Traditional Afghan wisdom and sayings",
                            destination: .proverbs
                        )
                        Divider().padding(.leading, 74)
                        categoryRow(
                            emoji: "📖",
                            tint: Theme.greenSoft,
                            title: "Word of the Day",
                            subtitle: "Today's word with pronunciation",
                            destination: .wordOfTheDay
                        )
                    }
                    .cardStyle()
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
            .background(Color.white)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { LogoToolbar() }
            .navigationDestination(for: Destination.self) { destination in
                switch destination {
                case .proverbs: ProverbsListView()
                case .wordOfTheDay: WordOfTheDayView()
                }
            }
        }
    }

    private func categoryRow(emoji: String, tint: Color, title: String, subtitle: String, destination: Destination) -> some View {
        Button {
            path.append(destination)
        } label: {
            HStack(spacing: 14) {
                Text(emoji)
                    .font(.title2)
                    .frame(width: 44, height: 44)
                    .background(tint, in: .rect(cornerRadius: 12))

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(Theme.ink)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(Theme.secondaryInk)
                        .multilineTextAlignment(.leading)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.mutedInk)
            }
            .padding(16)
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Featured proverb

struct ProverbCard: View {
    let proverb: Proverb
    var onBrowse: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text(onBrowse == nil ? proverb.category.uppercased() : "PROVERB OF THE DAY")
                    .font(.caption.weight(.bold))
                    .kerning(0.6)
                    .foregroundStyle(.white.opacity(0.9))
                Spacer()
                AudioButton(text: proverb.dari, audioKey: proverb.audioKey, size: 44, style: .onFeatured)
            }

            Text("“\(proverb.english)”")
                .font(.title2.bold())
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)

            Text(proverb.dari)
                .font(.title2)
                .foregroundStyle(.white)
                .environment(\.layoutDirection, .rightToLeft)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .fixedSize(horizontal: false, vertical: true)

            Text(proverb.phonetic)
                .font(.subheadline.italic())
                .foregroundStyle(.white.opacity(0.92))
                .frame(maxWidth: .infinity, alignment: .trailing)

            (Text("Meaning: ").font(.subheadline.bold()) + Text(proverb.meaning).font(.subheadline))
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.white.opacity(0.18), in: .rect(cornerRadius: 12))

            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "leaf.fill")
                        .font(.caption2)
                    Text(proverb.category)
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(.white.opacity(0.2), in: .capsule)

                Spacer()

                if let onBrowse {
                    Button(action: onBrowse) {
                        HStack(spacing: 4) {
                            Text("Browse all proverbs")
                                .font(.subheadline.weight(.semibold))
                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.bold))
                        }
                        .foregroundStyle(.white)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.featuredGradient, in: .rect(cornerRadius: Theme.featuredRadius))
        .shadow(color: Theme.red.opacity(0.18), radius: 14, y: 6)
        .padding(.top, 6)
    }
}

// MARK: - Proverb list

struct ProverbsListView: View {
    @Environment(ContentService.self) private var content

    @State private var query: String = ""

    private var filtered: [Proverb] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return content.proverbs }
        return content.proverbs.filter {
            $0.english.localizedStandardContains(trimmed)
                || $0.phonetic.localizedStandardContains(trimmed)
                || $0.category.localizedStandardContains(trimmed)
                || $0.dari.contains(trimmed)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(filtered) { proverb in
                    ProverbCard(proverb: proverb)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(Color.white)
        .searchable(text: $query, prompt: "Search proverbs")
        .navigationTitle("Afghan Proverbs")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }
}

#Preview {
    CultureView()
        .environment(AudioService())
        .environment(ContentService())
}
