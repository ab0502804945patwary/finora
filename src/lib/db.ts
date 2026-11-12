import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:./data/local.db";

const g = globalThis as unknown as { __libsql?: Client; __dbReady?: Promise<void> };

if (!g.__libsql) {
  if (url.startsWith("file:")) fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
  g.__libsql = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
}

const client = g.__libsql;
export const db = drizzle(client, { schema });

/** Creates the table on first use, so no separate migration step is needed. */
export function ensureDb(): Promise<void> {
  // Vercel's filesystem is read-only, so a local SQLite file can never work there.
  if (process.env.VERCEL && url.startsWith("file:")) {
    return Promise.reject(new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (database), or TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, on Vercel."));
  }
  g.__dbReady ??= client
    .batch(
      [
        `CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          company_name TEXT NOT NULL,
          registration_no TEXT,
          doc_type TEXT NOT NULL,
          audit_date TEXT,
          fy_end TEXT,
          issued_on TEXT NOT NULL,
          sha256 TEXT NOT NULL UNIQUE,
          original_sha256 TEXT,
          status TEXT NOT NULL DEFAULT 'valid',
          revoked_reason TEXT,
          file_ref TEXT NOT NULL,
          file_name TEXT,
          created_at INTEGER NOT NULL
        )`,
        `CREATE INDEX IF NOT EXISTS documents_company_idx ON documents(company_name)`,
      ],
      "write",
    )
    .then(() => undefined)
    .catch((e) => {
      g.__dbReady = undefined;
      throw e;
    });
  return g.__dbReady;
}
