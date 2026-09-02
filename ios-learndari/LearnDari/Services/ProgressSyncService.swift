import Foundation
import Observation

/// Keeps on-device progress and the learner's account in step.
///
/// On sign-in it folds whatever was done signed-out into the account, so trying
/// the app before making an account never costs the learner their work.
@Observable
final class ProgressSyncService {
    private(set) var isSyncing: Bool = false
    private(set) var lastSyncedAt: Date?

    /// Guards against pulling repeatedly for the same account.
    private var pulledUserID: String?
    private var pushTask: Task<Void, Never>?

    private var baseURL: URL? {
        let raw = Config.EXPO_PUBLIC_RORK_FUNCTIONS_URL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !raw.isEmpty, let url = URL(string: raw) else { return nil }
        return url
    }

    /// Pulls the account's record and merges the device's into it.
    @MainActor
    func pull(for userID: String, token: String, into store: ProgressStore) async {
        guard pulledUserID != userID else { return }
        pulledUserID = userID

        isSyncing = true
        defer { isSyncing = false }

        let local = store.snapshot
        guard let remote = await fetchRemote(token: token) else {
            // Offline or first sync: keep local and push it up.
            await push(store.snapshot, token: token)
            return
        }

        let merged = local.merged(with: remote)
        store.apply(merged)
        lastSyncedAt = Date()

        if !merged.isEmpty {
            await push(merged, token: token)
        }
    }

    /// Schedules a push, coalescing a burst of answers into one request.
    @MainActor
    func schedulePush(_ snapshot: ProgressSnapshot, token: String) {
        pushTask?.cancel()
        pushTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(2))
            guard !Task.isCancelled else { return }
            await self?.push(snapshot, token: token)
        }
    }

    /// Forgets the current account so the next sign-in pulls again.
    @MainActor
    func reset() {
        pulledUserID = nil
        pushTask?.cancel()
        pushTask = nil
        lastSyncedAt = nil
    }

    /// Removes the account's stored progress — App Store guideline 5.1.1(v).
    func deleteRemote(token: String) async {
        guard let url = baseURL?.appendingPathComponent("me/progress") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        _ = try? await URLSession.shared.data(for: request)
    }

    // MARK: - Transport

    private func fetchRemote(token: String) async -> ProgressSnapshot? {
        guard let url = baseURL?.appendingPathComponent("me/progress") else { return nil }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else { return nil }
            let envelope = try JSONDecoder().decode(RemoteProgress.self, from: data)
            return envelope.progress
        } catch {
            return nil
        }
    }

    private func push(_ snapshot: ProgressSnapshot, token: String) async {
        guard let url = baseURL?.appendingPathComponent("me/progress") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try? JSONEncoder().encode(snapshot)

        _ = try? await URLSession.shared.data(for: request)
        await MainActor.run { lastSyncedAt = Date() }
    }
}

private nonisolated struct RemoteProgress: Codable {
    let progress: ProgressSnapshot?
}
