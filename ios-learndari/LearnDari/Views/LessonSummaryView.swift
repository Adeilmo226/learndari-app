import SwiftUI

/// End-of-session recap: what was practised, how accurately, and what it earned.
struct LessonSummaryView: View {
    let session: LessonSession
    let onDone: () -> Void

    @Environment(ProgressStore.self) private var progress

    private var accuracyPercent: Int {
        Int((session.accuracy * 100).rounded())
    }

    var body: some View {
        VStack(spacing: 22) {
            Spacer()

            Image(systemName: session.isFlawless ? "trophy.fill" : "checkmark.seal.fill")
                .font(.system(size: 64))
                .foregroundStyle(Theme.red)
                .symbolEffect(.bounce, value: session.isFinished)

            Text(session.isFlawless ? "Flawless!" : "Lesson complete")
                .font(.largeTitle.bold())
                .foregroundStyle(Theme.ink)

            Text(session.isFlawless
                 ? "Every answer first time. Outstanding."
                 : "You worked through every word — that's how it sticks.")
                .font(.body)
                .foregroundStyle(Theme.secondaryInk)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            HStack(spacing: 12) {
                statTile(value: "\(session.wordsPractisedCount)", label: "Words practised")
                statTile(value: "\(accuracyPercent)%", label: "Accuracy")
                statTile(value: "+\(session.earnedXP)", label: "XP earned")
            }

            HStack(spacing: 6) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(Theme.amber)
                Text("\(progress.streak) day streak")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.secondaryInk)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(Theme.fill, in: .capsule)

            Spacer()

            Button(action: onDone) {
                Text("Continue")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.red)
            .controlSize(.large)
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
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .cardStyle()
    }
}
