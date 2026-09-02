import SwiftUI

/// Phase one of a lesson: meet each new word on its own card, then start practice.
struct LessonView: View {
    let lesson: Lesson

    @Environment(ProgressStore.self) private var progress
    @Environment(ContentService.self) private var content
    @Environment(AudioService.self) private var audio
    @Environment(\.dismiss) private var dismiss

    @State private var index: Int = 0
    @State private var dragOffset: CGSize = .zero
    @State private var isPracticePresented: Bool = false
    @State private var isFlashcardsPresented: Bool = false
    @State private var didComplete: Bool = false

    private var word: Word { lesson.words[min(index, max(lesson.words.count - 1, 0))] }
    private var isLastCard: Bool { index >= lesson.words.count - 1 }

    /// Words from the same unit, the preferred source of plausible distractors.
    private var milestoneWords: [Word] {
        guard let unit = content.units.first(where: { unit in
            unit.lessons.contains { $0.id == lesson.id }
        }) else { return lesson.words }
        return unit.lessons.flatMap(\.words)
    }

    /// Everything else on the path, for distractors and cross-lesson review.
    private var corpus: [Word] {
        content.units.flatMap(\.lessons).flatMap(\.words)
    }

    var body: some View {
        VStack(spacing: 20) {
            progressDots

            if lesson.words.isEmpty {
                Spacer()
                Text("This lesson has no words yet.")
                    .font(.body)
                    .foregroundStyle(Theme.secondaryInk)
                Spacer()
            } else {
                introCard
                    .id(word.id)
                    .offset(x: dragOffset.width)
                    .rotationEffect(.degrees(Double(dragOffset.width) / 30))
                    .gesture(swipeGesture)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))

                Spacer(minLength: 0)
            }

            footer
        }
        .padding(.horizontal, 16)
        .background(Color.white)
        .navigationTitle(lesson.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear(perform: playCurrent)
        .onChange(of: index) { _, _ in playCurrent() }
        .fullScreenCover(isPresented: $isPracticePresented) {
            LessonSessionView(
                lesson: lesson,
                milestoneWords: milestoneWords,
                corpus: corpus
            ) { completed in
                guard completed else { return }
                let isNewCompletion = !progress.completedLessonIDs.contains(lesson.id)
                progress.complete(lesson: lesson)
                if isNewCompletion { progress.award(.lessonComplete) }
                didComplete = true
            }
        }
        .fullScreenCover(isPresented: $isFlashcardsPresented) {
            FlashcardsView(title: lesson.title, words: lesson.words)
        }
        .onChange(of: didComplete) { _, completed in
            if completed { dismiss() }
        }
    }

    // MARK: - Intro card

    private var progressDots: some View {
        HStack(spacing: 6) {
            ForEach(lesson.words.indices, id: \.self) { position in
                Capsule()
                    .fill(position == index ? Theme.red : Theme.hairline)
                    .frame(width: position == index ? 22 : 8, height: 8)
                    .animation(.snappy(duration: 0.25), value: index)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 12)
        .accessibilityLabel("Word \(index + 1) of \(lesson.words.count)")
    }

    private var introCard: some View {
        VStack(spacing: 16) {
            Text(word.dari)
                .font(.system(size: 52))
                .foregroundStyle(Theme.ink)
                .environment(\.layoutDirection, .rightToLeft)
                .multilineTextAlignment(.center)

            Text(word.phonetic)
                .font(.title2.italic())
                .foregroundStyle(Theme.secondaryInk)
                .multilineTextAlignment(.center)

            Divider().padding(.horizontal, 40)

            Text(word.english)
                .font(.system(size: 30, weight: .bold))
                .foregroundStyle(Theme.ink)
                .multilineTextAlignment(.center)

            AudioButton(text: word.dari, audioKey: word.audioKey, size: 64)
                .padding(.top, 2)

            if word.hasExample {
                exampleBlock
            }
        }
        .padding(28)
        .frame(maxWidth: .infinity)
        .cardStyle(radius: Theme.featuredRadius)
    }

    private var exampleBlock: some View {
        VStack(spacing: 8) {
            Text(highlighted(word.exampleDari ?? "", target: word.dari))
                .font(.title3)
                .environment(\.layoutDirection, .rightToLeft)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.ink)

            Text(word.exampleEnglish ?? "")
                .font(.subheadline)
                .foregroundStyle(Theme.secondaryInk)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(14)
        .background(Theme.fill, in: .rect(cornerRadius: Theme.cardRadius))
        .padding(.top, 4)
    }

    /// Bolds the word being taught inside its example sentence.
    private func highlighted(_ sentence: String, target: String) -> AttributedString {
        var attributed = AttributedString(sentence)
        guard !target.isEmpty, let range = attributed.range(of: target) else { return attributed }
        attributed[range].font = .title3.weight(.bold)
        attributed[range].foregroundColor = Theme.red
        return attributed
    }

    // MARK: - Footer

    private var footer: some View {
        VStack(spacing: 10) {
            Button(action: advance) {
                Text(isLastCard ? "Start practice" : "Next")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.red)
            .controlSize(.large)
            .disabled(lesson.words.isEmpty)

            HStack(spacing: 20) {
                Button("Back") { move(by: -1) }
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(index == 0 ? Theme.mutedInk : Theme.red)
                    .disabled(index == 0)

                Button("Review as flashcards") { isFlashcardsPresented = true }
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.red)
            }
        }
        .padding(.bottom, 12)
    }

    // MARK: - Navigation

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 24)
            .onChanged { value in
                guard abs(value.translation.width) > abs(value.translation.height) else { return }
                dragOffset = value.translation
            }
            .onEnded { value in
                defer { withAnimation(.spring(duration: 0.3)) { dragOffset = .zero } }
                guard abs(value.translation.width) > abs(value.translation.height) else { return }
                if value.translation.width < -60 {
                    move(by: 1)
                } else if value.translation.width > 60 {
                    move(by: -1)
                }
            }
    }

    private func advance() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        if isLastCard {
            isPracticePresented = true
        } else {
            move(by: 1)
        }
    }

    private func move(by delta: Int) {
        let next = index + delta
        guard next >= 0, next < lesson.words.count else { return }
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        withAnimation(.snappy(duration: 0.28)) { index = next }
    }

    /// Each card speaks once as it appears; the button replays it on demand.
    private func playCurrent() {
        guard !lesson.words.isEmpty else { return }
        audio.speak(word.dari, audioKey: word.audioKey)
    }
}

#Preview {
    NavigationStack {
        LessonView(lesson: MockData.units[2].lessons[2])
            .environment(ContentService())
    }
    .environment(ProgressStore())
    .environment(AudioService())
}
