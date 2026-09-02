import { DurableObject } from "cloudflare:workers";
import { validateDocument, type ContentDocument, type ContentEnvelope } from "./content-types";
import { SEED_CONTENT } from "./seed";

/**
 * Single source of truth for LearnDari content.
 *
 * Holds the current content document, a rollback history of previous versions,
 * and the human audio recordings uploaded from the Studio. One instance
 * (id "main") serves the whole app.
 */
export class ContentStore extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        version INTEGER PRIMARY KEY AUTOINCREMENT,
        body TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL
      )
    `);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS progress (
        user_id TEXT PRIMARY KEY,
        body TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS waitlist (
        email TEXT PRIMARY KEY,
        source TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL
      )
    `);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS recordings (
        key TEXT PRIMARY KEY,
        mime TEXT NOT NULL,
        bytes BLOB NOT NULL,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `);
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/doc" && request.method === "GET") {
      return Response.json(this.currentEnvelope());
    }

    if (path === "/doc" && request.method === "PUT") {
      return this.saveDocument(request);
    }

    if (path === "/history" && request.method === "GET") {
      const rows = this.ctx.storage.sql
        .exec<{ version: number; note: string; created_at: number }>(
          "SELECT version, note, created_at FROM documents ORDER BY version DESC LIMIT 40",
        )
        .toArray();
      return Response.json({
        versions: rows.map((row) => ({ version: row.version, note: row.note, createdAt: row.created_at })),
      });
    }

    if (path === "/rollback" && request.method === "POST") {
      const { version } = (await request.json()) as { version: number };
      const row = this.ctx.storage.sql
        .exec<{ body: string }>("SELECT body FROM documents WHERE version = ?", version)
        .toArray()[0];
      if (!row) return Response.json({ error: "Unknown version" }, { status: 404 });
      const restored = JSON.parse(row.body) as ContentDocument;
      this.insertVersion(restored, `Rolled back to v${version}`);
      return Response.json(this.currentEnvelope());
    }

    if (path === "/recordings" && request.method === "GET") {
      const rows = this.ctx.storage.sql
        .exec<{ key: string; mime: string; duration_ms: number; created_at: number }>(
          "SELECT key, mime, duration_ms, created_at FROM recordings ORDER BY created_at DESC",
        )
        .toArray();
      return Response.json({
        recordings: rows.map((row) => ({
          key: row.key,
          mime: row.mime,
          durationMs: row.duration_ms,
          createdAt: row.created_at,
        })),
      });
    }

    if (path.startsWith("/progress/")) {
      const userId = decodeURIComponent(path.slice("/progress/".length));
      if (request.method === "GET") return this.getProgress(userId);
      if (request.method === "PUT") return this.putProgress(userId, request);
      if (request.method === "DELETE") {
        this.ctx.storage.sql.exec("DELETE FROM progress WHERE user_id = ?", userId);
        return Response.json({ ok: true });
      }
    }

    if (path === "/waitlist" && request.method === "POST") {
      return this.addToWaitlist(request);
    }

    if (path === "/waitlist" && request.method === "GET") {
      const rows = this.ctx.storage.sql
        .exec<{ email: string; source: string; created_at: number }>(
          "SELECT email, source, created_at FROM waitlist ORDER BY created_at DESC",
        )
        .toArray();
      return Response.json({
        entries: rows.map((row) => ({
          email: row.email,
          source: row.source,
          createdAt: row.created_at,
        })),
      });
    }

    if (path.startsWith("/waitlist/") && request.method === "DELETE") {
      const email = decodeURIComponent(path.slice("/waitlist/".length));
      this.ctx.storage.sql.exec("DELETE FROM waitlist WHERE email = ?", email);
      return Response.json({ ok: true });
    }

    if (path.startsWith("/recording/")) {
      const key = decodeURIComponent(path.slice("/recording/".length));
      if (request.method === "PUT") return this.putRecording(key, request);
      if (request.method === "GET") return this.getRecording(key);
      if (request.method === "DELETE") {
        this.ctx.storage.sql.exec("DELETE FROM recordings WHERE key = ?", key);
        return Response.json({ ok: true });
      }
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // MARK: - Documents

  private currentEnvelope(): ContentEnvelope {
    const row = this.ctx.storage.sql
      .exec<{ version: number; body: string; created_at: number }>(
        "SELECT version, body, created_at FROM documents ORDER BY version DESC LIMIT 1",
      )
      .toArray()[0];

    if (!row) {
      // First ever read: plant the content that shipped inside the app.
      const version = this.insertVersion(SEED_CONTENT, "Initial content");
      return { version, updatedAt: Date.now(), content: SEED_CONTENT };
    }

    return {
      version: row.version,
      updatedAt: row.created_at,
      content: JSON.parse(row.body) as ContentDocument,
    };
  }

  private async saveDocument(request: Request): Promise<Response> {
    let payload: { content: unknown; note?: string };
    try {
      payload = (await request.json()) as { content: unknown; note?: string };
    } catch {
      return Response.json({ error: "Body must be JSON" }, { status: 400 });
    }

    const problems = validateDocument(payload.content);
    if (problems.length > 0) {
      return Response.json({ error: "Content is not publishable", problems }, { status: 422 });
    }

    const version = this.insertVersion(payload.content as ContentDocument, payload.note ?? "Saved from Studio");
    return Response.json({ version, updatedAt: Date.now(), content: payload.content });
  }

  private insertVersion(content: ContentDocument, note: string): number {
    this.ctx.storage.sql.exec(
      "INSERT INTO documents (body, note, created_at) VALUES (?, ?, ?)",
      JSON.stringify(content),
      note,
      Date.now(),
    );
    const row = this.ctx.storage.sql
      .exec<{ version: number }>("SELECT MAX(version) AS version FROM documents")
      .toArray()[0];
    // Keep the rollback list bounded so storage cannot creep forever.
    this.ctx.storage.sql.exec(
      "DELETE FROM documents WHERE version <= ?",
      Math.max(0, (row?.version ?? 0) - 50),
    );
    return row?.version ?? 1;
  }

  // MARK: - Learner progress

  private getProgress(userId: string): Response {
    const row = this.ctx.storage.sql
      .exec<{ body: string; updated_at: number }>(
        "SELECT body, updated_at FROM progress WHERE user_id = ?",
        userId,
      )
      .toArray()[0];

    if (!row) return Response.json({ progress: null, updatedAt: 0 });
    return Response.json({ progress: JSON.parse(row.body), updatedAt: row.updated_at });
  }

  private async putProgress(userId: string, request: Request): Promise<Response> {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Body must be JSON" }, { status: 400 });
    }

    const body = JSON.stringify(payload);
    if (body.length > 400_000) {
      return Response.json({ error: "Progress payload too large" }, { status: 413 });
    }

    const updatedAt = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO progress (user_id, body, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`,
      userId,
      body,
      updatedAt,
    );

    return Response.json({ ok: true, updatedAt });
  }

  // MARK: - Waitlist

  /**
   * Records an interest signup. Re-submitting the same address is a no-op
   * rather than an error, so someone who signs up twice still sees success.
   */
  private async addToWaitlist(request: Request): Promise<Response> {
    let payload: { email?: string; source?: string };
    try {
      payload = (await request.json()) as { email?: string; source?: string };
    } catch {
      return Response.json({ error: "Body must be JSON" }, { status: 400 });
    }

    const email = (payload.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return Response.json({ error: "That email doesn't look right" }, { status: 400 });
    }

    this.ctx.storage.sql.exec(
      `INSERT INTO waitlist (email, source, created_at) VALUES (?, ?, ?)
       ON CONFLICT(email) DO NOTHING`,
      email,
      (payload.source ?? "").slice(0, 60),
      Date.now(),
    );

    return Response.json({ ok: true });
  }

  // MARK: - Recordings

  private async putRecording(key: string, request: Request): Promise<Response> {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength === 0) {
      return Response.json({ error: "Empty recording" }, { status: 400 });
    }
    if (bytes.byteLength > 1_500_000) {
      return Response.json({ error: "Recording too large (1.5 MB max)" }, { status: 413 });
    }
    const mime = request.headers.get("Content-Type") ?? "audio/webm";
    const durationMs = Number(request.headers.get("X-Duration-Ms") ?? "0");

    this.ctx.storage.sql.exec(
      `INSERT INTO recordings (key, mime, bytes, duration_ms, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         mime = excluded.mime,
         bytes = excluded.bytes,
         duration_ms = excluded.duration_ms,
         created_at = excluded.created_at`,
      key,
      mime,
      new Uint8Array(bytes),
      Number.isFinite(durationMs) ? Math.round(durationMs) : 0,
      Date.now(),
    );

    return Response.json({ ok: true, key, bytes: bytes.byteLength });
  }

  private getRecording(key: string): Response {
    const row = this.ctx.storage.sql
      .exec<{ mime: string; bytes: ArrayBuffer; created_at: number }>(
        "SELECT mime, bytes, created_at FROM recordings WHERE key = ?",
        key,
      )
      .toArray()[0];

    if (!row) return new Response("Not found", { status: 404 });

    return new Response(row.bytes, {
      headers: {
        "Content-Type": row.mime,
        // Short cache so a re-record is audible on the next listen; the ETag
        // still lets clients revalidate cheaply.
        "Cache-Control": "public, max-age=60, must-revalidate",
        ETag: `"${key}-${row.created_at}"`,
      },
    });
  }
}
