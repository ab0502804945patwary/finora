import { isAdmin } from "@/lib/auth";
import { getDoc } from "@/lib/documents";
import { UUID_RE } from "@/lib/format";
import { isQrOnly } from "@/lib/qr";
import { readPdf } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });
  const d = await getDoc(id);
  if (!d || isQrOnly(d.fileRef)) return new Response("Not found", { status: 404 });

  const bytes = await readPdf(d.fileRef);
  const base = (d.fileName || "document.pdf").replace(/\.pdf$/i, "").replace(/[^\w.-]+/g, "_").slice(0, 80);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${base}-verified.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
