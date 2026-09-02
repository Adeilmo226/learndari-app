import SwiftUI

/// The gradient Word of the Day banner, shared by Explore and Culture.
struct WordOfTheDayCard: View {
    @Environment(ContentService.self) private var content

    /// Pass a word to pin the card; otherwise today's scheduled word is used.
    var word: Word?

    private var displayedWord: Word { word ?? content.wordOfTheDay }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 6) {
                Image(systemName: "star.fill")
                    .font(.subheadline)
                Text("WORD OF THE DAY")
                    .font(.caption.weight(.bold))
                    .kerning(0.6)
            }
            .foregroundStyle(.white.opacity(0.95))

            HStack(alignment: .center, spacing: 12) {
                column(label: "English", value: displayedWord.english, isDari: false)
                column(label: "Dari", value: displayedWord.dari, isDari: true)
                column(label: "Pronunciation", value: displayedWord.phonetic, isDari: false, italic: true)
                AudioButton(text: displayedWord.dari, audioKey: displayedWord.audioKey, size: 52, style: .onFeatured)
            }
            .padding(16)
            .background(.white.opacity(0.16), in: .rect(cornerRadius: 14))
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.featuredGradient, in: .rect(cornerRadius: Theme.featuredRadius))
        .shadow(color: Theme.red.opacity(0.18), radius: 14, y: 6)
    }

    private func column(label: String, value: String, isDari: Bool, italic: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.85))
            Text(value)
                .font(isDari ? .title2 : (italic ? .title3.italic() : .title3.bold()))
                .foregroundStyle(.white)
                .environment(\.layoutDirection, isDari ? .rightToLeft : .leftToRight)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Standalone Word of the Day screen reached from the Culture tab.
struct WordOfTheDayView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                WordOfTheDayCard()

                VStack(alignment: .leading, spacing: 10) {
                    Text("Use it today")
                        .font(.headline)
                        .foregroundStyle(Theme.ink)
                    Text("A new word appears here every day. Say it out loud with the audio button, then try to use it in a sentence before the day is over.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.secondaryInk)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(18)
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color.white)
        .navigationTitle("Word of the Day")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }
}

#Preview {
    NavigationStack {
        WordOfTheDayView()
    }
    .environment(AudioService())
    .environment(ContentService())
}
