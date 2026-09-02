import AVFoundation
import Observation
import SwiftUI

/// Speaks Dari text aloud.
///
/// Primary path: Azure Neural TTS via the project's backend (`/tts` route) —
/// the same voice family used on learndari.com. Falls back automatically to
/// on-device `AVSpeechSynthesizer` when the backend is unconfigured/unreachable.
@Observable
final class AudioService: NSObject, AVAudioPlayerDelegate {
    private let synthesizer = AVSpeechSynthesizer()
    private var player: AVAudioPlayer?
    private let audioCache = NSCache<NSString, NSData>()

    private(set) var isSpeaking: Bool = false
    var isSoundEnabled: Bool = true

    private var backendBaseURL: URL? {
        let raw = Config.EXPO_PUBLIC_RORK_FUNCTIONS_URL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !raw.isEmpty, let url = URL(string: raw) else { return nil }
        return url
    }

    /// Speaks a Dari string.
    ///
    /// Preference order: the creator's own recording (`audioKey`), then neural
    /// TTS from the backend, then on-device speech. Each step falls through
    /// silently, so audio never simply stops working.
    func speak(_ text: String, audioKey: String? = nil) {
        guard isSoundEnabled, !text.isEmpty else { return }

        stop()
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        Analytics.capture(.audioPlayed, ["has_recording": !(audioKey ?? "").isEmpty])

        if backendBaseURL != nil {
            isSpeaking = true
            Task { await speakRemotely(text, audioKey: audioKey) }
        } else {
            speakOnDevice(text)
        }
    }

    // MARK: - Remote (Azure via backend)

    private func speakRemotely(_ text: String, audioKey: String?) async {
        guard let base = backendBaseURL else { return }

        // A human recording always wins when one exists.
        if let audioKey, !audioKey.isEmpty {
            if let recording = await fetchRecording(key: audioKey, from: base) {
                play(data: recording, fallbackText: text)
                return
            }
        }

        if let cached = audioCache.object(forKey: text as NSString) as Data? {
            play(data: cached, fallbackText: text)
            return
        }

        var components = URLComponents(url: base.appendingPathComponent("tts"), resolvingAgainstBaseURL: false)
        components?.queryItems = [URLQueryItem(name: "text", value: text)]

        guard let requestURL = components?.url else {
            speakOnDevice(text)
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: requestURL)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200,
                  !data.isEmpty else {
                throw URLError(.badServerResponse)
            }
            audioCache.setObject(data as NSData, forKey: text as NSString)
            play(data: data, fallbackText: text)
        } catch {
            print("[AudioService] Remote TTS unavailable, using on-device speech: \(error.localizedDescription)")
            speakOnDevice(text)
        }
    }

    /// Downloads (and then caches) one of the creator's recordings.
    private func fetchRecording(key: String, from base: URL) async -> Data? {
        let cacheKey = "recording:\(key)" as NSString
        if let cached = audioCache.object(forKey: cacheKey) as Data? { return cached }

        let url = base.appendingPathComponent("audio").appendingPathComponent(key)
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200, !data.isEmpty else {
                return nil
            }
            audioCache.setObject(data as NSData, forKey: cacheKey)
            return data
        } catch {
            print("[AudioService] Recording unavailable, falling back: \(error.localizedDescription)")
            return nil
        }
    }

    private func play(data: Data, fallbackText: String) {
        do {
            // No file-type hint: recordings arrive as m4a/webm, TTS as mp3.
            let audioPlayer = try AVAudioPlayer(data: data)
            audioPlayer.delegate = self
            player = audioPlayer
            configureSession()
            guard audioPlayer.play() else {
                throw URLError(.unsupportedURL)
            }
        } catch {
            print("[AudioService] Playback failed, using on-device speech: \(error.localizedDescription)")
            speakOnDevice(fallbackText)
        }
    }

    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            self.finishPlayback()
        }
    }

    // MARK: - On-device fallback

    private func speakOnDevice(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "fa-IR")
            ?? AVSpeechSynthesisVoice(language: "ar-SA")
            ?? AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.85
        utterance.pitchMultiplier = 1.0

        configureSession()
        isSpeaking = true
        synthesizer.speak(utterance)

        Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(900))
            self?.finishPlayback()
        }
    }

    // MARK: - Shared

    private func stop() {
        player?.stop()
        player = nil
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        finishPlayback()
    }

    private func finishPlayback() {
        isSpeaking = false
    }

    private func configureSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[AudioService] Could not activate audio session: \(error.localizedDescription)")
        }
    }
}
