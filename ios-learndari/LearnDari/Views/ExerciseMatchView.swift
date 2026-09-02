import SwiftUI

/// Tap a Dari word, then its English meaning, to connect the pair.
/// Two independently shuffled columns of four.
struct ExerciseMatchView: View {
    let words: [Word]
    /// Reports which words were paired first time, and which took a wrong guess.
    let onComplete: (_ firstTryCorrect: Set<String>, _ missed: Set<String>) -> Void

    @Environment(AudioService.self) private var audio

    @State private var dariColumn: [Word] = []
    @State private var englishColumn: [Word] = []
    @State private var selectedDariID: String?
    @State private var selectedEnglishID: String?
    @State private var matchedIDs: Set<String> = []
    @State private var missedIDs: Set<String> = []
    @State private var wrongIDs: Set<String> = []

    var body: some View {
        VStack(spacing: 18) {
            VStack(spacing: 6) {
                Text("MATCH THE PAIRS")
                    .font(.footnote.weight(.semibold))
                    .kerning(0.5)
                    .foregroundStyle(Theme.secondaryInk)
                Text("Tap a Dari word, then its meaning")
                    .font(.subheadline)
                    .foregroundStyle(Theme.mutedInk)
            }

            HStack(alignment: .top, spacing: 12) {
                VStack(spacing: 12) {
                    ForEach(dariColumn) { word in
                        tile(for: word, isDari: true)
                    }
                }
                VStack(spacing: 12) {
                    ForEach(englishColumn) { word in
                        tile(for: word, isDari: false)
                    }
                }
            }

            Spacer(minLength: 0)
        }
        .onAppear {
            if dariColumn.isEmpty {
                dariColumn = words.shuffled()
                englishColumn = words.shuffled()
            }
        }
    }

    private func tile(for word: Word, isDari: Bool) -> some View {
        let isMatched = matchedIDs.contains(word.id)
        let isSelected = isDari ? selectedDariID == word.id : selectedEnglishID == word.id
        let isWrong = wrongIDs.contains(word.id) && isSelected

        return Button {
            select(word, isDari: isDari)
        } label: {
            VStack(spacing: 4) {
                if isDari {
                    Text(word.dari)
                        .font(.title3.weight(.medium))
                        .environment(\.layoutDirection, .rightToLeft)
                    Text(word.phonetic)
                        .font(.caption.italic())
                        .foregroundStyle(Theme.secondaryInk)
                } else {
                    Text(word.english)
                        .font(.body.weight(.medium))
                }
            }
            .foregroundStyle(isMatched ? Theme.green : Theme.ink)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, minHeight: 68)
            .padding(.horizontal, 10)
            .background(tileFill(isMatched: isMatched, isSelected: isSelected, isWrong: isWrong), in: .rect(cornerRadius: Theme.cardRadius))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cardRadius)
                    .strokeBorder(tileStroke(isMatched: isMatched, isSelected: isSelected, isWrong: isWrong), lineWidth: 1.5)
            }
            .opacity(isMatched ? 0.55 : 1)
        }
        .buttonStyle(.plain)
        .disabled(isMatched)
        .animation(.snappy(duration: 0.2), value: isMatched)
    }

    private func tileFill(isMatched: Bool, isSelected: Bool, isWrong: Bool) -> Color {
        if isWrong { return Theme.redSoft }
        if isMatched { return Theme.greenSoft }
        if isSelected { return Theme.redSoft }
        return .white
    }

    private func tileStroke(isMatched: Bool, isSelected: Bool, isWrong: Bool) -> Color {
        if isWrong { return Theme.red.opacity(0.7) }
        if isMatched { return Theme.green.opacity(0.5) }
        if isSelected { return Theme.red.opacity(0.7) }
        return Theme.hairline
    }

    private func select(_ word: Word, isDari: Bool) {
        if isDari {
            selectedDariID = word.id
            audio.speak(word.dari, audioKey: word.audioKey)
        } else {
            selectedEnglishID = word.id
        }
        UIImpactFeedbackGenerator(style: .light).impactOccurred()

        guard let dariID = selectedDariID, let englishID = selectedEnglishID else { return }

        if dariID == englishID {
            matchedIDs.insert(dariID)
            selectedDariID = nil
            selectedEnglishID = nil
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            if matchedIDs.count == words.count { finish() }
        } else {
            missedIDs.insert(dariID)
            missedIDs.insert(englishID)
            flashWrong(dariID: dariID, englishID: englishID)
        }
    }

    private func flashWrong(dariID: String, englishID: String) {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
        withAnimation(.snappy(duration: 0.15)) { wrongIDs = [dariID, englishID] }

        Task {
            try? await Task.sleep(for: .milliseconds(500))
            withAnimation(.snappy(duration: 0.2)) {
                wrongIDs = []
                selectedDariID = nil
                selectedEnglishID = nil
            }
        }
    }

    private func finish() {
        let missed = missedIDs
        let firstTry = Set(words.map(\.id)).subtracting(missed)
        Task {
            try? await Task.sleep(for: .milliseconds(550))
            onComplete(firstTry, missed)
        }
    }
}

#Preview {
    ExerciseMatchView(words: Array(MockData.colours.words.prefix(4))) { _, _ in }
        .padding(.horizontal, 16)
        .environment(AudioService())
}
