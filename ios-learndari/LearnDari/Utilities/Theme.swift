import SwiftUI

/// Shared LearnDari brand tokens: colours, radii and the featured-card gradient.
enum Theme {
    static let red = Color(red: 0.843, green: 0.133, blue: 0.180)
    static let redSoft = Color(red: 0.992, green: 0.925, blue: 0.925)
    static let green = Color(red: 0.090, green: 0.502, blue: 0.239)
    static let greenSoft = Color(red: 0.910, green: 0.965, blue: 0.929)
    static let amber = Color(red: 0.847, green: 0.596, blue: 0.157)
    static let ink = Color(red: 0.067, green: 0.067, blue: 0.075)
    static let secondaryInk = Color(red: 0.420, green: 0.420, blue: 0.447)
    static let mutedInk = Color(red: 0.714, green: 0.714, blue: 0.737)
    static let hairline = Color(red: 0.918, green: 0.918, blue: 0.925)
    static let fill = Color(red: 0.965, green: 0.965, blue: 0.969)

    static let cardRadius: CGFloat = 16
    static let featuredRadius: CGFloat = 20

    /// The website's diagonal red → amber → green treatment, reserved for featured cards.
    static let featuredGradient = LinearGradient(
        colors: [
            Color(red: 0.886, green: 0.231, blue: 0.204),
            Color(red: 0.788, green: 0.541, blue: 0.180),
            Color(red: 0.071, green: 0.631, blue: 0.314),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

/// White surface with a hairline border and a very soft shadow — the app's default card.
struct CardBackground: ViewModifier {
    var radius: CGFloat = Theme.cardRadius

    func body(content: Content) -> some View {
        content
            .background(Color.white, in: .rect(cornerRadius: radius))
            .overlay {
                RoundedRectangle(cornerRadius: radius)
                    .strokeBorder(Theme.hairline, lineWidth: 1)
            }
            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
    }
}

extension View {
    func cardStyle(radius: CGFloat = Theme.cardRadius) -> some View {
        modifier(CardBackground(radius: radius))
    }
}

/// The full LearnDari lockup (flag book mark + wordmark banner) used in navigation bars.
struct LogoMark: View {
    var height: CGFloat = 34

    var body: some View {
        Image("Logo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(height: height)
            .accessibilityLabel("LearnDari")
    }
}

/// Circular speaker button that accompanies every Dari word or phrase.
struct AudioButton: View {
    let text: String
    /// When present, plays the creator's own recording instead of synthesised speech.
    var audioKey: String?
    var size: CGFloat = 44
    var style: Style = .tinted

    enum Style {
        case tinted
        case onFeatured
    }

    @Environment(AudioService.self) private var audio

    var body: some View {
        Button {
            audio.speak(text, audioKey: audioKey)
        } label: {
            Image(systemName: "speaker.wave.2.fill")
                .font(.system(size: size * 0.4, weight: .semibold))
                .foregroundStyle(style == .tinted ? Theme.red : .white)
                .frame(width: size, height: size)
                .background(
                    style == .tinted ? AnyShapeStyle(Theme.redSoft) : AnyShapeStyle(.white.opacity(0.22)),
                    in: .circle
                )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Play pronunciation")
    }
}

/// Small pill used for locked content and category tags.
struct TagPill: View {
    let text: String
    var systemImage: String?
    var foreground: Color = Theme.red
    var background: Color = Theme.redSoft

    var body: some View {
        HStack(spacing: 4) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.system(size: 10, weight: .semibold))
            }
            Text(text)
                .font(.caption2.weight(.semibold))
        }
        .foregroundStyle(foreground)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(background, in: .capsule)
    }
}
