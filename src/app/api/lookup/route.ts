import { findIdBySha } from "@/lib/documents";
import { SHA_RE } from "@/lib/format";

// GET /api/lookup?hash=<sha256>  ->  { id } of the issued document with this fingerprint
export async function GET(req: Request) {
  const hash = (new URL(req.url).searchParams.get("hash") || "").toLowerCase();
  if (!SHA_RE.test(hash)) return Response.json({ error: "invalid hash" }, { status: 400 });
  const id = await findIdBySha(hash);
  if (!id) return Response.json({ found: false }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return Response.json({ found: true, id }, { headers: { "Cache-Control": "no-store" } });
}
