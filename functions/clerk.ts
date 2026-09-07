/**
 * Clerk session-token verification for the worker.
 *
 * LearnDari owns identity through Clerk (the apps + website standardise on it,
 * and the old website's users are already Clerk users). The worker verifies a
 * Clerk session JWT itself rather than trusting a platform-injected header.
 *
 * Verification is offline: fetch Clerk's public JWKS (cached), then check the
 * RS256 signature, expiry, and issuer. No secret key is needed.
 *
 * Both the production instance and the development instance are accepted so the
 * new website can be built and tested before the production cutover. The
 * production instance (direct domain and the /__clerk proxy) shares one set of
 * signing keys; the development instance has its own.
 *
 * NOTE: before real launch, drop the development issuer from this map so the
 * live backend only trusts production tokens.
 */

/** Issuer -> JWKS endpoint. An issuer not listed here is rejected. */
const JWKS_BY_ISSUER: Record<string, string> = {
  "https://clerk.learndari.com": "https://clerk.learndari.com/.well-known/jwks.json",
  "https://learndari.com/__clerk": "https://clerk.learndari.com/.well-known/jwks.json",
  "https://learndari.com/__clerk/": "https://clerk.learndari.com/.well-known/jwks.json",
  "https://premium-bobcat-39.clerk.accounts.dev":
    "https://premium-bobcat-39.clerk.accounts.dev/.well-known/jwks.json",
};

const JWKS_TTL_MS = 60 * 60 * 1000;

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
  use?: string;
}

/** JWKS cached per endpoint URL. */
const jwksCache = new Map<string, { keys: Jwk[]; fetchedAt: number }>();

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function decodeJson(segment: string): Record<string, unknown> | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
  } catch {
    return null;
  }
}

async function getJwks(url: string): Promise<Jwk[]> {
  const cached = jwksCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) {
    return cached.keys;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return cached?.keys ?? [];
    const body = (await res.json()) as { keys?: Jwk[] };
    const keys = body.keys ?? [];
    jwksCache.set(url, { keys, fetchedAt: Date.now() });
    return keys;
  } catch {
    return cached?.keys ?? [];
  }
}

async function importKey(jwk: Jwk): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

/**
 * Verify a Clerk session token. Returns the Clerk user id (`sub`) when the
 * token is valid, otherwise null — so a non-Clerk token or a bad token simply
 * falls through to the legacy path.
 */
export async function verifyClerkToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  if (!header || !payload) return null;
  if (header.alg !== "RS256" || typeof header.kid !== "string") return null;

  const iss = typeof payload.iss === "string" ? payload.iss : "";
  const jwksUrl = JWKS_BY_ISSUER[iss];
  if (!jwksUrl) return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return null;
  if (typeof payload.nbf === "number" && payload.nbf > now + 5) return null;
  if (typeof payload.sub !== "string" || !payload.sub) return null;

  const jwk = (await getJwks(jwksUrl)).find((k) => k.kid === header.kid);
  if (!jwk) return null;

  try {
    const key = await importKey(jwk);
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlToBytes(parts[2]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
    return ok ? payload.sub : null;
  } catch {
    return null;
  }
}
