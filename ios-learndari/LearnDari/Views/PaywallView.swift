import SwiftUI
import RevenueCat

/// The paywall: artwork, then why it's worth it, then the two plans, then one button.
///
/// Prices and trial length are read from the App Store rather than hardcoded, so
/// the screen is always truthful in every currency — and because stating renewal
/// terms wrongly is a reliable way to get rejected.
struct PaywallView: View {
    /// Where the learner hit the wall, so the funnel can be read per entry point.
    let source: String

    @Environment(\.dismiss) private var dismiss
    @Environment(SubscriptionManager.self) private var store
    @Environment(AuthManager.self) private var auth

    @State private var selected: Package?
    @State private var appeared: Bool = false

    var body: some View {
        @Bindable var subscriptions = store

        ScrollView {
            VStack(spacing: 0) {
                artwork
                VStack(spacing: 20) {
                    headline
                    benefits
                    plans
                    callToAction
                    terms
                }
                .padding(.horizontal, 20)
                .padding(.top, 22)
                .padding(.bottom, 28)
            }
        }
        .background(Color.white)
        .scrollIndicators(.hidden)
        .overlay(alignment: .topTrailing) { closeButton }
        .task {
            await store.loadOffering()
            if selected == nil {
                selected = store.packages.first { $0.packageType == .annual } ?? store.packages.first
            }
            withAnimation(.smooth(duration: 0.5)) { appeared = true }
            Analytics.capture(.paywallSeen, ["source": source])
        }
        .onChange(of: store.packages) { _, packages in
            if selected == nil {
                selected = packages.first { $0.packageType == .annual } ?? packages.first
            }
        }
        .onChange(of: store.isSubscribed) { _, isSubscribed in
            if isSubscribed { dismiss() }
        }
        .alert("Something went wrong", isPresented: $subscriptions.showError) {
            Button("OK") {}
        } message: {
            Text(store.errorMessage)
        }
    }

    // MARK: - Artwork

    private var artwork: some View {
        Color(Theme.redSoft)
            .frame(height: 240)
            .overlay {
                Image("afghan_tea_ceremony")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .allowsHitTesting(false)
            }
            .overlay(alignment: .bottom) {
                // Melts the artwork into the page rather than ending on a hard seam.
                LinearGradient(
                    colors: [.white.opacity(0), .white],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 70)
            }
            .clipped()
            .ignoresSafeArea(edges: .top)
    }

    private var closeButton: some View {
        Button {
            dismiss()
        } label: {
            Image(systemName: "xmark")
                .font(.footnote.weight(.bold))
                .foregroundStyle(Theme.ink)
                .frame(width: 32, height: 32)
                .background(.white.opacity(0.85), in: .circle)
                .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
        }
        .buttonStyle(.plain)
        .padding(.trailing, 18)
        .padding(.top, 8)
        .accessibilityLabel("Close")
    }

    // MARK: - Copy

    private var headline: some View {
        VStack(spacing: 8) {
            Text("دری")
                .font(.system(size: 40, weight: .bold))
                .foregroundStyle(Theme.red)

            Text("Learn Dari properly")
                .font(.largeTitle.bold())
                .foregroundStyle(Theme.ink)
                .multilineTextAlignment(.center)

            Text("Every unit, every word, spoken by real Afghan voices.")
                .font(.subheadline)
                .foregroundStyle(Theme.secondaryInk)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var benefits: some View {
        VStack(alignment: .leading, spacing: 14) {
            benefit("Every unit and lesson unlocked", icon: "graduationcap.fill")
            benefit("Real Afghan pronunciation on every word", icon: "waveform")
            benefit("Flashcards, quizzes and spaced review", icon: "rectangle.on.rectangle.angled")
            benefit("Your streak follows you to any device", icon: "flame.fill")
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private func benefit(_ text: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.red)
                .frame(width: 28, height: 28)
                .background(Theme.redSoft, in: .circle)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }

    // MARK: - Plans

    @ViewBuilder
    private var plans: some View {
        if store.packages.isEmpty {
            VStack(spacing: 10) {
                if store.isLoadingOffering {
                    ProgressView()
                    Text("Loading plans…")
                        .font(.footnote)
                        .foregroundStyle(Theme.secondaryInk)
                } else {
                    Text("Plans aren't available right now. Please try again in a moment.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.secondaryInk)
                        .multilineTextAlignment(.center)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 30)
        } else {
            VStack(spacing: 10) {
                ForEach(store.packages, id: \.identifier) { package in
                    planRow(package)
                }
            }
        }
    }

    private func planRow(_ package: Package) -> some View {
        let isSelected = selected?.identifier == package.identifier
        let isAnnual = package.packageType == .annual

        return Button {
            UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            withAnimation(.snappy(duration: 0.2)) { selected = package }
            Analytics.capture(.planTapped, [
                "plan": isAnnual ? "yearly" : "monthly",
                "product_id": package.storeProduct.productIdentifier,
            ])
        } label: {
            HStack(spacing: 12) {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .font(.title3)
                    .foregroundStyle(isSelected ? Theme.red : Theme.mutedInk)

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 8) {
                        Text(isAnnual ? "Yearly" : "Monthly")
                            .font(.headline)
                            .foregroundStyle(Theme.ink)
                        if isAnnual, let saving = savingText {
                            TagPill(text: saving)
                        }
                    }
                    Text(detail(for: package))
                        .font(.footnote)
                        .foregroundStyle(Theme.secondaryInk)
                }

                Spacer(minLength: 0)

                Text(package.storeProduct.localizedPriceString)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.ink)
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(isSelected ? Theme.redSoft.opacity(0.5) : .white, in: .rect(cornerRadius: Theme.cardRadius))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.cardRadius)
                    .strokeBorder(isSelected ? Theme.red.opacity(0.6) : Theme.hairline, lineWidth: 1.5)
            }
        }
        .buttonStyle(.plain)
    }

    /// "Save 50%" — worked out from the real prices so it can never overstate the discount.
    private var savingText: String? {
        guard let annual = store.packages.first(where: { $0.packageType == .annual }),
              let monthly = store.packages.first(where: { $0.packageType == .monthly }) else { return nil }

        let yearAtMonthlyRate = monthly.storeProduct.price * 12
        guard yearAtMonthlyRate > 0 else { return nil }

        let saved = (yearAtMonthlyRate - annual.storeProduct.price) / yearAtMonthlyRate
        let percent = Int((saved as NSDecimalNumber).doubleValue * 100)
        guard percent > 0 else { return nil }
        return "Save \(percent)%"
    }

    private func detail(for package: Package) -> String {
        if package.packageType == .annual {
            let monthly = package.storeProduct.localizedPricePerMonth ?? ""
            return monthly.isEmpty ? "Billed once a year" : "\(monthly) a month, billed yearly"
        }
        return "Billed every month"
    }

    // MARK: - Action

    private var callToAction: some View {
        VStack(spacing: 12) {
            Button {
                Task { await subscribe() }
            } label: {
                Group {
                    if store.isPurchasing {
                        ProgressView().tint(.white)
                    } else {
                        Text(trialDays > 0 ? "Start my \(trialDays)-day free trial" : "Subscribe")
                            .font(.headline)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Theme.red, in: .capsule)
                .foregroundStyle(.white)
                .shadow(color: Theme.red.opacity(0.3), radius: 12, y: 5)
            }
            .buttonStyle(.plain)
            .disabled(selected == nil || store.isPurchasing)
            .opacity(selected == nil ? 0.5 : 1)
            .scaleEffect(appeared ? 1 : 0.96)

            Button("Restore purchases") {
                Task {
                    if await store.restore() { dismiss() }
                }
            }
            .font(.subheadline)
            .foregroundStyle(Theme.secondaryInk)
            .disabled(store.isPurchasing)
        }
    }

    /// Trial length straight from the App Store offer, so the button never
    /// promises a trial the product doesn't actually have.
    private var trialDays: Int {
        guard let discount = selected?.storeProduct.introductoryDiscount,
              discount.paymentMode == .freeTrial else { return 0 }

        let period = discount.subscriptionPeriod
        switch period.unit {
        case .day: return period.value
        case .week: return period.value * 7
        case .month: return period.value * 30
        case .year: return period.value * 365
        @unknown default: return period.value
        }
    }

    private var terms: some View {
        VStack(spacing: 10) {
            Text(termsText)
                .font(.caption)
                .foregroundStyle(Theme.mutedInk)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 16) {
                Link("Terms", destination: URL(string: "https://learndari.com/terms")!)
                Link("Privacy", destination: URL(string: "https://learndari.com/privacy")!)
            }
            .font(.caption.weight(.medium))
            .foregroundStyle(Theme.secondaryInk)
        }
    }

    private var termsText: String {
        guard let selected else {
            return "Subscriptions renew automatically until cancelled. Cancel anytime in your iPhone Settings."
        }
        let price = selected.storeProduct.localizedPriceString
        let period = selected.packageType == .annual ? "year" : "month"

        if trialDays > 0 {
            return "Free for \(trialDays) days, then \(price) per \(period). It renews automatically until cancelled — cancel anytime in your iPhone Settings, at least a day before the trial ends."
        }
        return "\(price) per \(period), renewing automatically until cancelled. Cancel anytime in your iPhone Settings."
    }

    // MARK: - Purchase

    private func subscribe() async {
        guard let selected else { return }

        // Signing in first is what ties the subscription to a person rather than
        // a handset — it's why it will survive a new phone and work on the website.
        if auth.user == nil {
            await auth.signIn(provider: "apple")
            guard let user = auth.user else { return }
            await store.identify(userID: user.id)
        }

        if await store.purchase(selected) {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            dismiss()
        }
    }
}

#Preview {
    PaywallView(source: "preview")
        .environment(SubscriptionManager())
        .environment(AuthManager())
}
