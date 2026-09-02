import SwiftUI

/// Tab 2 — browse vocabulary sets.
struct VocabView: View {
    @Environment(ContentService.self) private var content

    @State private var path: [VocabSet] = []

    private let columns = [
        GridItem(.flexible(), spacing: 14),
        GridItem(.flexible(), spacing: 14),
    ]

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Vocabulary Sets")
                            .font(.largeTitle.bold())
                            .foregroundStyle(Theme.ink)
                        Text("Choose a set to start learning")
                            .font(.title3)
                            .foregroundStyle(Theme.secondaryInk)
                        Text("More vocab sets coming soon.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.mutedInk)
                    }
                    .padding(.top, 4)

                    LazyVGrid(columns: columns, spacing: 14) {
                        ForEach(content.vocabSets) { set in
                            VocabSetCard(set: set) {
                                path.append(set)
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
            .background(Color.white)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { LogoToolbar() }
            .navigationDestination(for: VocabSet.self) { set in
                VocabSetView(set: set)
            }
        }
    }
}

private struct VocabSetCard: View {
    let set: VocabSet
    let onOpen: () -> Void

    var body: some View {
        Button {
            UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            onOpen()
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    Text(set.emoji)
                        .font(.system(size: 38))
                    Spacer()
                    AudioButton(
                        text: set.words.first?.dari ?? set.name,
                        audioKey: set.words.first?.audioKey,
                        size: 34
                    )
                }

                Text(set.name)
                    .font(.title3.bold())
                    .foregroundStyle(Theme.ink)

                HStack(spacing: 4) {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.system(size: 10, weight: .semibold))
                    Text("Audio")
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(Theme.green)

                Text(set.summary)
                    .font(.footnote)
                    .foregroundStyle(Theme.secondaryInk)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack {
                    Text("\(set.wordCount) words")
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(Theme.mutedInk)
                    Spacer()
                    Text("Start")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.red)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 200, alignment: .topLeading)
            .cardStyle()
        }
        .buttonStyle(.plain)
        .accessibilityHint("Opens vocabulary set")
    }
}

#Preview {
    VocabView()
        .environment(AudioService())
        .environment(ContentService())
}
