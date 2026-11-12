import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { db, ensureDb } from "@/lib/db";
import { UUID_RE } from "@/lib/format";
import { qrPng, qrSvg, verifyLinkFor } from "@/lib/qr";
import { documents } from "@/lib/schema";

// GET /api/admin/qr/<id>?format=png|svg  ->  print-ready QR code for the document's verification link
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });
  await ensureDb();
  const [d] = await db.select({ id: documents.id, companyName: documents.companyName }).from(documents).where(eq(documents.id, id)).limit(1);
  if (!d) return new Response("Not found", { status: 404 });

  const format = new URL(req.url).searchParams.get("format") === "svg" ? "svg" : "png";
  const link = verifyLinkFor(d.id);
  const base = `qr-${d.companyName.replace(/[^\w.-]+/g, "_").slice(0, 40) || "document"}-${d.id.slice(0, 8)}`;
  const headers = { "Content-Disposition": `attachment; filename="${base}.${format}"`, "Cache-Control": "private, no-store" };

  if (format === "svg") {
    return new Response(await qrSvg(link), { headers: { ...headers, "Content-Type": "image/svg+xml" } });
  }
  return new Response(new Uint8Array(await qrPng(link)), { headers: { ...headers, "Content-Type": "image/png" } });
}
