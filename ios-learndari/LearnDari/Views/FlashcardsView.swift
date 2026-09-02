import SwiftUI

/// Which side of the card is shown first.
enum FlashcardSide: String, CaseIterable, Identifiable {
    case dari
    case english

    var id: String { rawValue }

    var label: String {
        switch self {
        case .dari: "Dari first"
        case .english: "English first"
        }
    }
}

/// Quizlet-style cards: tap the card to flip, swipe left/right to move between words.
/// The Dari face always pairs the script with its phonetic spelling.
struct FlashcardsView: View {
    let title: String
    let words: [Word]

    @Environment(\.dismiss) private var dismiss
    @State private var index: Int = 0
    @State private var isFlipped: Bool = false
    @State private var dragOffset: CGSize = .zero
    @State private var startSide: FlashcardSide = .dari

    private var word: Word { words[min(index, words.count - 1)] }

    /// The face currently visible, accounting for the chosen starting side.
    private var visibleSide: FlashcardSide {
        if isFlipped {
            return startSide == .dari ? .english : .dari
        }
        return startSide
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Picker("Show first", selection: $startSide) {
                    ForEach(FlashcardSide.allCases) { side in
                        Text(side.label).tag(side)
                    }
                }
                .pickerStyle(.segmented)
                .onChange(of: startSide) { _, _ in
                    withAnimation(.snappy(duration: 0.25)) { isFlipped = false }
                }

                Text("Card \(index + 1) of \(words.count)")
                    .font(.subheadline.weight(.semibold).monospacedDigit())
                    .foregroundStyle(Theme.secondaryInk)

                ProgressView(value: Double(index + 1), total: Double(words.count))
                    .tint(Theme.red)
                    .padding(.horizontal, 32)

                Spacer(minLength: 0)

                card
                    .offset(x: dragOffset.width)
                    .rotationEffect(.degrees(Double(dragOffset.width) / 24))
                    .gesture(swipeGesture)

                Text("Tap the card to flip · swipe left or right to move")
                    .font(.footnote)
                    .foregroundStyle(Theme.mutedInk)
                    .multilineTextAlignment(.center)

                Spacer(minLength: 0)

                controls
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
            .background(Color.white)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .tint(Theme.red)
                }
            }
        }
    }

    private var card: some View {
        Button {
            flip()
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color.white)
                    .overlay {
                        RoundedRectangle(cornerRadius: 24)
                            .strokeBorder(isFlipped ? Theme.green.opacity(0.4) : Theme.hairline, lineWidth: 1.5)
                    }
                    .shadow(color: .black.opacity(0.07), radius: 18, y: 8)

                VStack(spacing: 18) {
                    if visibleSide == .dari {
                        Text(word.dari)
                            .font(.system(size: 52))
                            .environment(\.layoutDirection, .rightToLeft)
                            .foregroundStyle(Theme.ink)
                            .multilineTextAlignment(.center)
                        Text(word.phonetic)
                            .font(.title2.italic())
                            .foregroundStyle(Theme.secondaryInk)
                            .multilineTextAlignment(.center)
                    } else {
                        Text(word.english)
                            .font(.system(size: 40, weight: .bold))
                            .foregroundStyle(Theme.ink)
                            .multilineTextAlignment(.center)
                    }

                    AudioButton(text: word.dari, audioKey: word.audioKey, size: 56)
                }
                .padding(28)
                .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 1, y: 0, z: 0))
            }
            .frame(height: 340)
            .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 1, y: 0, z: 0))
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(visibleSide == .dari ? "\(word.phonetic). Tap to see the English" : "\(word.english). Tap to see the Dari")
    }

    private var controls: some View {
        HStack(spacing: 16) {
            Button {
                move(by: -1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.bordered)
            .tint(Theme.secondaryInk)
            .disabled(index == 0)

            Button {
                move(by: 1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.bordered)
            .tint(Theme.secondaryInk)
            .disabled(index >= words.count - 1)
        }
    }

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 24)
            .onChanged { value in
                guard abs(value.translation.width) > abs(value.translation.height) else { return }
                dragOffset = value.translation
            }
            .onEnded { value in
                guard abs(value.translation.width) > abs(value.translation.height) else {
                    dragOffset = .zero
                    return
                }
                if value.translation.width < -60 {
                    move(by: 1)
                } else if value.translation.width > 60 {
                    move(by: -1)
                }
                withAnimation(.spring(duration: 0.3)) { dragOffset = .zero }
            }
    }

    private func flip() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        withAnimation(.snappy(duration: 0.35)) { isFlipped.toggle() }
    }

    private func move(by delta: Int) {
        let next = index + delta
        guard next >= 0, next < words.count else { return }
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        withAnimation(.snappy(duration: 0.25)) {
            isFlipped = false
            index = next
        }
    }
}

#Preview {
    FlashcardsView(title: "Colours", words: MockData.colours.words)
        .environment(AudioService())
}
