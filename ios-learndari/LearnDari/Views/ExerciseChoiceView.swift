import SwiftUI

/// Multiple choice and listening share one layout: a prompt card on top, four
/// tappable options below, immediate colour feedback, then auto-advance.
struct ExerciseChoiceView: View {
    let exercise: Exercise
    let onAnswer: (Bool) -> Void

    @Environment(AudioService.self) private var audio

    @State private var selectedID: String?

    private var isListening: Bool { exercise.kind == .listening }
    private var revealed: Bool { selectedID != nil }

    var body: some View {
        VStack(spacing: 20) {
            promptCard

            VStack(spacing: 12) {
                ForEach(exercise.options) { option in
                    optionButton(option)
                }
            }

            Spacer(minLength: 0)
        }
        .onAppear {
            if isListening { play() }
        }
    }

    // MARK: - Prompt

    private var promptCard: some View {
        VStack(spacing: 12) {
            Text(promptLabel)
                .font(.footnote.weight(.semibold))
                .kerning(0.5)
                .foregroundStyle(Theme.secondaryInk)

            if isListening {
                Button(action: play) {
                    Image(systemName: "speaker.wave.3.fill")
                        .font(.system(size: 34, weight: .semibold))
                        .foregroundStyle(Theme.red)
                        .frame(width: 96, height: 96)
                        .background(Theme.redSoft, in: .circle)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Play the audio again")

                Text("Tap to hear it again")
                    .font(.footnote)
                    .foregroundStyle(Theme.mutedInk)
            } else if exercise.direction == .dariToEnglish {
                Text(exercise.word.dari)
                    .font(.system(size: 46, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .environment(\.layoutDirection, .rightToLeft)
                    .multilineTextAlignment(.center)

                Text(exercise.word.phonetic)
                    .font(.title3.italic())
                    .foregroundStyle(Theme.secondaryInk)
                    .multilineTextAlignment(.center)

                AudioButton(text: exercise.word.dari, audioKey: exercise.word.audioKey, size: 52)
            } else {
                Text(exercise.word.english)
                    .font(.system(size: 38, weight: .bold))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .cardStyle(radius: Theme.featuredRadius)
    }

    private var promptLabel: String {
        if isListening { return "WHAT DID YOU HEAR?" }
        return exercise.direction == .dariToEnglish ? "WHAT DOES THIS MEAN?" : "HOW DO YOU SAY THIS?"
    }

    // MARK: - Options

    private func optionButton(_ option: Word) -> some View {
        let isSelected = selectedID == option.id
        let isCorrect = option.id == exercise.correctID
        let showsDari = exercise.direction == .englishToDari

        return Button {
            select(option)
        } label: {
            HStack(spacing: 12) {
                Group {
                    if showsDari {
                        Text(option.dari)
                            .font(.title3)
                            .environment(\.layoutDirection, .rightToLeft)
                    } else {
                        Text(option.english)
                            .font(.title3)
                    }
                }
                .foregroundStyle(Theme.ink)
                .multilineTextAlignment(.leading)

                Spacer()

                if revealed && isCorrect {
                    Image(systemName: "checkmark.circle.fill").foregroundStyle(Theme.green)
                } else if revealed && isSelected {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(Theme.red)
                }
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .frame(maxWidth: .infinity)
            .background(fill(isCorrect: isCorrect, isSelected: isSelected), in: .rect(cornerRadius: Theme.cardRadius))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cardRadius)
                    .strokeBorder(stroke(isCorrect: isCorrect, isSelected: isSelected), lineWidth: 1.5)
            }
        }
        .buttonStyle(.plain)
        .disabled(revealed)
    }

    private func fill(isCorrect: Bool, isSelected: Bool) -> Color {
        guard revealed else { return .white }
        if isCorrect { return Theme.greenSoft }
        if isSelected { return Theme.redSoft }
        return .white
    }

    private func stroke(isCorrect: Bool, isSelected: Bool) -> Color {
        guard revealed else { return Theme.hairline }
        if isCorrect { return Theme.green.opacity(0.6) }
        if isSelected { return Theme.red.opacity(0.6) }
        return Theme.hairline
    }

    // MARK: - Actions

    private func play() {
        audio.speak(exercise.word.dari, audioKey: exercise.word.audioKey)
    }

    private func select(_ option: Word) {
        guard selectedID == nil else { return }
        let isCorrect = option.id == exercise.correctID
        withAnimation(.snappy(duration: 0.2)) { selectedID = option.id }

        UINotificationFeedbackGenerator().notificationOccurred(isCorrect ? .success : .error)

        Task {
            // A wrong answer lingers so the correct option can be read properly.
            try? await Task.sleep(for: .milliseconds(isCorrect ? 850 : 1_500))
            onAnswer(isCorrect)
        }
    }
}

#Preview {
    let words = MockData.colours.words
    return ExerciseChoiceView(
        exercise: Exercise(
            id: "preview",
            item: SessionItem(id: "i", word: words[0], kind: .multipleChoice, isReview: false),
            direction: .dariToEnglish,
            options: Array(words.prefix(4)),
            pairs: []
        ),
        onAnswer: { _ in }
    )
    .padding(.horizontal, 16)
    .environment(AudioService())
}
