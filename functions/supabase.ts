/**
 * Minimal Supabase REST client for the LearnDari worker.
 *
 * The worker is the only thing that talks to Supabase. It uses the service
 * role key, so every new table can keep RLS on with no policies at all — the
 * database is closed to the outside world and the API is the single door in.
 * That also keeps the learner's Rork Auth identity working against a project
 * that is otherwise on native Supabase Auth.
 */

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export function supabaseConfig(env: {
  SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}): SupabaseConfig | null {
  const url = env.SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

async function rest(
  config: SupabaseConfig,
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("apikey", config.serviceRoleKey);
  headers.set("Authorization", `Bearer ${config.serviceRoleKey}`);
  headers.set("Content-Type", "application/json");
  if (init.prefer) headers.set("Prefer", init.prefer);

  return fetch(`${config.url}/rest/v1${path}`, { ...init, headers });
}

/** Reads a single row, or null when there is none. */
export async function selectOne<T>(
  config: SupabaseConfig,
  table: string,
  query: string,
): Promise<T | null> {
  const res = await rest(config, `/${table}?${query}&limit=1`);
  if (!res.ok) {
    console.error(`supabase select ${table} failed`, res.status);
    return null;
  }
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

/** Inserts or updates by primary key. Returns false on failure. */
export async function upsert(
  config: SupabaseConfig,
  table: string,
  row: Record<string, unknown>,
  onConflict: string,
): Promise<boolean> {
  const res = await rest(config, `/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    body: JSON.stringify(row),
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  if (!res.ok) {
    console.error(`supabase upsert ${table} failed`, res.status, await res.text());
    return false;
  }
  return true;
}

export async function remove(
  config: SupabaseConfig,
  table: string,
  query: string,
): Promise<boolean> {
  const res = await rest(config, `/${table}?${query}`, {
    method: "DELETE",
    prefer: "return=minimal",
  });
  if (!res.ok) {
    console.error(`supabase delete ${table} failed`, res.status);
    return false;
  }
  return true;
}
