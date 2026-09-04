import SwiftUI

/// Tab 4 — Afghan wisdom and traditions.
struct CultureView: View {
    enum Destination: Hashable {
        case proverbs
        case traditions
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
                            emoji: "🏛️",
                            tint: Theme.amber.opacity(0.16),
                            title: "Culture & Traditions",
                            subtitle: "Afghan food culture, holidays, and customs",
                            destination: .traditions
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
                case .traditions: TraditionsListView()
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

// MARK: - Culture & Traditions

/// A single culture topic and its short sections. Editorial content that lives
/// in the app (there is no culture-articles field in the shared content feed),
/// mirroring the website's Culture & Traditions page.
private struct CultureTopic: Identifiable {
    let title: String
    let icon: String
    let sections: [Section]
    var id: String { title }

    struct Section: Identifiable {
        let subtitle: String
        let text: String
        var id: String { subtitle }
    }
}

private let cultureTopics: [CultureTopic] = [
    CultureTopic(title: "Greetings & Etiquette", icon: "person.2.fill", sections: [
        .init(subtitle: "Common Greetings", text: "Afghans greet each other with 'Salaam' (سلام) or 'Salaam Alaikum' (سلام علیکم). It's customary to ask about someone's health and family when greeting."),
        .init(subtitle: "Handshakes", text: "Men typically shake hands with other men. Between genders, it's respectful to wait and see if a handshake is offered, as some may prefer not to shake hands."),
        .init(subtitle: "Respect for Elders", text: "Showing respect to elders is fundamental in Afghan culture. Always greet elders first and address them with honorific titles."),
    ]),
    CultureTopic(title: "Hospitality & Food", icon: "cup.and.saucer.fill", sections: [
        .init(subtitle: "Afghan Hospitality", text: "Hospitality (مهمان‌نوازی - mehmaan-nawaazi) is deeply valued. Guests are treated with the utmost respect and offered the best food and accommodations."),
        .init(subtitle: "Tea Culture", text: "Tea (چای - chai) is central to Afghan culture. Green tea is often served with meals and throughout the day. Refusing tea can be seen as impolite."),
        .init(subtitle: "Traditional Foods", text: "Popular dishes include Kabuli Pulao (rice with raisins and carrots), Mantu (dumplings), and various kebabs. Meals are often shared communally."),
    ]),
    CultureTopic(title: "Holidays & Celebrations", icon: "calendar", sections: [
        .init(subtitle: "Nowruz (نوروز)", text: "The Persian New Year, celebrated on the spring equinox (March 20-21). It marks the beginning of spring and is celebrated with family gatherings, special foods, and the Haft-Seen table."),
        .init(subtitle: "Eid al-Fitr & Eid al-Adha", text: "Major Islamic holidays celebrated with prayers, family gatherings, new clothes, and special foods. These are times of charity and community."),
        .init(subtitle: "Independence Day", text: "Celebrated on August 19, commemorating Afghanistan's independence from British influence in 1919."),
    ]),
    CultureTopic(title: "Family & Social Structure", icon: "house.fill", sections: [
        .init(subtitle: "Extended Family", text: "Family is the cornerstone of Afghan society. Extended families often live together or in close proximity, with strong bonds across generations."),
        .init(subtitle: "Family Gatherings", text: "Regular family gatherings are common, especially on Fridays and during holidays. These gatherings strengthen family bonds and maintain traditions."),
        .init(subtitle: "Respect and Hierarchy", text: "There's a clear hierarchy based on age and position within the family. Younger members show respect to elders through language and behavior."),
    ]),
    CultureTopic(title: "Arts & Literature", icon: "music.note", sections: [
        .init(subtitle: "Poetry", text: "Poetry holds a special place in Afghan culture. Rumi, Hafez, and other Persian poets are widely read and quoted. Poetry gatherings (mushaira) are popular social events."),
        .init(subtitle: "Music", text: "Traditional Afghan music features instruments like the rubab, tabla, and harmonium. Music is an important part of celebrations and gatherings."),
        .init(subtitle: "Calligraphy & Art", text: "Persian calligraphy is highly valued as an art form. Geometric patterns and floral designs are common in Afghan arts and crafts."),
    ]),
    CultureTopic(title: "Core Values", icon: "heart.fill", sections: [
        .init(subtitle: "Honor & Dignity (ناموس - namus)", text: "Personal and family honor are highly valued. Maintaining dignity and reputation in the community is important."),
        .init(subtitle: "Hospitality (مهمان‌نوازی)", text: "Guests are considered a blessing. The saying 'Mehman habib-ullah ast' (A guest is beloved of God) reflects this value."),
        .init(subtitle: "Community & Solidarity", text: "Strong sense of community and mutual support. Neighbors and community members help each other in times of need."),
    ]),
]

struct TraditionsListView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(cultureTopics) { topic in
                    TraditionCard(topic: topic)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(Color.white)
        .navigationTitle("Culture & Traditions")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }
}

private struct TraditionCard: View {
    let topic: CultureTopic

    /// Red gradient header, matching the website's red topic cards.
    private var headerGradient: LinearGradient {
        LinearGradient(
            colors: [Color(red: 0.937, green: 0.267, blue: 0.267), Theme.red],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 14) {
                Image(systemName: topic.icon)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(.white.opacity(0.2), in: .rect(cornerRadius: 12))

                Text(topic.title)
                    .font(.title3.bold())
                    .foregroundStyle(.white)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer(minLength: 0)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(headerGradient)

            VStack(alignment: .leading, spacing: 16) {
                ForEach(topic.sections) { section in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(section.subtitle)
                            .font(.headline)
                            .foregroundStyle(Theme.ink)
                        Text(section.text)
                            .font(.subheadline)
                            .foregroundStyle(Theme.secondaryInk)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
        }
        .clipShape(.rect(cornerRadius: Theme.cardRadius))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cardRadius)
                .strokeBorder(Theme.hairline, lineWidth: 1)
        }
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
    }
}

#Preview {
    CultureView()
        .environment(AudioService())
        .environment(ContentService())
}
