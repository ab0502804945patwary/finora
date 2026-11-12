import { isAdmin } from "@/lib/auth";
import { getDoc } from "@/lib/documents";
import { UUID_RE } from "@/lib/format";
import { qrPng, qrSvg, verifyLinkFor } from "@/lib/qr";

// GET /api/admin/qr/<id>?format=png|svg  ->  print-ready QR code for the document's verification link
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });
  const d = await getDoc(id);
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
