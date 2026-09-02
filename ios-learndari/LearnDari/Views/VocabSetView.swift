import SwiftUI

/// An opened vocabulary set: two study modes plus the full word list.
struct VocabSetView: View {
    let set: VocabSet

    @State private var isFlashcardsPresented: Bool = false
    @State private var isQuizPresented: Bool = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header

                HStack(spacing: 12) {
                    ModeCard(
                        title: "Flashcards",
                        subtitle: "Review vocabulary with interactive cards",
                        systemImage: "rectangle.on.rectangle",
                        tint: Theme.red,
                        background: Theme.redSoft
                    ) {
                        isFlashcardsPresented = true
                    }

                    ModeCard(
                        title: "Quiz Mode",
                        subtitle: "Test your knowledge with multiple choice",
                        systemImage: "list.bullet.rectangle.portrait",
                        tint: Theme.green,
                        background: Theme.greenSoft
                    ) {
                        isQuizPresented = true
                    }
                }

                SectionHeading(title: "All Words (\(set.wordCount))")

                VStack(spacing: 0) {
                    ForEach(Array(set.words.enumerated()), id: \.element.id) { index, word in
                        WordRow(word: word)
                        if index < set.words.count - 1 {
                            Divider().padding(.leading, 16)
                        }
                    }
                }
                .cardStyle()
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(Color.white)
        .navigationTitle(set.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .fullScreenCover(isPresented: $isFlashcardsPresented) {
            FlashcardsView(title: set.name, words: set.words)
        }
        .fullScreenCover(isPresented: $isQuizPresented) {
            QuizView(title: set.name, words: set.words)
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            Text(set.emoji)
                .font(.system(size: 46))

            VStack(alignment: .leading, spacing: 4) {
                Text(set.name)
                    .font(.largeTitle.bold())
                    .foregroundStyle(Theme.ink)
                Text("\(set.summary) in Dari")
                    .font(.subheadline)
                    .foregroundStyle(Theme.secondaryInk)
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
        .padding(.top, 8)
    }
}

private struct ModeCard: View {
    let title: String
    let subtitle: String
    let systemImage: String
    let tint: Color
    let background: Color
    let action: () -> Void

    var body: some View {
        Button {
            UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            action()
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: systemImage)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(tint)
                    .frame(width: 46, height: 46)
                    .background(background, in: .rect(cornerRadius: 12))

                HStack(spacing: 4) {
                    Text(title)
                        .font(.title3.bold())
                        .foregroundStyle(Theme.ink)
                    Image(systemName: "chevron.right")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(tint)
                }

                Text(subtitle)
                    .font(.footnote)
                    .foregroundStyle(Theme.secondaryInk)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(16)
            .frame(maxWidth: .infinity, minHeight: 168, alignment: .topLeading)
            .background(background.opacity(0.45), in: .rect(cornerRadius: Theme.cardRadius))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cardRadius)
                    .strokeBorder(tint.opacity(0.18), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NavigationStack {
        VocabSetView(set: MockData.colours)
    }
    .environment(AudioService())
    .environment(ProgressStore())
}
