import type { ContentDocument, ContentEnvelope, HistoryEntry } from "./content";
import { isPlayableOnDevice } from "./audio";

/**
 * Thin client for the LearnDari backend.
 * The Studio session token is a signed expiry stamp kept in local storage.
 */

const FALLBACK_BASE = "https://learndari-backend.rork.app";

export const API_BASE: string = (
  (import.meta.env.VITE_STUDIO_API as string | undefined) ?? FALLBACK_BASE
).replace(/\/$/, "");

const TOKEN_KEY = "learndari-studio-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  readonly status: number;
  readonly problems: string[];

  constructor(status: number, message: string, problems: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problems = problems;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let problems: string[] = [];
    try {
      const body = (await response.json()) as { error?: string; problems?: string[] };
      if (body.error) message = body.error;
      if (body.problems) problems = body.problems;
    } catch {
      // Non-JSON error body; the status message is enough.
    }
    if (response.status === 401) setToken(null);
    throw new ApiError(response.status, message, problems);
  }

  return (await response.json()) as T;
}

export async function login(password: string): Promise<void> {
  const result = await request<{ token: string }>("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  setToken(result.token);
}

export function logout(): void {
  setToken(null);
}

export async function verifySession(): Promise<boolean> {
  if (!getToken()) return false;
  try {
    await request<{ ok: boolean }>("/admin/session");
    return true;
  } catch {
    return false;
  }
}

export function fetchContent(): Promise<ContentEnvelope> {
  return request<ContentEnvelope>("/admin/content");
}

export function saveContent(content: ContentDocument, note: string): Promise<ContentEnvelope> {
  return request<ContentEnvelope>("/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, note }),
  });
}

export function fetchHistory(): Promise<{ versions: HistoryEntry[] }> {
  return request<{ versions: HistoryEntry[] }>("/admin/history");
}

export function rollback(version: number): Promise<ContentEnvelope> {
  return request<ContentEnvelope>("/admin/rollback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
  });
}

export interface RecordingIndex {
  /** Keys the iOS app can actually play. */
  playable: Set<string>;
  /** Keys stored in a format iOS cannot decode — these need re-recording. */
  legacy: Set<string>;
}

export async function fetchRecordingIndex(): Promise<RecordingIndex> {
  const result = await request<{ recordings: { key: string; mime?: string }[] }>("/admin/recordings");
  const playable = new Set<string>();
  const legacy = new Set<string>();

  for (const recording of result.recordings) {
    if (isPlayableOnDevice(recording.mime ?? "")) playable.add(recording.key);
    else legacy.add(recording.key);
  }

  return { playable, legacy };
}

export interface WaitlistEntry {
  email: string;
  source: string;
  createdAt: number;
}

export async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  const result = await request<{ entries: WaitlistEntry[] }>("/admin/waitlist");
  return result.entries;
}

export async function removeFromWaitlist(email: string): Promise<void> {
  await request<{ ok: boolean }>(`/admin/waitlist/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function uploadRecording(key: string, blob: Blob, durationMs: number): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/admin/audio/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: {
      "Content-Type": blob.type || "audio/wav",
      "X-Duration-Ms": String(Math.round(durationMs)),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: blob,
  });
  if (!response.ok) {
    throw new ApiError(response.status, "Could not save that recording");
  }
}

export async function deleteRecording(key: string): Promise<void> {
  await request<{ ok: boolean }>(`/admin/audio/${encodeURIComponent(key)}`, { method: "DELETE" });
}

/** Public playback URL. The cache buster makes a re-record audible immediately. */
export function recordingUrl(key: string, version = 0): string {
  return `${API_BASE}/audio/${encodeURIComponent(key)}${version ? `?v=${version}` : ""}`;
}
