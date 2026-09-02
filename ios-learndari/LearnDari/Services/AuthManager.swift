import SwiftUI
import AuthenticationServices
import CryptoKit

/// Google and Apple sign-in through Rork Auth.
///
/// The same account works on the website, which is what lets progress follow
/// the learner between their laptop and their phone.
@Observable
final class AuthManager {
    var user: User?
    var isLoading: Bool = true
    var isSigningIn: Bool = false
    var showError: Bool = false
    var errorMessage: String = ""

    private let authURL = Config.EXPO_PUBLIC_RORK_AUTH_URL
    private let appKey = Config.EXPO_PUBLIC_RORK_APP_KEY
    private let projectID = Config.EXPO_PUBLIC_PROJECT_ID
    private var codeVerifier: String?
    private var webAuthSession: ASWebAuthenticationSession?

    /// Injected by Rork into UserDefaults on the simulator only. Read fresh each
    /// time: the write can land after the app process has already started.
    private var developerHint: String? {
        UserDefaults.standard.string(forKey: "RORK_DEVELOPER_HINT")
    }

    nonisolated struct User: Codable, Equatable {
        let id: String
        let email: String
        let name: String?
        let picture: String?
    }

    init() {
        Task { await checkAuth() }
    }

    // MARK: - PKCE

    private func generateCodeVerifier() -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    private func generateCodeChallenge(from verifier: String) -> String {
        let hash = SHA256.hash(data: Data(verifier.utf8))
        return Data(hash).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    private var authEnv: String {
        #if targetEnvironment(simulator)
        return "simulator"
        #else
        return "native"
        #endif
    }

    /// Reads the stored token's payload. The signature was verified by Rork when
    /// it was issued, so this only needs to check expiry.
    private func userFromToken(_ token: String) -> User? {
        let parts = token.split(separator: ".")
        guard parts.count == 3 else { return nil }

        var base64 = String(parts[1])
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        while base64.count % 4 != 0 { base64.append("=") }

        guard let data = Data(base64Encoded: base64) else { return nil }

        struct JWTPayload: Codable {
            let sub: String
            let email: String?
            let name: String?
            let picture: String?
            let exp: TimeInterval?
        }

        guard let payload = try? JSONDecoder().decode(JWTPayload.self, from: data) else { return nil }
        if let exp = payload.exp, Date(timeIntervalSince1970: exp) < Date() { return nil }

        return User(id: payload.sub, email: payload.email ?? "", name: payload.name, picture: payload.picture)
    }

    /// The simulator has no Keychain, so Rork injects the token into UserDefaults there.
    private func storedRefreshToken() -> String? {
        #if targetEnvironment(simulator)
        if let injected = UserDefaults.standard.string(forKey: "RORK_AUTH_REFRESH_TOKEN") {
            return injected
        }
        #endif
        return KeychainHelper.get("refresh_token")
    }

    /// Bearer token for calls to the LearnDari backend.
    var accessToken: String? {
        KeychainHelper.get("access_token")
    }

    // MARK: - Session

    @MainActor
    func checkAuth() async {
        defer { isLoading = false }

        if let token = KeychainHelper.get("access_token"), let existing = userFromToken(token) {
            user = existing
            return
        }
        if storedRefreshToken() != nil {
            await refreshToken()
        }
    }

    @MainActor
    func signIn(provider: String) async {
        isSigningIn = true
        defer { isSigningIn = false }

        do {
            let verifier = generateCodeVerifier()
            let challenge = generateCodeChallenge(from: verifier)
            codeVerifier = verifier

            guard let url = URL(string: "\(authURL)/oauth/initiate") else {
                setError("Sign-in is not configured yet.")
                return
            }

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            var body: [String: String] = [
                "app_key": appKey,
                "provider": provider,
                "code_challenge": challenge,
                "target": "swift",
                "env": authEnv
            ]
            if authEnv == "simulator", let hint = developerHint {
                body["developer_hint"] = hint
            }
            request.httpBody = try JSONEncoder().encode(body)

            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else {
                if let error = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                    setError(error.error)
                } else {
                    setError("We couldn't start sign-in. Please try again.")
                }
                return
            }

            let initiate = try JSONDecoder().decode(InitiateResponse.self, from: data)

            let code: String
            if initiate.flow == "popup" {
                do {
                    code = try await pollForCode(state: initiate.state)
                } catch AuthError.cancelledByUser {
                    code = try await runWebAuthSession(authURL: initiate.auth_url)
                }
            } else {
                code = try await runWebAuthSession(authURL: initiate.auth_url)
            }

            await exchangeCode(code)
        } catch let error as ASWebAuthenticationSessionError where error.code == .canceledLogin {
            return
        } catch {
            setError(error.localizedDescription)
        }
    }

    private func pollForCode(state: String) async throws -> String {
        guard let url = URL(string: "\(authURL)/oauth/poll-code") else {
            throw AuthError.invalidURL
        }

        let deadline = Date().addingTimeInterval(5 * 60)
        while Date() < deadline {
            try await Task.sleep(for: .milliseconds(1500))

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(["app_key": appKey, "state": state])

            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else { continue }
            guard let poll = try? JSONDecoder().decode(PollCodeResponse.self, from: data) else { continue }

            if poll.status == "cancelled" { throw AuthError.cancelledByUser }
            if poll.status == "ready", let code = poll.code { return code }
        }

        throw AuthError.popupTimeout
    }

    private func runWebAuthSession(authURL authURLString: String) async throws -> String {
        let callbackScheme = "rork-\(projectID)"
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<String, Error>) in
            guard let url = URL(string: authURLString) else {
                continuation.resume(throwing: AuthError.invalidURL)
                return
            }

            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: callbackScheme
            ) { [weak self] callbackURL, error in
                self?.webAuthSession = nil

                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                guard let url = callbackURL,
                      let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
                      let code = components.queryItems?.first(where: { $0.name == "code" })?.value else {
                    continuation.resume(throwing: AuthError.noCode)
                    return
                }

                continuation.resume(returning: code)
            }

            webAuthSession = session
            session.presentationContextProvider = WebAuthPresentationContext.shared
            session.prefersEphemeralWebBrowserSession = false
            session.start()
        }
    }

    @MainActor
    private func exchangeCode(_ code: String) async {
        guard let verifier = codeVerifier else { return }
        codeVerifier = nil

        guard let url = URL(string: "\(authURL)/oauth/token") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONEncoder().encode([
            "app_key": appKey,
            "code": code,
            "code_verifier": verifier
        ])

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else {
                if let error = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                    setError(error.error)
                } else {
                    setError("We couldn't sign you in. Please try again.")
                }
                return
            }

            let tokens = try JSONDecoder().decode(TokenResponse.self, from: data)
            KeychainHelper.set("access_token", value: tokens.access_token)
            KeychainHelper.set("refresh_token", value: tokens.refresh_token)
            user = tokens.user
        } catch {
            setError("We couldn't sign you in. Please try again.")
        }
    }

    @MainActor
    private func refreshToken() async {
        guard let stored = storedRefreshToken() else {
            user = nil
            return
        }
        guard let url = URL(string: "\(authURL)/oauth/refresh") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONEncoder().encode(["app_key": appKey, "refresh_token": stored])

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else {
                await signOut()
                return
            }
            let refreshed = try JSONDecoder().decode(RefreshResponse.self, from: data)
            KeychainHelper.set("access_token", value: refreshed.access_token)
            user = userFromToken(refreshed.access_token)
        } catch {
            await signOut()
        }
    }

    @MainActor
    func signOut() async {
        KeychainHelper.delete("access_token")
        KeychainHelper.delete("refresh_token")
        UserDefaults.standard.removeObject(forKey: "RORK_AUTH_REFRESH_TOKEN")
        user = nil
    }

    private func setError(_ message: String) {
        errorMessage = message
        showError = true
    }
}

// MARK: - Response types

private nonisolated struct InitiateResponse: Codable {
    let auth_url: String
    let state: String
    let flow: String?
}

private nonisolated struct PollCodeResponse: Codable {
    let status: String
    let code: String?
}

private nonisolated struct TokenResponse: Codable {
    let access_token: String
    let refresh_token: String
    let user: AuthManager.User
}

private nonisolated struct RefreshResponse: Codable {
    let access_token: String
    let expires_in: Int
}

private nonisolated struct ErrorResponse: Codable {
    let error: String
}

nonisolated enum AuthError: LocalizedError {
    case noCode
    case invalidURL
    case serverError(statusCode: Int)
    case popupTimeout
    case cancelledByUser

    var errorDescription: String? {
        switch self {
        case .noCode: return "No authorization code received"
        case .invalidURL: return "Invalid URL"
        case .serverError(let code): return "Server error (\(code))"
        case .popupTimeout: return "Sign-in timed out — please try again"
        case .cancelledByUser: return "Sign-in cancelled"
        }
    }
}

// MARK: - Presentation anchor

final class WebAuthPresentationContext: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = WebAuthPresentationContext()

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}
