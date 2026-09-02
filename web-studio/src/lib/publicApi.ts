import type { ContentDocument, ContentEnvelope } from "./content";
import { API_BASE } from "./api";

/**
 * Read-only client for the public content feed.
 *
 * The website and the iOS app both read this endpoint, which is what keeps
 * them from drifting: content is authored once in the Studio.
 */

export async function fetchPublicContent(): Promise<ContentEnvelope> {
  const response = await fetch(`${API_BASE}/content`);
  if (!response.ok) {
    throw new Error(`Could not load content (${response.status})`);
  }
  return (await response.json()) as ContentEnvelope;
}

/** Public playback URL for a recording made in the Studio. */
export function audioUrl(key: string): string {
  return `${API_BASE}/audio/${encodeURIComponent(key)}`;
}

/** Attaches the signed-in learner's bearer token, when there is one. */
function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAccountProgress<T>(token: string): Promise<T | null> {
  const response = await fetch(`${API_BASE}/me/progress`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`Could not load progress (${response.status})`);
  const body = (await response.json()) as { progress: T | null };
  return body.progress;
}

export async function saveAccountProgress<T>(token: string, progress: T): Promise<void> {
  const response = await fetch(`${API_BASE}/me/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(progress),
  });
  if (!response.ok) throw new Error(`Could not save progress (${response.status})`);
}

/** Deletes the account's stored progress. */
export async function deleteAccountProgress(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/me/progress`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`Could not delete your account (${response.status})`);
}

/** Adds an email to the iPhone launch waitlist. */
export async function joinWaitlist(email: string, source: string): Promise<void> {
  const response = await fetch(`${API_BASE}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  });
  if (!response.ok) {
    throw new Error(`Could not join the waitlist (${response.status})`);
  }
}

export const emptyContent: ContentDocument = {
  vocabSets: [],
  units: [],
  proverbs: [],
  popularWords: [],
  phrases: [],
  wordOfTheDaySchedule: [],
};
