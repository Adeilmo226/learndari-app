import Foundation
import PostHog

/// Product analytics.
///
/// Deliberately a small, fixed list of events rather than a firehose — every
/// one here answers a question worth acting on. Nothing sensitive is sent: no
/// answers typed, no names, no tokens. Email is attached only to the person
/// record after they sign in, so a learner can be recognised across devices.
enum Analytics {
    /// Names live in one place so a typo can't silently split a funnel in two.
    enum Event: String {
        case lessonStarted = "lesson_started"
        case lessonFinished = "lesson_finished"
        case lessonAbandoned = "lesson_abandoned"
        case answerCorrect = "answer_correct"
        case answerWrong = "answer_wrong"
        case audioPlayed = "audio_played"
        case paywallSeen = "paywall_seen"
        case planTapped = "plan_tapped"
        case trialStarted = "trial_started"
        case purchaseCompleted = "purchase_completed"
        case purchaseFailed = "purchase_failed"
        case purchasesRestored = "purchases_restored"
        case signedIn = "signed_in"
        case signedOut = "signed_out"
    }

    private static var isEnabled: Bool = false

    static func start() {
        let key = Config.EXPO_PUBLIC_POSTHOG_API_KEY.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !key.isEmpty else { return }

        let host = Config.EXPO_PUBLIC_POSTHOG_HOST.trimmingCharacters(in: .whitespacesAndNewlines)
        let config = PostHogConfig(apiKey: key, host: host.isEmpty ? "https://us.i.posthog.com" : host)
        config.captureApplicationLifecycleEvents = true
        config.captureScreenViews = false

        PostHogSDK.shared.setup(config)
        isEnabled = true
    }

    static func capture(_ event: Event, _ properties: [String: Any] = [:]) {
        guard isEnabled else { return }
        PostHogSDK.shared.capture(event.rawValue, properties: properties)
    }

    /// Ties everything this device has already done to the account they signed into.
    static func identify(userID: String, email: String?, name: String?) {
        guard isEnabled else { return }
        var properties: [String: Any] = [:]
        if let email { properties["email"] = email }
        if let name { properties["name"] = name }
        PostHogSDK.shared.identify(userID, userProperties: properties)
    }

    static func reset() {
        guard isEnabled else { return }
        PostHogSDK.shared.reset()
    }
}
