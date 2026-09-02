//
//  LearnDariApp.swift
//  LearnDari
//

import SwiftUI

@main
struct LearnDariApp: App {
    @Environment(\.scenePhase) private var scenePhase

    @State private var progress = ProgressStore()
    @State private var audio = AudioService()
    @State private var content = ContentService()
    @State private var auth = AuthManager()
    @State private var sync = ProgressSyncService()
    @State private var subscriptions = SubscriptionManager()

    init() {
        Analytics.start()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(progress)
                .environment(audio)
                .environment(content)
                .environment(auth)
                .environment(sync)
                .environment(subscriptions)
                .tint(Theme.red)
                .preferredColorScheme(.light)
                .task {
                    progress.units = content.units
                    subscriptions.configure()
                    await content.refresh()
                }
                .onChange(of: content.units) { _, units in
                    progress.units = units
                }
                .onChange(of: auth.user) { _, user in
                    guard let user else {
                        Analytics.capture(.signedOut)
                        Analytics.reset()
                        Task { await subscriptions.signOut() }
                        return
                    }

                    Analytics.identify(userID: user.id, email: user.email, name: user.name)
                    Analytics.capture(.signedIn)

                    // Signing in folds this device's progress into the account, and
                    // points the subscription at the person rather than the handset.
                    guard let token = auth.accessToken else { return }
                    Task {
                        await subscriptions.identify(userID: user.id)
                        await subscriptions.refreshFromBackend(token: token)
                        await sync.pull(for: user.id, token: token, into: progress)
                    }
                }
                .onChange(of: progress.xp) { _, _ in
                    guard auth.user != nil, let token = auth.accessToken else { return }
                    sync.schedulePush(progress.snapshot, token: token)
                }
                .onChange(of: scenePhase) { _, phase in
                    // Pick up Studio edits whenever the learner returns to the app.
                    if phase == .active {
                        Task { await content.refresh() }
                        Task { await subscriptions.refreshEntitlement() }
                        if let user = auth.user, let token = auth.accessToken {
                            Task {
                                await subscriptions.refreshFromBackend(token: token)
                                await sync.pull(for: user.id, token: token, into: progress)
                            }
                        }
                    }
                }
        }
    }
}
