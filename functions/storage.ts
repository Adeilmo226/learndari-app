/**
 * Supabase Storage for word recordings.
 *
 * Audio used to live only as BLOBs inside the content Durable Object — one
 * instance, no backup, a capped rollback history. That is the wrong home for
 * the one asset that cannot be regenerated (a person's recorded voice). These
 * helpers move recordings into a Supabase Storage bucket, which is redundant
 * object storage the worker can reach with the credentials it already has.
 *
 * Everything degrades safely: if Supabase is not configured, the caller falls
 * back to the Durable Object, so playback never breaks mid-rollout.
 */

import type { SupabaseConfig } from "./supabase";

export const AUDIO_BUCKET = "word-audio";

function headers(config: SupabaseConfig, extra?: Record<string, string>): Headers {
  const h = new Headers(extra);
  h.set("apikey", config.serviceRoleKey);
  h.set("Authorization", `Bearer ${config.serviceRoleKey}`);
  return h;
}

function objectUrl(config: SupabaseConfig, key: string): string {
  return `${config.url}/storage/v1/object/${AUDIO_BUCKET}/${encodeURIComponent(key)}`;
}

/** Create the public audio bucket if it isn't there yet. Safe to call often. */
export async function ensureAudioBucket(config: SupabaseConfig): Promise<void> {
  try {
    const res = await fetch(`${config.url}/storage/v1/bucket`, {
      method: "POST",
      headers: headers(config, { "Content-Type": "application/json" }),
      body: JSON.stringify({ id: AUDIO_BUCKET, name: AUDIO_BUCKET, public: true }),
    });
    // 200 = created; 400/409 = already exists. Anything else is worth logging.
    if (!res.ok && res.status !== 400 && res.status !== 409) {
      console.error("ensureAudioBucket failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("ensureAudioBucket error", err instanceof Error ? err.message : err);
  }
}

/** Upsert a recording. Returns true on success. */
export async function putAudio(
  config: SupabaseConfig,
  key: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<boolean> {
  try {
    const res = await fetch(objectUrl(config, key), {
      method: "POST",
      headers: headers(config, {
        "Content-Type": contentType || "audio/wav",
        "Cache-Control": "3600",
        "x-upsert": "true",
      }),
      body,
    });
    if (!res.ok) {
      console.error("putAudio failed", key, res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("putAudio error", key, err instanceof Error ? err.message : err);
    return false;
  }
}

/** Fetch a recording. Returns the upstream Response when present, else null. */
export async function getAudio(config: SupabaseConfig, key: string): Promise<Response | null> {
  try {
    const res = await fetch(objectUrl(config, key), { headers: headers(config) });
    if (!res.ok) return null;
    return res;
  } catch (err) {
    console.error("getAudio error", key, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Delete a recording. Returns true on success (or if it was already gone). */
export async function deleteAudio(config: SupabaseConfig, key: string): Promise<boolean> {
  try {
    const res = await fetch(objectUrl(config, key), { method: "DELETE", headers: headers(config) });
    return res.ok || res.status === 404;
  } catch (err) {
    console.error("deleteAudio error", key, err instanceof Error ? err.message : err);
    return false;
  }
}

/** List the object keys currently in the bucket. */
export async function listAudio(config: SupabaseConfig): Promise<string[]> {
  try {
    const res = await fetch(`${config.url}/storage/v1/object/list/${AUDIO_BUCKET}`, {
      method: "POST",
      headers: headers(config, { "Content-Type": "application/json" }),
      body: JSON.stringify({ prefix: "", limit: 1000, sortBy: { column: "name", order: "asc" } }),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { name?: string }[];
    return rows.map((r) => r.name ?? "").filter(Boolean);
  } catch (err) {
    console.error("listAudio error", err instanceof Error ? err.message : err);
    return [];
  }
}
