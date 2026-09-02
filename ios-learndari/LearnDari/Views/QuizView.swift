import SwiftUI

/// Four-option multiple choice. Every question shows the Dari word with its
/// phonetic spelling and asks for the English meaning — consistent across all sets.
struct QuizView: View {
    let title: String
    let words: [Word]
    var onFinish: ((Int, Int) -> Void)?

    @Environment(\.dismiss) private var dismiss
    @Environment(ProgressStore.self) private var progress

    @State private var questions: [QuizQuestion] = []
    @State private var index: Int = 0
    @State private var selectedID: String?
    @State private var score: Int = 0
    @State private var isFinished: Bool = false
    @State private var earnedXP: Int = 0
    @State private var floatingXP: Int?

    private var question: QuizQuestion? {
        guard index < questions.count else { return nil }
        return questions[index]
    }

    var body: some View {
        NavigationStack {
            Group {
                if isFinished {
                    results
                } else if let question {
                    quiz(for: question)
                } else {
                    ProgressView()
                }
            }
            .background(Color.white)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { finishAndDismiss() }
                        .tint(Theme.red)
                }
            }
        }
        .onAppear {
            if questions.isEmpty {
                questions = QuizQuestion.build(from: words)
            }
        }
    }

    private func quiz(for question: QuizQuestion) -> some View {
        VStack(spacing: 22) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Question \(index + 1) of \(questions.count)")
                        .font(.subheadline.weight(.semibold).monospacedDigit())
                        .foregroundStyle(Theme.secondaryInk)
                    Spacer()
                    ZStack(alignment: .trailing) {
                        Text("+\(earnedXP) XP")
                            .font(.subheadline.weight(.bold).monospacedDigit())
                            .foregroundStyle(Theme.red)
                            .contentTransition(.numericText())

                        if let floatingXP {
                            Text("+\(floatingXP)")
                                .font(.subheadline.weight(.heavy).monospacedDigit())
                                .foregroundStyle(Theme.green)
                                .offset(y: -22)
                                .transition(.scale.combined(with: .opacity))
                        }
                    }
                }
                ProgressView(value: Double(index + 1), total: Double(questions.count))
                    .tint(Theme.red)
            }
            .padding(.top, 8)

            VStack(spacing: 12) {
                Text("WHAT DOES THIS MEAN?")
                    .font(.footnote.weight(.semibold))
                    .kerning(0.5)
                    .foregroundStyle(Theme.secondaryInk)

                Text(question.dari)
                    .font(.system(size: 46, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.center)
                    .environment(\.layoutDirection, .rightToLeft)

                Text(question.phonetic)
                    .font(.title3.italic())
                    .foregroundStyle(Theme.secondaryInk)
                    .multilineTextAlignment(.center)

                AudioButton(text: question.dari, audioKey: question.audioKey, size: 52)
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .cardStyle(radius: Theme.featuredRadius)

            VStack(spacing: 12) {
                ForEach(question.options) { option in
                    optionButton(option, question: question)
                }
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 16)
    }

    private func optionButton(_ option: QuizOption, question: QuizQuestion) -> some View {
        let isSelected = selectedID == option.id
        let isCorrect = option.id == question.correctID
        let revealed = selectedID != nil

        return Button {
            select(option, question: question)
        } label: {
            HStack {
                Text(option.text)
                    .font(.title3)
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
            .background(background(revealed: revealed, isCorrect: isCorrect, isSelected: isSelected), in: .rect(cornerRadius: Theme.cardRadius))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cardRadius)
                    .strokeBorder(border(revealed: revealed, isCorrect: isCorrect, isSelected: isSelected), lineWidth: 1.5)
            }
        }
        .buttonStyle(.plain)
        .disabled(revealed)
    }

    private func background(revealed: Bool, isCorrect: Bool, isSelected: Bool) -> Color {
        guard revealed else { return .white }
        if isCorrect { return Theme.greenSoft }
        if isSelected { return Theme.redSoft }
        return .white
    }

    private func border(revealed: Bool, isCorrect: Bool, isSelected: Bool) -> Color {
        guard revealed else { return Theme.hairline }
        if isCorrect { return Theme.green.opacity(0.6) }
        if isSelected { return Theme.red.opacity(0.6) }
        return Theme.hairline
    }

    private var results: some View {
        VStack(spacing: 22) {
            Spacer()

            Image(systemName: score == questions.count ? "trophy.fill" : "checkmark.seal.fill")
                .font(.system(size: 64))
                .foregroundStyle(Theme.red)

            Text(score == questions.count ? "Perfect!" : "Nice work")
                .font(.largeTitle.bold())
                .foregroundStyle(Theme.ink)

            Text("You scored \(score) out of \(questions.count)")
                .font(.title3)
                .foregroundStyle(Theme.secondaryInk)
                .monospacedDigit()

            HStack(spacing: 12) {
                statTile(value: "\(score)", label: "Correct")
                statTile(
                    value: "\(Int(Double(score) / Double(max(questions.count, 1)) * 100))%",
                    label: "Accuracy"
                )
                statTile(value: "+\(earnedXP)", label: "XP earned")
            }
            .padding(.top, 6)

            Spacer()

            Button {
                finishAndDismiss()
            } label: {
                Text("Done")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.red)
            .controlSize(.large)

            Button("Try again") {
                restart()
            }
            .font(.subheadline.weight(.medium))
            .foregroundStyle(Theme.red)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 20)
    }

    private func statTile(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold().monospacedDigit())
                .foregroundStyle(Theme.ink)
            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.secondaryInk)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .cardStyle()
    }

    private func select(_ option: QuizOption, question: QuizQuestion) {
        guard selectedID == nil else { return }
        selectedID = option.id
        if option.id == question.correctID {
            score += 1
            grantXP(progress.award(.correctAnswer))
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        } else {
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }

        Task {
            try? await Task.sleep(for: .milliseconds(850))
            withAnimation(.snappy(duration: 0.25)) {
                selectedID = nil
                if index < questions.count - 1 {
                    index += 1
                } else {
                    if score == questions.count {
                        earnedXP += progress.award(.perfectQuiz)
                    }
                    isFinished = true
                }
            }
        }
    }

    /// Bumps the running total and pops a short-lived "+10" above it.
    private func grantXP(_ amount: Int) {
        withAnimation(.snappy(duration: 0.3)) {
            earnedXP += amount
            floatingXP = amount
        }
        Task {
            try? await Task.sleep(for: .milliseconds(700))
            withAnimation(.easeOut(duration: 0.25)) { floatingXP = nil }
        }
    }

    private func restart() {
        withAnimation {
            questions = QuizQuestion.build(from: words)
            index = 0
            score = 0
            selectedID = nil
            isFinished = false
            earnedXP = 0
        }
    }

    private func finishAndDismiss() {
        onFinish?(score, questions.count)
        dismiss()
    }
}

// MARK: - Question model

nonisolated struct QuizOption: Identifiable, Hashable, Sendable {
    let id: String
    let text: String
}

nonisolated struct QuizQuestion: Identifiable, Hashable, Sendable {
    let id: String
    let dari: String
    let phonetic: String
    let audioKey: String?
    let options: [QuizOption]
    let correctID: String

    /// Up to six Dari → English questions, each with three distractors.
    static func build(from words: [Word]) -> [QuizQuestion] {
        guard words.count >= 2 else { return [] }
        let selected = Array(words.shuffled().prefix(6))

        return selected.enumerated().map { offset, word in
            var options = words
                .filter { $0.id != word.id }
                .shuffled()
                .prefix(3)
                .map { QuizOption(id: $0.id, text: $0.english) }

            options.append(QuizOption(id: word.id, text: word.english))

            return QuizQuestion(
                id: "\(word.id)-\(offset)",
                dari: word.dari,
                phonetic: word.phonetic,
                audioKey: word.audioKey,
                options: options.shuffled(),
                correctID: word.id
            )
        }
    }
}

#Preview {
    QuizView(title: "Colours", words: MockData.colours.words)
        .environment(AudioService())
        .environment(ProgressStore())
}
