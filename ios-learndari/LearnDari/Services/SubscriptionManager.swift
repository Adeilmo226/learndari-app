import Foundation
import Observation
import RevenueCat

/// Owns everything about whether this learner has paid.
///
/// Two sources agree on access: RevenueCat (instant, so a purchase unlocks the
/// app before any network round-trip) and our own backend (authoritative, and
/// the thing the website will read too). Either one saying yes is enough,
/// because the alternative is a paying customer briefly locked out.
@Observable
final class SubscriptionManager {
    /// The entitlement configured in the RevenueCat dashboard.
    static let entitlementID = "plus"

    private(set) var isSubscribed: Bool = false
    private(set) var isTrial: Bool = false
    private(set) var expiresAt: Date?
    private(set) var packages: [Package] = []
    private(set) var isLoadingOffering: Bool = false
    private(set) var isPurchasing: Bool = false

    var errorMessage: String = ""
    var showError: Bool = false

    private var isConfigured: Bool = false

    /// How many lessons a brand-new learner may finish before the paywall.
    /// Reviewers need to see the product work, and people who have felt the
    /// app convert far better than people staring at a price.
    static let freeLessonAllowance: Int = 1

    /// Whether the learner may open another lesson.
    ///
    /// Subscribers always can. Everyone else gets the free allowance first, so
    /// the paywall arrives after they have felt the product rather than before.
    func canOpenLesson(completedLessonCount: Int) -> Bool {
        isSubscribed || completedLessonCount < Self.freeLessonAllowance
    }

    // MARK: - Lifecycle

    func configure() {
        let key = Config.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !key.isEmpty else { return }

        Purchases.logLevel = .warn
        Purchases.configure(withAPIKey: key)
        isConfigured = true

        Task {
            await refreshEntitlement()
            await loadOffering()
        }
    }

    /// Points purchases at the signed-in account so the receipt follows the
    /// person to their next phone — and so billing webhooks land on the right row.
    func identify(userID: String) async {
        guard isConfigured else { return }
        _ = try? await Purchases.shared.logIn(userID)
        await refreshEntitlement()
    }

    func signOut() async {
        guard isConfigured else { return }
        _ = try? await Purchases.shared.logOut()
        await refreshEntitlement()
    }

    // MARK: - Offerings

    func loadOffering() async {
        guard isConfigured, packages.isEmpty else { return }
        isLoadingOffering = true
        defer { isLoadingOffering = false }

        do {
            let offerings = try await Purchases.shared.offerings()
            guard let current = offerings.current else { return }
            // Yearly first: it is the plan we recommend, and the paywall reads top-down.
            packages = current.availablePackages.sorted { lhs, rhs in
                rank(of: lhs) < rank(of: rhs)
            }
        } catch {
            // A missing offering is a dashboard configuration problem, not something
            // the learner can act on, so the paywall simply shows its unavailable state.
            print("Could not load subscription plans: \(error.localizedDescription)")
        }
    }

    private func rank(of package: Package) -> Int {
        switch package.packageType {
        case .annual: return 0
        case .monthly: return 1
        default: return 2
        }
    }

    // MARK: - Purchasing

    /// Returns true when the learner came away with access.
    @discardableResult
    func purchase(_ package: Package) async -> Bool {
        guard isConfigured else { return false }
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            let result = try await Purchases.shared.purchase(package: package)
            if result.userCancelled {
                return false
            }
            apply(result.customerInfo)

            let isIntroOffer = package.storeProduct.introductoryDiscount != nil
            Analytics.capture(
                isIntroOffer ? .trialStarted : .purchaseCompleted,
                ["product_id": package.storeProduct.productIdentifier,
                 "plan": package.packageType == .annual ? "yearly" : "monthly"]
            )
            return isSubscribed
        } catch {
            errorMessage = "That purchase didn't go through. You have not been charged."
            showError = true
            Analytics.capture(.purchaseFailed, ["reason": (error as NSError).code])
            return false
        }
    }

    /// Apple requires a way back for people who already paid and reinstalled.
    @discardableResult
    func restore() async -> Bool {
        guard isConfigured else { return false }
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            let info = try await Purchases.shared.restorePurchases()
            apply(info)
            Analytics.capture(.purchasesRestored, ["found": isSubscribed])
            if !isSubscribed {
                errorMessage = "We couldn't find a subscription on this Apple Account."
                showError = true
            }
            return isSubscribed
        } catch {
            errorMessage = "We couldn't reach the App Store. Please try again."
            showError = true
            return false
        }
    }

    // MARK: - Entitlement

    func refreshEntitlement() async {
        guard isConfigured else { return }
        guard let info = try? await Purchases.shared.customerInfo() else { return }
        apply(info)
    }

    private func apply(_ info: CustomerInfo) {
        let entitlement = info.entitlements[Self.entitlementID]
        isSubscribed = entitlement?.isActive ?? false
        isTrial = entitlement?.periodType == .trial
        expiresAt = entitlement?.expirationDate
    }

    /// Confirms access against our own backend, which is what the website will
    /// read as well. Trusted over the device when it says yes.
    func refreshFromBackend(token: String) async {
        let raw = Config.EXPO_PUBLIC_RORK_FUNCTIONS_URL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !raw.isEmpty, let base = URL(string: raw) else { return }

        var request = URLRequest(url: base.appendingPathComponent("me/subscription"))
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else { return }
            let status = try JSONDecoder().decode(RemoteSubscription.self, from: data)
            if status.isActive {
                isSubscribed = true
                isTrial = status.isTrial
            }
        } catch {
            // Offline: whatever the device already knows stands.
        }
    }
}

private nonisolated struct RemoteSubscription: Decodable {
    let isActive: Bool
    let status: String
    let isTrial: Bool
}
