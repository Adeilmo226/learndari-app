import SwiftUI

/// Tab 5 — learner stats, subscription and settings.
struct ProfileView: View {
    @Environment(ProgressStore.self) private var progress
    @Environment(AudioService.self) private var audio
    @Environment(AuthManager.self) private var auth
    @Environment(ProgressSyncService.self) private var sync
    @Environment(SubscriptionManager.self) private var subscriptions

    @State private var isEditingName: Bool = false
    @State private var draftName: String = ""
    @State private var isUpgradePresented: Bool = false
    @State private var isDeleteConfirmPresented: Bool = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    profileHeader
                    statsRow
                    levelCard
                    courseProgressCard
                    signInCard
                    subscriptionCard
                    settingsCard
                    accountCard
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
            .background(Color.white)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { LogoToolbar() }
            .alert("Your name", isPresented: $isEditingName) {
                TextField("Name", text: $draftName)
                Button("Save") {
                    let trimmed = draftName.trimmingCharacters(in: .whitespacesAndNewlines)
                    if !trimmed.isEmpty { progress.learnerName = trimmed }
                }
                Button("Cancel", role: .cancel) {}
            }
            .sheet(isPresented: $isUpgradePresented) {
                PaywallView(source: "profile")
            }
            .alert("Delete account?", isPresented: $isDeleteConfirmPresented) {
                Button("Delete", role: .destructive) {
                    Task {
                        if let token = auth.accessToken {
                            await sync.deleteRemote(token: token)
                        }
                        progress.deleteAccount()
                        sync.reset()
                        await auth.signOut()
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This permanently removes your profile, streak and lesson progress. This cannot be undone.")
            }
        }
    }

    private var profileHeader: some View {
        HStack(spacing: 14) {
            Text(String(progress.learnerName.prefix(1)).uppercased())
                .font(.title.bold())
                .foregroundStyle(.white)
                .frame(width: 64, height: 64)
                .background(Theme.red, in: .circle)

            VStack(alignment: .leading, spacing: 4) {
                Text(progress.learnerName)
                    .font(.title2.bold())
                    .foregroundStyle(Theme.ink)
                Text(planLabel)
                    .font(.subheadline)
                    .foregroundStyle(Theme.secondaryInk)
            }

            Spacer(minLength: 0)

            Button {
                draftName = progress.learnerName
                isEditingName = true
            } label: {
                Image(systemName: "pencil")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.red)
                    .frame(width: 40, height: 40)
                    .background(Theme.redSoft, in: .circle)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Edit name")
        }
        .padding(16)
        .cardStyle()
        .padding(.top, 8)
    }

    private var planLabel: String {
        if subscriptions.isTrial { return "LearnDari Plus · free trial" }
        return subscriptions.isSubscribed ? "LearnDari Plus" : "Free plan"
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            statTile(
                value: "\(progress.streak)",
                label: "Day streak",
                systemImage: "flame.fill",
                tint: Theme.red
            )
            statTile(
                value: "\(progress.wordsLearned)",
                label: "Words learned",
                systemImage: "character.book.closed.fill",
                tint: Theme.green
            )
            statTile(
                value: "\(progress.xp)",
                label: "Total XP",
                systemImage: "bolt.fill",
                tint: Theme.amber
            )
        }
    }

    private func statTile(value: String, label: String, systemImage: String, tint: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: systemImage)
                .font(.title3)
                .foregroundStyle(tint)
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

    private var levelCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text("Level \(progress.level)")
                    .font(.headline)
                    .foregroundStyle(Theme.ink)
                Spacer()
                Text("\(progress.xpIntoLevel) / \(ProgressStore.xpPerLevel) XP")
                    .font(.subheadline.monospacedDigit())
                    .foregroundStyle(Theme.secondaryInk)
            }

            ProgressView(value: progress.levelProgress)
                .tint(Theme.amber)
                .scaleEffect(x: 1, y: 1.5, anchor: .center)

            Text("\(progress.xpToNextLevel) XP to level \(progress.level + 1)")
                .font(.footnote)
                .foregroundStyle(Theme.mutedInk)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var courseProgressCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Course progress")
                    .font(.headline)
                    .foregroundStyle(Theme.ink)
                Spacer()
                Text("\(progress.completedLessonCount) / \(progress.totalLessonCount) lessons")
                    .font(.subheadline.monospacedDigit())
                    .foregroundStyle(Theme.secondaryInk)
            }
            ProgressView(value: progress.overallProgress)
                .tint(Theme.red)
                .scaleEffect(x: 1, y: 1.5, anchor: .center)
            Text(nextUpText)
                .font(.footnote)
                .foregroundStyle(Theme.mutedInk)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var nextUpText: String {
        guard let lesson = progress.currentLesson else {
            return "You've finished every lesson available. More are on the way."
        }
        return "Next up: \(lesson.title)"
    }

    /// Sign-in, or the signed-in account and what syncing means.
    @ViewBuilder
    private var signInCard: some View {
        @Bindable var authManager = auth

        if let user = auth.user {
            VStack(spacing: 0) {
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.icloud.fill")
                        .font(.subheadline)
                        .foregroundStyle(Theme.green)
                        .frame(width: 30, height: 30)
                        .background(Theme.greenSoft, in: .rect(cornerRadius: 8))

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Progress is syncing")
                            .font(.body)
                            .foregroundStyle(Theme.ink)
                        Text(user.email)
                            .font(.footnote)
                            .foregroundStyle(Theme.secondaryInk)
                    }

                    Spacer(minLength: 0)

                    if sync.isSyncing {
                        ProgressView().controlSize(.small)
                    }
                }
                .padding(16)

                Divider().padding(.leading, 58)

                Button {
                    Task {
                        sync.reset()
                        await auth.signOut()
                    }
                } label: {
                    HStack {
                        settingLabel("Sign out", systemImage: "rectangle.portrait.and.arrow.right")
                        Spacer()
                    }
                    .padding(16)
                    .contentShape(.rect)
                }
                .buttonStyle(.plain)
            }
            .cardStyle()
            .alert("Sign-in problem", isPresented: $authManager.showError) {
                Button("OK") {}
            } message: {
                Text(auth.errorMessage)
            }
        } else {
            VStack(alignment: .leading, spacing: 12) {
                Text("Save your progress")
                    .font(.headline)
                    .foregroundStyle(Theme.ink)

                Text("Sign in and your lessons, XP and streak follow you between your phone and learndari.com. Everything you've done so far comes with you.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.secondaryInk)
                    .fixedSize(horizontal: false, vertical: true)

                VStack(spacing: 10) {
                    Button {
                        Task { await auth.signIn(provider: "apple") }
                    } label: {
                        Label("Continue with Apple", systemImage: "apple.logo")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                            .background(Theme.ink, in: .capsule)
                    }
                    .buttonStyle(.plain)

                    Button {
                        Task { await auth.signIn(provider: "google") }
                    } label: {
                        Label("Continue with Google", systemImage: "globe")
                            .font(.headline)
                            .foregroundStyle(Theme.ink)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                            .background(Theme.fill, in: .capsule)
                    }
                    .buttonStyle(.plain)
                }
                .disabled(auth.isSigningIn)
                .opacity(auth.isSigningIn ? 0.6 : 1)

                if auth.isSigningIn {
                    HStack(spacing: 8) {
                        ProgressView().controlSize(.small)
                        Text("Opening sign-in…")
                            .font(.footnote)
                            .foregroundStyle(Theme.secondaryInk)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardStyle()
            .alert("Sign-in problem", isPresented: $authManager.showError) {
                Button("OK") {}
            } message: {
                Text(auth.errorMessage)
            }
        }
    }

    @ViewBuilder
    private var subscriptionCard: some View {
        if subscriptions.isSubscribed {
            VStack(spacing: 0) {
                HStack(spacing: 14) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.title2)
                        .foregroundStyle(Theme.green)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(subscriptions.isTrial ? "Free trial active" : "LearnDari Plus active")
                            .font(.headline)
                            .foregroundStyle(Theme.ink)
                        Text(renewalText)
                            .font(.subheadline)
                            .foregroundStyle(Theme.secondaryInk)
                    }
                    Spacer(minLength: 0)
                }
                .padding(18)

                Divider().padding(.leading, 18)

                // Apple requires a route to manage and cancel from inside the app.
                Link(destination: URL(string: "https://apps.apple.com/account/subscriptions")!) {
                    HStack {
                        settingLabel("Manage subscription", systemImage: "creditcard.fill")
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(Theme.mutedInk)
                    }
                    .padding(16)
                    .contentShape(.rect)
                }
            }
            .cardStyle()
        } else {
            VStack(alignment: .leading, spacing: 12) {
                Text("UPGRADE")
                    .font(.caption.weight(.bold))
                    .kerning(0.6)
                    .foregroundStyle(.white.opacity(0.9))

                Text("Unlock the full course")
                    .font(.title3.bold())
                    .foregroundStyle(.white)

                Text("Every lesson, flashcard deck and quiz, with real Afghan pronunciation. Starts with a free trial.")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.95))
                    .fixedSize(horizontal: false, vertical: true)

                Button {
                    isUpgradePresented = true
                } label: {
                    Text("See plans")
                        .font(.headline)
                        .foregroundStyle(Theme.red)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 13)
                        .background(.white, in: .capsule)
                }
                .buttonStyle(.plain)
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.featuredGradient, in: .rect(cornerRadius: Theme.featuredRadius))
            .shadow(color: Theme.red.opacity(0.18), radius: 14, y: 6)
        }
    }

    private var settingsCard: some View {
        @Bindable var audioService = audio
        @Bindable var store = progress

        return VStack(spacing: 0) {
            Toggle(isOn: $store.notificationsEnabled) {
                settingLabel("Daily reminders", systemImage: "bell.fill")
            }
            .tint(Theme.red)
            .padding(16)

            Divider().padding(.leading, 58)

            Toggle(isOn: $audioService.isSoundEnabled) {
                settingLabel("Pronunciation audio", systemImage: "speaker.wave.2.fill")
            }
            .tint(Theme.red)
            .padding(16)

            Divider().padding(.leading, 58)

            Link(destination: URL(string: "https://learndari.com")!) {
                HStack {
                    settingLabel("Help & support", systemImage: "questionmark.circle.fill")
                    Spacer()
                    Image(systemName: "arrow.up.right")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(Theme.mutedInk)
                }
                .padding(16)
                .contentShape(.rect)
            }

        }
        .cardStyle()
    }

    private var accountCard: some View {
        VStack(spacing: 0) {
            Button {
                progress.resetProgress()
            } label: {
                HStack {
                    settingLabel("Reset progress", systemImage: "arrow.counterclockwise")
                    Spacer()
                }
                .padding(16)
                .contentShape(.rect)
            }
            .buttonStyle(.plain)

            Divider().padding(.leading, 58)

            Button {
                isDeleteConfirmPresented = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "trash.fill")
                        .font(.subheadline)
                        .foregroundStyle(Theme.red)
                        .frame(width: 30, height: 30)
                        .background(Theme.redSoft, in: .rect(cornerRadius: 8))
                    Text("Delete account")
                        .font(.body)
                        .foregroundStyle(Theme.red)
                    Spacer()
                }
                .padding(16)
                .contentShape(.rect)
            }
            .buttonStyle(.plain)
        }
        .cardStyle()
    }

    private func settingLabel(_ title: String, systemImage: String, tint: Color = Theme.secondaryInk) -> some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .font(.subheadline)
                .foregroundStyle(tint)
                .frame(width: 30, height: 30)
                .background(Theme.fill, in: .rect(cornerRadius: 8))
            Text(title)
                .font(.body)
                .foregroundStyle(Theme.ink)
        }
    }
}

// MARK: - Renewal copy

extension ProfileView {
    fileprivate var renewalText: String {
        guard let expiry = subscriptions.expiresAt else {
            return "Every vocab set and lesson unlocked"
        }
        let date = expiry.formatted(date: .abbreviated, time: .omitted)
        return subscriptions.isTrial ? "Your trial runs until \(date)" : "Renews \(date)"
    }
}

#Preview {
    ProfileView()
        .environment(ProgressStore())
        .environment(AudioService())
        .environment(SubscriptionManager())
}
