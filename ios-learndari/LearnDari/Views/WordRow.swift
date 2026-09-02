import SwiftUI

/// The recurring English / Dari / pronunciation row used across Vocab, Explore and lessons.
struct WordRow: View {
    let word: Word
    var showsCategory: Bool = false

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(word.english)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Theme.ink)
                if showsCategory, let category = word.category {
                    Text(category)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(Theme.secondaryInk)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Theme.fill, in: .capsule)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(alignment: .trailing, spacing: 2) {
                Text(word.dari)
                    .font(.title3)
                    .foregroundStyle(Theme.ink)
                    .environment(\.layoutDirection, .rightToLeft)
                Text(word.phonetic)
                    .font(.subheadline.italic())
                    .foregroundStyle(Theme.secondaryInk)
            }

            AudioButton(text: word.dari, audioKey: word.audioKey, size: 40)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

/// Section heading used above lists throughout the app.
struct SectionHeading: View {
    let title: String
    var systemImage: String?

    var body: some View {
        HStack(spacing: 6) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.red)
            }
            Text(title)
                .font(.title3.bold())
                .foregroundStyle(Theme.ink)
            Spacer()
        }
    }
}

/// Nav-bar logo shared by every top-level tab.
struct LogoToolbar: ToolbarContent {
    var body: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            LogoMark(height: 34)
        }
    }
}
