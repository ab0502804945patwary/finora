import { eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { SHA_RE } from "@/lib/format";
import { documents } from "@/lib/schema";

// GET /api/lookup?hash=<sha256>  ->  { id } of the issued document with this fingerprint
export async function GET(req: Request) {
  const hash = (new URL(req.url).searchParams.get("hash") || "").toLowerCase();
  if (!SHA_RE.test(hash)) return Response.json({ error: "invalid hash" }, { status: 400 });
  await ensureDb();
  const [d] = await db.select({ id: documents.id }).from(documents).where(eq(documents.sha256, hash)).limit(1);
  if (!d) return Response.json({ found: false }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return Response.json({ found: true, id: d.id }, { headers: { "Cache-Control": "no-store" } });
}
