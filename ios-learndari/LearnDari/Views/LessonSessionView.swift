import SwiftUI

/// The practice half of a lesson: a mixed queue of exercises that keeps going
/// until every item has been answered correctly, then a summary.
struct LessonSessionView: View {
    let lesson: Lesson
    let milestoneWords: [Word]
    let corpus: [Word]
    /// Called with true when the learner worked the queue all the way down.
    var onFinish: ((Bool) -> Void)?

    @Environment(ProgressStore.self) private var progress
    @Environment(\.dismiss) private var dismiss

    @State private var session: LessonSession?
    @State private var floatingXP: Int?

    var body: some View {
        NavigationStack {
            Group {
                if let session {
                    if session.isFinished {
                        LessonSummaryView(session: session) { finish(completed: true) }
                    } else {
                        practice(session)
                    }
                } else {
                    ProgressView()
                }
            }
            .background(Color.white)
            .navigationTitle(lesson.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(session?.isFinished == true ? "Done" : "Close") {
                        finish(completed: session?.isFinished == true)
                    }
                    .tint(Theme.red)
                }
            }
        }
        .onAppear {
            if session == nil {
                session = LessonSession(
                    lesson: lesson,
                    milestoneWords: milestoneWords,
                    corpus: corpus,
                    progress: progress
                )
                Analytics.capture(.lessonStarted, [
                    "lesson_id": lesson.id,
                    "lesson_title": lesson.title,
                    "word_count": lesson.words.count,
                ])
            }
        }
    }

    private func practice(_ session: LessonSession) -> some View {
        VStack(spacing: 18) {
            header(session)

            if let exercise = session.current {
                Group {
                    switch exercise.kind {
                    case .matchPairs:
                        ExerciseMatchView(words: exercise.pairs) { firstTry, missed in
                            let gained = session.earnedXP
                            session.submitMatch(firstTryCorrect: firstTry, missed: missed)
                            popXP(session.earnedXP - gained)
                        }
                    case .multipleChoice, .listening:
                        ExerciseChoiceView(exercise: exercise) { correct in
                            let gained = session.earnedXP
                            Analytics.capture(correct ? .answerCorrect : .answerWrong, [
                                "lesson_id": lesson.id,
                                "word_id": exercise.item.word.id,
                                "exercise": exercise.kind == .listening ? "listening" : "multiple_choice",
                                "is_review": exercise.item.isReview,
                            ])
                            withAnimation(.snappy(duration: 0.25)) { session.submit(correct: correct) }
                            popXP(session.earnedXP - gained)
                        }
                    }
                }
                .id(exercise.id)
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .move(edge: .leading).combined(with: .opacity)
                ))
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 16)
    }

    private func header(_ session: LessonSession) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if session.current?.item.isReview == true {
                    TagPill(text: "Review", systemImage: "arrow.triangle.2.circlepath")
                } else {
                    Text(lesson.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(Theme.mutedInk)
                }

                Spacer()

                ZStack(alignment: .trailing) {
                    Text("+\(session.earnedXP) XP")
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

            ProgressView(value: session.progressFraction)
                .tint(Theme.red)
                .scaleEffect(x: 1, y: 1.4, anchor: .center)
                .animation(.snappy(duration: 0.3), value: session.progressFraction)
        }
        .padding(.top, 8)
    }

    private func popXP(_ amount: Int) {
        guard amount > 0 else { return }
        withAnimation(.snappy(duration: 0.3)) { floatingXP = amount }
        Task {
            try? await Task.sleep(for: .milliseconds(700))
            withAnimation(.easeOut(duration: 0.25)) { floatingXP = nil }
        }
    }

    private func finish(completed: Bool) {
        // Where people give up is the single most useful thing to know, so an
        // abandoned lesson reports how far in they got.
        Analytics.capture(completed ? .lessonFinished : .lessonAbandoned, [
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "xp_earned": session?.earnedXP ?? 0,
            "progress": Int((session?.progressFraction ?? 0) * 100),
        ])
        onFinish?(completed)
        dismiss()
    }
}

#Preview {
    LessonSessionView(
        lesson: MockData.units[2].lessons[2],
        milestoneWords: MockData.units[2].lessons.flatMap(\.words),
        corpus: MockData.units.flatMap(\.lessons).flatMap(\.words)
    )
    .environment(ProgressStore())
    .environment(AudioService())
}
