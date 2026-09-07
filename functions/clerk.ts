/**
 * Clerk session-token verification for the worker.
 *
 * LearnDari is moving identity to Clerk (the apps + website standardise on it,
 * and the old website's users are already Clerk users). The worker used to
 * trust an `X-Rork-User-Id` header injected by the Rork platform; going forward
 * it verifies a Clerk session JWT itself, so identity is owned by us and works
 * off any host.
 *
 * Verification is offline: we fetch Clerk's public JWKS once (cached), then
 * check the RS256 signature, expiry, and issuer. No secret key is needed —
 * the JWKS is public — so this needs no new worker secret.
 */

/** Clerk keys are stable; cache the JWKS in memory for an hour. */
const JWKS_URL = "https://clerk.learndari.com/.well-known/jwks.json";
const JWKS_TTL_MS = 60 * 60 * 1000;

/** Issuers our tokens can legitimately carry (direct domain and the proxy). */
const ALLOWED_ISSUERS = new Set<string>([
  "https://clerk.learndari.com",
  "https://learndari.com/__clerk",
  "https://learndari.com/__clerk/",
]);

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
  use?: string;
}

let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;

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

async function getJwks(): Promise<Jwk[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }
  try {
    const res = await fetch(JWKS_URL);
    if (!res.ok) return jwksCache?.keys ?? [];
    const body = (await res.json()) as { keys?: Jwk[] };
    jwksCache = { keys: body.keys ?? [], fetchedAt: Date.now() };
    return jwksCache.keys;
  } catch {
    return jwksCache?.keys ?? [];
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
 * token is valid, otherwise null — so a Rork token or a bad token simply
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
  if (!ALLOWED_ISSUERS.has(iss)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return null;
  if (typeof payload.nbf === "number" && payload.nbf > now + 5) return null;
  if (typeof payload.sub !== "string" || !payload.sub) return null;

  const jwk = (await getJwks()).find((k) => k.kid === header.kid);
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
