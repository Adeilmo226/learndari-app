import SwiftUI

/// Tab 1 — a winding, game-style lesson path: unit banners, zigzagging nodes
/// and a trophy review at the end of every unit.
struct LearnView: View {
    @Environment(ProgressStore.self) private var progress
    @Environment(ContentService.self) private var content
    @Environment(SubscriptionManager.self) private var subscriptions

    @State private var path: [Lesson] = []
    @State private var reviewUnit: LearnUnit?
    @State private var guidebookUnit: LearnUnit?
    @State private var toast: String?
    @State private var paywallSource: String?

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                    ForEach(content.units) { unit in
                        Section {
                            UnitPath(
                                unit: unit,
                                onLesson: openLesson,
                                onReview: { openReview(unit) },
                                onLocked: showToast
                            )
                        } header: {
                            UnitBanner(unit: unit) { guidebookUnit = unit }
                        }
                    }

                    horizonMarker
                }
                .padding(.bottom, 40)
            }
            .background(Color.white)
            .safeAreaInset(edge: .top, spacing: 0) { statsStrip }
            .overlay(alignment: .bottom) { toastView }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { LogoToolbar() }
            .navigationDestination(for: Lesson.self) { LessonView(lesson: $0) }
            .fullScreenCover(item: $reviewUnit) { unit in
                QuizView(title: "\(unit.title) review", words: unit.lessons.flatMap(\.words)) { _, _ in }
            }
            .sheet(item: $guidebookUnit) { unit in
                UnitGuidebook(unit: unit)
            }
            .sheet(item: $paywallSource) { source in
                PaywallView(source: source)
            }
        }
    }

    // MARK: - Top stats

    private var statsStrip: some View {
        HStack(spacing: 10) {
            statChip(systemImage: "flame.fill", value: "\(progress.streak)", tint: Theme.red)
            statChip(systemImage: "bolt.fill", value: "\(progress.xp)", tint: Theme.amber)
            statChip(systemImage: "character.book.closed.fill", value: "\(progress.wordsLearned)", tint: Theme.green)
            statChip(
                systemImage: "checkmark.seal.fill",
                value: "\(progress.completedLessonCount)/\(progress.totalLessonCount)",
                tint: Theme.ink
            )
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(.white)
        .overlay(alignment: .bottom) {
            Rectangle().fill(Theme.hairline).frame(height: 1)
        }
    }

    private func statChip(systemImage: String, value: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: systemImage)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(tint)
            Text(value)
                .font(.subheadline.weight(.bold).monospacedDigit())
                .foregroundStyle(Theme.ink)
                .contentTransition(.numericText())
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Theme.fill, in: .capsule)
    }

    private var horizonMarker: some View {
        VStack(spacing: 10) {
            Image(systemName: "mountain.2.fill")
                .font(.title)
                .foregroundStyle(Theme.mutedInk.opacity(0.5))
            Text("More units on the way")
                .font(.footnote.weight(.medium))
                .foregroundStyle(Theme.mutedInk)
        }
        .padding(.top, 28)
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private var toastView: some View {
        if let toast {
            Text(toast)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
                .padding(.horizontal, 18)
                .padding(.vertical, 12)
                .background(Theme.ink.opacity(0.92), in: .capsule)
                .padding(.bottom, 16)
                .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }

    // MARK: - Actions

    private func openLesson(_ lesson: Lesson) {
        guard subscriptions.canOpenLesson(completedLessonCount: progress.completedLessonCount) else {
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
            paywallSource = "lesson"
            return
        }
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        path.append(lesson)
    }

    private func openReview(_ unit: LearnUnit) {
        guard subscriptions.canOpenLesson(completedLessonCount: progress.completedLessonCount) else {
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
            paywallSource = "unit_review"
            return
        }
        UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
        reviewUnit = unit
    }

    private func showToast(_ message: String) {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
        withAnimation(.snappy(duration: 0.25)) { toast = message }
        Task {
            try? await Task.sleep(for: .seconds(2))
            withAnimation(.easeOut(duration: 0.25)) { toast = nil }
        }
    }
}

// MARK: - Unit banner

private struct UnitBanner: View {
    let unit: LearnUnit
    let onGuidebook: () -> Void

    @Environment(ProgressStore.self) private var progress

    private var isActive: Bool {
        unit.lessons.contains { progress.state(for: $0) == .current }
    }

    private var isComplete: Bool {
        unit.lessons.allSatisfy { progress.state(for: $0) == .completed }
    }

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text("UNIT \(unit.index)")
                    .font(.caption.weight(.heavy))
                    .kerning(0.8)
                    .foregroundStyle(foreground.opacity(0.85))
                Text(unit.title)
                    .font(.title3.bold())
                    .foregroundStyle(foreground)
                    .multilineTextAlignment(.leading)
            }

            Spacer(minLength: 0)

            Rectangle()
                .fill(foreground.opacity(0.28))
                .frame(width: 1, height: 40)

            Button(action: onGuidebook) {
                Image(systemName: "list.bullet.rectangle.portrait.fill")
                    .font(.title3)
                    .foregroundStyle(foreground)
                    .frame(width: 44, height: 44)
                    .contentShape(.rect)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Unit contents")
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
        .background(background, in: .rect(cornerRadius: Theme.featuredRadius))
        .overlay {
            if !isActive && !isComplete {
                RoundedRectangle(cornerRadius: Theme.featuredRadius)
                    .strokeBorder(Theme.hairline, lineWidth: 1)
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 18)
        .padding(.bottom, 10)
        .background(.white)
    }

    private var foreground: Color {
        isActive || isComplete ? .white : Theme.secondaryInk
    }

    private var background: AnyShapeStyle {
        if isActive { return AnyShapeStyle(Theme.featuredGradient) }
        if isComplete { return AnyShapeStyle(Theme.green) }
        return AnyShapeStyle(Theme.fill)
    }
}

// MARK: - The winding path

private struct UnitPath: View {
    let unit: LearnUnit
    let onLesson: (Lesson) -> Void
    let onReview: () -> Void
    let onLocked: (String) -> Void

    @Environment(ProgressStore.self) private var progress

    /// Repeating zigzag so the path snakes down the screen like a board game.
    private static let sway: [CGFloat] = [0, -54, -84, -54, 0, 54, 84, 54]

    private var isUnitComplete: Bool {
        unit.lessons.allSatisfy { progress.state(for: $0) == .completed }
    }

    var body: some View {
        VStack(spacing: 12) {
            ForEach(Array(unit.lessons.enumerated()), id: \.element.id) { index, lesson in
                let state = progress.state(for: lesson)

                PathNode(
                    glyph: glyph(for: index, state: state),
                    label: lesson.title,
                    state: state,
                    isTrophy: false,
                    showStartBubble: state == .current
                ) {
                    if state == .locked {
                        onLocked("Finish the lesson before this one first")
                    } else {
                        onLesson(lesson)
                    }
                }
                .offset(x: Self.sway[index % Self.sway.count])
                .overlay(alignment: index.isMultiple(of: 2) ? .trailing : .leading) {
                    decoration(for: index)
                }
            }

            PathNode(
                glyph: "trophy.fill",
                label: "\(unit.title) review",
                state: isUnitComplete ? .current : .locked,
                isTrophy: true,
                showStartBubble: false
            ) {
                if isUnitComplete {
                    onReview()
                } else {
                    onLocked("Complete every lesson in this unit to unlock the trophy")
                }
            }
            .padding(.top, 4)
        }
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity)
    }

    private func glyph(for index: Int, state: LessonState) -> String {
        if state == .completed { return "checkmark" }
        if state == .locked { return "lock.fill" }
        return index.isMultiple(of: 3) ? "book.fill" : "star.fill"
    }

    /// A soft emoji marker off to the side of the path — pure decoration, like a landmark.
    @ViewBuilder
    private func decoration(for index: Int) -> some View {
        if index == 1 {
            Text(Self.landmarks[(unit.index - 1) % Self.landmarks.count])
                .font(.system(size: 34))
                .frame(width: 62, height: 62)
                .background(Theme.fill, in: .circle)
                .offset(x: index.isMultiple(of: 2) ? 96 : -96)
                .allowsHitTesting(false)
        }
    }

    private static let landmarks: [String] = ["🕌", "🫖", "🏔️", "🪁", "🧿", "🍇", "🐫", "📜"]
}

// MARK: - A single node

private struct PathNode: View {
    let glyph: String
    let label: String
    let state: LessonState
    let isTrophy: Bool
    let showStartBubble: Bool
    let action: () -> Void

    @State private var bubbleLift: Bool = false
    @State private var haloPulse: Bool = false

    private var diameter: CGFloat { isTrophy ? 82 : 74 }

    var body: some View {
        VStack(spacing: 8) {
            if showStartBubble {
                startBubble
            }

            Button(action: action) {
                ZStack {
                    Circle()
                        .fill(baseColour)
                        .frame(width: diameter, height: diameter)
                        .offset(y: 7)

                    if state == .current && !isTrophy {
                        Circle()
                            .stroke(Theme.red.opacity(0.3), lineWidth: 5)
                            .frame(width: diameter, height: diameter)
                            .scaleEffect(haloPulse ? 1.4 : 1.0)
                            .opacity(haloPulse ? 0 : 1)
                    }

                    Circle()
                        .fill(faceColour)
                        .frame(width: diameter, height: diameter)
                        .overlay {
                            Circle()
                                .strokeBorder(.white.opacity(state == .locked ? 0 : 0.35), lineWidth: 2)
                                .padding(6)
                                .blur(radius: 1)
                        }

                    Image(systemName: glyph)
                        .font(.system(size: isTrophy ? 34 : 29, weight: .heavy))
                        .foregroundStyle(state == .locked ? Theme.mutedInk : .white)
                }
                .frame(width: diameter, height: diameter + 7)
                .contentShape(.circle)
            }
            .buttonStyle(NodePressStyle())
            .accessibilityLabel(label)
            .accessibilityHint(state == .locked ? "Locked" : "Opens \(label)")
        }
        .onAppear {
            guard state == .current else { return }
            withAnimation(.easeOut(duration: 1.5).repeatForever(autoreverses: false)) { haloPulse = true }
            withAnimation(.easeInOut(duration: 0.85).repeatForever(autoreverses: true)) { bubbleLift = true }
        }
    }

    private var startBubble: some View {
        Text(isTrophy ? "REVIEW" : "START")
            .font(.caption.weight(.heavy))
            .kerning(0.8)
            .foregroundStyle(Theme.red)
            .padding(.horizontal, 16)
            .padding(.vertical, 9)
            .background(.white, in: .capsule)
            .overlay { Capsule().strokeBorder(Theme.hairline, lineWidth: 1.5) }
            .shadow(color: .black.opacity(0.08), radius: 6, y: 3)
            .offset(y: bubbleLift ? -3 : 2)
    }

    private var faceColour: Color {
        if isTrophy { return state == .locked ? Theme.fill : Theme.amber }
        switch state {
        case .completed: return Theme.green
        case .current: return Theme.red
        case .locked: return Theme.fill
        }
    }

    private var baseColour: Color {
        if state == .locked { return Theme.hairline }
        return faceColour.mix(with: .black, by: 0.22)
    }
}

/// Presses the node into its shadow, like a physical button.
private struct NodePressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .offset(y: configuration.isPressed ? 5 : 0)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.snappy(duration: 0.12), value: configuration.isPressed)
    }
}

// MARK: - Guidebook

private struct UnitGuidebook: View {
    let unit: LearnUnit

    @Environment(ProgressStore.self) private var progress
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(unit.lessons) { lesson in
                        let state = progress.state(for: lesson)

                        HStack(spacing: 14) {
                            Image(systemName: state == .completed ? "checkmark.circle.fill" : state == .current ? "play.circle.fill" : "lock.circle.fill")
                                .font(.title2)
                                .foregroundStyle(state == .completed ? Theme.green : state == .current ? Theme.red : Theme.mutedInk)

                            VStack(alignment: .leading, spacing: 3) {
                                Text(lesson.title)
                                    .font(.headline)
                                    .foregroundStyle(Theme.ink)
                                Text(lesson.subtitle)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.secondaryInk)
                            }

                            Spacer(minLength: 0)

                            Text("\(lesson.words.count)")
                                .font(.subheadline.bold().monospacedDigit())
                                .foregroundStyle(Theme.mutedInk)
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .background(Color.white)
            .navigationTitle(unit.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.red)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationContentInteraction(.scrolls)
    }
}

/// Lets a plain source string drive a sheet.
extension String: @retroactive Identifiable {
    public var id: String { self }
}

#Preview {
    LearnView()
        .environment(ProgressStore())
        .environment(AudioService())
        .environment(SubscriptionManager())
}
