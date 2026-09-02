/**
 * LearnDari backend.
 *
 * Public (read-only, used by the iOS app):
 *   GET  /content                -> { version, updatedAt, content }
 *   GET  /audio/:key             -> a human recording uploaded from the Studio
 *   GET  /tts?text=&voice=       -> synthesised speech fallback
 *   GET  /health                 -> { ok, tts, studio }
 *   POST /waitlist               -> { email, source } for the iPhone launch list
 *
 * Signed in (Rork Auth bearer token; the platform verifies it and stamps
 * X-Rork-User-Id on the request):
 *   GET    /me/progress          -> { progress, updatedAt }
 *   PUT    /me/progress          -> store this account's progress
 *   DELETE /me/progress          -> account deletion
 *
 * Studio (password protected, read-write):
 *   POST   /admin/login          -> { token, expiresAt }
 *   GET    /admin/content
 *   PUT    /admin/content        -> validate + publish a new version
 *   GET    /admin/history
 *   POST   /admin/rollback
 *   GET    /admin/waitlist       -> everyone who signed up
 *   DELETE /admin/waitlist/:email
 *   GET    /admin/recordings     -> keys that already have audio
 *   PUT    /admin/audio/:key     -> raw audio body
 *   DELETE /admin/audio/:key
 */
export { ContentStore } from "./content-store";

import { supabaseConfig, selectOne, upsert, remove, type SupabaseConfig } from "./supabase";

interface Env {
  AZURE_SPEECH_KEY?: string;
  AZURE_SPEECH_REGION?: string;
  /** Password for LearnDari Studio. Admin routes are disabled until it is set. */
  STUDIO_PASSWORD?: string;
  SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  /** Shared secret RevenueCat sends in the Authorization header. */
  REVENUECAT_WEBHOOK_SECRET?: string;
  DO: Fetcher;
}

interface ProgressRow {
  snapshot: unknown;
  synced_at: number;
}

interface SubscriptionRow {
  status: string;
  plan: string | null;
  store: string | null;
  product_id: string | null;
  is_trial: boolean;
  will_renew: boolean;
  current_period_end: string | null;
  trial_ends_at: string | null;
}

const DEFAULT_VOICE = "fa-IR-DilaraNeural";
const MAX_TEXT_LENGTH = 500;
const STORE_ID = "main";
const SESSION_HOURS = 24 * 14;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Duration-Ms",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// MARK: - Studio session tokens

const encoder = new TextEncoder();

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function issueToken(secret: string): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + SESSION_HOURS * 3_600_000;
  const payload = String(expiresAt);
  return { token: `${payload}.${await sign(payload, secret)}`, expiresAt };
}

async function isValidToken(token: string | null, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await sign(payload, secret);
  // Length-stable comparison; both sides are fixed-width hex.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

// MARK: - Content store dispatch

function storeRequest(path: string, init?: RequestInit): Request {
  const request = new Request(`https://content-store${path}`, init);
  request.headers.set("X-Rork-DO-Class", "ContentStore");
  request.headers.set("X-Rork-DO-Id", STORE_ID);
  return request;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ---- Public reads -------------------------------------------------

    if (path === "/content" && request.method === "GET") {
      const res = await env.DO.fetch(storeRequest("/doc"));
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          // Short cache: edits reach learners within a minute even behind a CDN.
          "Cache-Control": "public, max-age=30",
          ...CORS_HEADERS,
        },
      });
    }

    if (path.startsWith("/audio/") && request.method === "GET") {
      const key = path.slice("/audio/".length);
      const res = await env.DO.fetch(storeRequest(`/recording/${key}`));
      const headers = new Headers(res.headers);
      for (const [name, value] of Object.entries(CORS_HEADERS)) headers.set(name, value);
      return new Response(res.body, { status: res.status, headers });
    }

    // ---- Signed-in learner progress -----------------------------------

    if (path === "/me/progress") {
      return handleProgress(request, env);
    }

    if (path === "/waitlist" && request.method === "POST") {
      const res = await env.DO.fetch(
        storeRequest("/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: await request.text(),
        }),
      );
      return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (path === "/me/subscription" && request.method === "GET") {
      return handleSubscriptionRead(request, env);
    }

    if (path === "/webhooks/revenuecat" && request.method === "POST") {
      return handleRevenueCatWebhook(request, env);
    }

    if (path === "/tts" && request.method === "GET") {
      return handleTTS(url, env);
    }

    if (path === "/health") {
      return json({
        ok: true,
        tts: Boolean(env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION),
        studio: Boolean(env.STUDIO_PASSWORD),
        database: Boolean(supabaseConfig(env)),
        billing: Boolean(env.REVENUECAT_WEBHOOK_SECRET),
      });
    }

    // ---- Studio -------------------------------------------------------

    if (path.startsWith("/admin/")) {
      return handleAdmin(path, request, env);
    }

    return json({ ok: true, service: "learndari-backend" });
  },
} satisfies ExportedHandler<Env>;

/**
 * Per-account progress. The platform verifies the bearer token before the
 * worker runs and injects the user headers, so an absent header simply means
 * "not signed in".
 */
async function handleProgress(request: Request, env: Env): Promise<Response> {
  const userId = request.headers.get("X-Rork-User-Id");
  if (!userId) return json({ error: "Sign in first" }, 401);

  const config = supabaseConfig(env);
  const target = `/progress/${encodeURIComponent(userId)}`;

  // Without a database configured the worker keeps using the durable object,
  // so progress never stops working mid-rollout.
  if (!config) {
    if (request.method === "GET") return proxyToStore(env, storeRequest(target));
    if (request.method === "PUT") {
      return proxyToStore(
        env,
        storeRequest(target, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: await request.text(),
        }),
      );
    }
    if (request.method === "DELETE") {
      return proxyToStore(env, storeRequest(target, { method: "DELETE" }));
    }
    return json({ error: "Method not allowed" }, 405);
  }

  if (request.method === "GET") {
    const row = await selectOne<ProgressRow>(
      config,
      "learning_progress",
      `user_id=eq.${encodeURIComponent(userId)}&select=snapshot,synced_at`,
    );
    if (row) {
      return json({ progress: row.snapshot, updatedAt: row.synced_at });
    }

    // First read after the move: lift whatever the durable object still holds
    // and copy it across, so nobody loses their streak in the migration.
    const legacy = await env.DO.fetch(storeRequest(target));
    if (legacy.ok) {
      const body = (await legacy.json()) as { progress?: unknown; updatedAt?: number };
      if (body.progress) {
        await writeProgress(config, userId, body.progress, body.updatedAt ?? Date.now());
        return json({ progress: body.progress, updatedAt: body.updatedAt ?? Date.now() });
      }
    }
    return json({ progress: null, updatedAt: 0 });
  }

  if (request.method === "PUT") {
    let payload: { progress?: unknown; updatedAt?: number };
    try {
      payload = (await request.json()) as { progress?: unknown; updatedAt?: number };
    } catch {
      return json({ error: "Body must be JSON" }, 400);
    }
    if (!payload.progress) return json({ error: "Missing progress" }, 400);

    await touchProfile(config, userId, request);
    const ok = await writeProgress(config, userId, payload.progress, payload.updatedAt ?? Date.now());
    if (!ok) return json({ error: "Could not save progress" }, 502);
    return json({ ok: true });
  }

  if (request.method === "DELETE") {
    await remove(config, "learning_progress", `user_id=eq.${encodeURIComponent(userId)}`);
    await env.DO.fetch(storeRequest(target, { method: "DELETE" }));
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
}

/** Flattens the headline numbers alongside the snapshot so the table is readable. */
async function writeProgress(
  config: SupabaseConfig,
  userId: string,
  progress: unknown,
  syncedAt: number,
): Promise<boolean> {
  const snapshot = progress as {
    xp?: number;
    streak?: number;
    completedLessonIds?: string[];
    lastActiveDate?: string;
    vocab?: Record<string, unknown>;
  };

  return upsert(
    config,
    "learning_progress",
    {
      user_id: userId,
      xp: snapshot.xp ?? 0,
      streak: snapshot.streak ?? 0,
      lessons_completed: snapshot.completedLessonIds?.length ?? 0,
      words_learned: Object.keys(snapshot.vocab ?? {}).length,
      last_active_date: snapshot.lastActiveDate || null,
      snapshot: progress,
      synced_at: syncedAt,
      updated_at: new Date().toISOString(),
    },
    "user_id",
  );
}

/** Keeps the people table current from the identity the platform already verified. */
async function touchProfile(config: SupabaseConfig, userId: string, request: Request): Promise<void> {
  const email = request.headers.get("X-Rork-User-Email");
  const name = request.headers.get("X-Rork-User-Name");

  await upsert(
    config,
    "user_profiles",
    {
      id: userId,
      // The column is NOT NULL on the existing table, so never write a null over it.
      email: email ?? `${userId}@unknown.local`,
      ...(name ? { display_name: name } : {}),
      last_active_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "id",
  );
}

// MARK: - Subscriptions

const ACTIVE_STATUSES = new Set(["active", "trialing", "in_grace_period"]);

function isEntitled(row: SubscriptionRow | null): boolean {
  if (!row) return false;
  if (!ACTIVE_STATUSES.has(row.status)) return false;
  if (!row.current_period_end) return true;
  return new Date(row.current_period_end).getTime() > Date.now();
}

/**
 * The one place anything asks "is this person paid?".
 *
 * Both the app and the website read this rather than asking Apple or Stripe,
 * so the two halves of the business can never disagree about who owes what.
 */
async function handleSubscriptionRead(request: Request, env: Env): Promise<Response> {
  const userId = request.headers.get("X-Rork-User-Id");
  if (!userId) return json({ error: "Sign in first" }, 401);

  const config = supabaseConfig(env);
  if (!config) return json({ isActive: false, status: "unknown" });

  const row = await selectOne<SubscriptionRow>(
    config,
    "user_subscriptions",
    `user_id=eq.${encodeURIComponent(userId)}&select=status,plan,store,product_id,is_trial,will_renew,current_period_end,trial_ends_at`,
  );

  return json({
    isActive: isEntitled(row),
    status: row?.status ?? "none",
    plan: row?.plan ?? null,
    store: row?.store ?? null,
    isTrial: row?.is_trial ?? false,
    willRenew: row?.will_renew ?? false,
    currentPeriodEnd: row?.current_period_end ?? null,
    trialEndsAt: row?.trial_ends_at ?? null,
  });
}

/** RevenueCat event types that mean the person currently has access. */
const GRANTING_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
  "PRODUCT_CHANGE",
]);

function statusForEvent(type: string, periodType: string | undefined): string {
  if (type === "EXPIRATION") return "expired";
  if (type === "BILLING_ISSUE") return "in_grace_period";
  if (type === "CANCELLATION") return "cancelled";
  if (!GRANTING_EVENTS.has(type)) return "none";
  return periodType === "TRIAL" ? "trialing" : "active";
}

function toISO(ms: number | null | undefined): string | null {
  return typeof ms === "number" && Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

/**
 * RevenueCat tells us what Apple did. Clients never write subscription state
 * themselves — a phone that has been tampered with cannot grant itself access.
 */
async function handleRevenueCatWebhook(request: Request, env: Env): Promise<Response> {
  const secret = env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Billing webhook is not configured" }, 503);

  const provided = request.headers.get("Authorization") ?? "";
  if (provided !== secret && provided !== `Bearer ${secret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const config = supabaseConfig(env);
  if (!config) return json({ error: "Database is not configured" }, 503);

  let event: {
    type?: string;
    app_user_id?: string;
    period_type?: string;
    product_id?: string;
    store?: string;
    expiration_at_ms?: number;
    event_timestamp_ms?: number;
  };
  try {
    ({ event } = (await request.json()) as { event: typeof event });
  } catch {
    return json({ error: "Body must be JSON" }, 400);
  }

  const userId = event?.app_user_id;
  const type = event?.type;
  if (!userId || !type) return json({ error: "Missing event fields" }, 400);

  // Anonymous RevenueCat ids belong to a phone, not a person — there is no
  // account to attach them to, so acknowledge and move on.
  if (userId.startsWith("$RCAnonymousID:")) return json({ ok: true, skipped: "anonymous" });

  const status = statusForEvent(type, event.period_type);
  const isTrial = event.period_type === "TRIAL";
  const expiresAt = toISO(event.expiration_at_ms);

  const ok = await upsert(
    config,
    "user_subscriptions",
    {
      user_id: userId,
      status,
      plan: event.product_id?.includes("year") ? "yearly" : event.product_id ? "monthly" : null,
      store: event.store ?? null,
      product_id: event.product_id ?? null,
      is_trial: isTrial,
      will_renew: status === "active" || status === "trialing",
      current_period_end: expiresAt,
      ...(isTrial ? { trial_ends_at: expiresAt } : {}),
      ...(type === "CANCELLATION" ? { cancelled_at: new Date().toISOString() } : {}),
      last_event: type,
      last_event_at: toISO(event.event_timestamp_ms) ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "user_id",
  );

  if (!ok) return json({ error: "Could not record the event" }, 502);
  return json({ ok: true });
}

async function handleAdmin(path: string, request: Request, env: Env): Promise<Response> {
  const secret = env.STUDIO_PASSWORD;
  if (!secret) {
    return json(
      { error: "Studio is not configured. Set STUDIO_PASSWORD on the backend to enable it." },
      503,
    );
  }

  if (path === "/admin/login" && request.method === "POST") {
    let password = "";
    try {
      ({ password } = (await request.json()) as { password: string });
    } catch {
      return json({ error: "Body must be JSON" }, 400);
    }
    if (password !== secret) {
      // Small delay blunts brute-force attempts without hurting the real user.
      await new Promise((resolve) => setTimeout(resolve, 400));
      return json({ error: "Incorrect password" }, 401);
    }
    return json(await issueToken(secret));
  }

  const authorized = await isValidToken(
    request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? null,
    secret,
  );
  if (!authorized) {
    return json({ error: "Session expired. Sign in again." }, 401);
  }

  if (path === "/admin/session") {
    return json({ ok: true });
  }

  if (path === "/admin/content") {
    if (request.method === "GET") {
      return proxyToStore(env, storeRequest("/doc"));
    }
    if (request.method === "PUT") {
      return proxyToStore(
        env,
        storeRequest("/doc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: await request.text(),
        }),
      );
    }
  }

  if (path === "/admin/history" && request.method === "GET") {
    return proxyToStore(env, storeRequest("/history"));
  }

  if (path === "/admin/rollback" && request.method === "POST") {
    return proxyToStore(
      env,
      storeRequest("/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
      }),
    );
  }

  if (path === "/admin/recordings" && request.method === "GET") {
    return proxyToStore(env, storeRequest("/recordings"));
  }

  if (path === "/admin/waitlist" && request.method === "GET") {
    return proxyToStore(env, storeRequest("/waitlist"));
  }

  if (path.startsWith("/admin/waitlist/") && request.method === "DELETE") {
    const email = path.slice("/admin/waitlist/".length);
    if (!email) return json({ error: "Missing email" }, 400);
    return proxyToStore(env, storeRequest(`/waitlist/${email}`, { method: "DELETE" }));
  }

  if (path.startsWith("/admin/audio/")) {
    const key = path.slice("/admin/audio/".length);
    if (!key) return json({ error: "Missing audio key" }, 400);

    if (request.method === "PUT") {
      return proxyToStore(
        env,
        storeRequest(`/recording/${key}`, {
          method: "PUT",
          headers: {
            "Content-Type": request.headers.get("Content-Type") ?? "audio/webm",
            "X-Duration-Ms": request.headers.get("X-Duration-Ms") ?? "0",
          },
          body: await request.arrayBuffer(),
        }),
      );
    }
    if (request.method === "DELETE") {
      return proxyToStore(env, storeRequest(`/recording/${key}`, { method: "DELETE" }));
    }
  }

  return json({ error: "Not found" }, 404);
}

async function proxyToStore(env: Env, request: Request): Promise<Response> {
  const res = await env.DO.fetch(request);
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function handleTTS(url: URL, env: Env): Promise<Response> {
  const text = (url.searchParams.get("text") ?? "").trim();
  const voice = url.searchParams.get("voice") ?? DEFAULT_VOICE;

  if (!text) return json({ error: "Missing text parameter" }, 400);
  if (text.length > MAX_TEXT_LENGTH) return json({ error: "Text too long" }, 413);
  if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) {
    return json({ error: "Azure TTS is not configured on the server" }, 503);
  }

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const ssml = `<speak version='1.0' xml:lang='fa-IR'><voice name='${voice}'>${escapeXml(text)}</voice></speak>`;

  let azureRes: Response;
  try {
    azureRes = await fetch(
      `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "learndari-app",
        },
        body: ssml,
      },
    );
  } catch (err) {
    console.error("Azure TTS fetch failed", err instanceof Error ? err.message : err);
    return json({ error: "TTS upstream unreachable" }, 502);
  }

  if (!azureRes.ok) {
    const detail = await azureRes.text().catch(() => "");
    console.error("Azure TTS error", azureRes.status, detail.slice(0, 300));
    return json({ error: "TTS upstream error", upstreamStatus: azureRes.status }, 502);
  }

  const audio = new Response(azureRes.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
      ...CORS_HEADERS,
    },
  });

  await cache.put(cacheKey, audio.clone());
  return audio;
}
