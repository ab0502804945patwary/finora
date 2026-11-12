import { desc, eq, like, or } from "drizzle-orm";
import { documents, type Doc } from "./schema";

export type { Doc };

/*
 * Data access for issued documents. One interface, two backends:
 *   - Supabase Postgres via its REST API (PostgREST), when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *     No database password or connection pool needed, so it works on serverless hosting.
 *     The table is created once with supabase/schema.sql.
 *   - Local SQLite file (./data/local.db) for development without Supabase.
 */

/** Local SQLite is loaded only when Supabase is not configured: its module creates ./data on import, which is read-only on Vercel. */
async function localDb() {
  const m = await import("./db");
  await m.ensureDb();
  return m.db;
}

function supabase() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return {
    table: `${url}/rest/v1/documents`,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } as Record<string, string>,
  };
}

type Row = {
  id: string;
  company_name: string;
  registration_no: string | null;
  doc_type: string;
  audit_date: string | null;
  fy_end: string | null;
  issued_on: string;
  sha256: string;
  original_sha256: string | null;
  status: "valid" | "revoked";
  revoked_reason: string | null;
  file_ref: string;
  file_name: string | null;
  created_at: number;
};

const fromRow = (r: Row): Doc => ({
  id: r.id,
  companyName: r.company_name,
  registrationNo: r.registration_no,
  docType: r.doc_type,
  auditDate: r.audit_date,
  fyEnd: r.fy_end,
  issuedOn: r.issued_on,
  sha256: r.sha256,
  originalSha256: r.original_sha256,
  status: r.status,
  revokedReason: r.revoked_reason,
  fileRef: r.file_ref,
  fileName: r.file_name,
  createdAt: Number(r.created_at),
});

const toRow = (d: Doc): Row => ({
  id: d.id,
  company_name: d.companyName,
  registration_no: d.registrationNo,
  doc_type: d.docType,
  audit_date: d.auditDate,
  fy_end: d.fyEnd,
  issued_on: d.issuedOn,
  sha256: d.sha256,
  original_sha256: d.originalSha256,
  status: d.status,
  revoked_reason: d.revokedReason,
  file_ref: d.fileRef,
  file_name: d.fileName,
  created_at: d.createdAt,
});

async function rest<T>(sb: NonNullable<ReturnType<typeof supabase>>, query: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${sb.table}${query}`, { ...init, headers: { ...sb.headers, ...(init.headers as Record<string, string>) }, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase database error ${res.status}: ${body.slice(0, 300)}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Characters that have meaning inside a PostgREST filter value. */
const cleanTerm = (q: string) => q.replace(/[,()*"\\%_]/g, "").trim().slice(0, 100);

export async function insertDoc(d: Doc): Promise<void> {
  const sb = supabase();
  if (sb) {
    await rest(sb, "", { method: "POST", body: JSON.stringify(toRow(d)), headers: { Prefer: "return=minimal" } });
    return;
  }
  const db = await localDb();
  await db.insert(documents).values(d);
}

export async function getDoc(id: string): Promise<Doc | null> {
  const sb = supabase();
  if (sb) {
    const rows = await rest<Row[]>(sb, `?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
    return rows[0] ? fromRow(rows[0]) : null;
  }
  const db = await localDb();
  const [d] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return d ?? null;
}

export async function findIdBySha(hash: string): Promise<string | null> {
  const sb = supabase();
  if (sb) {
    const rows = await rest<{ id: string }[]>(sb, `?sha256=eq.${encodeURIComponent(hash)}&select=id&limit=1`);
    return rows[0]?.id ?? null;
  }
  const db = await localDb();
  const [d] = await db.select({ id: documents.id }).from(documents).where(eq(documents.sha256, hash)).limit(1);
  return d?.id ?? null;
}

export async function listDocs(q: string, limit = 200): Promise<Doc[]> {
  const term = cleanTerm(q);
  const sb = supabase();
  if (sb) {
    const filter = term ? `&or=(company_name.ilike.*${encodeURIComponent(term)}*,registration_no.ilike.*${encodeURIComponent(term)}*,id.ilike.*${encodeURIComponent(term)}*)` : "";
    const rows = await rest<Row[]>(sb, `?select=*&order=created_at.desc&limit=${limit}${filter}`);
    return rows.map(fromRow);
  }
  const db = await localDb();
  const pattern = `%${term}%`;
  return db
    .select()
    .from(documents)
    .where(term ? or(like(documents.companyName, pattern), like(documents.registrationNo, pattern), like(documents.id, pattern)) : undefined)
    .orderBy(desc(documents.createdAt))
    .limit(limit);
}

export async function updateStatus(id: string, status: "valid" | "revoked", reason: string | null): Promise<void> {
  const sb = supabase();
  if (sb) {
    await rest(sb, `?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, revoked_reason: reason }),
      headers: { Prefer: "return=minimal" },
    });
    return;
  }
  const db = await localDb();
  await db.update(documents).set({ status, revokedReason: reason }).where(eq(documents.id, id));
}
