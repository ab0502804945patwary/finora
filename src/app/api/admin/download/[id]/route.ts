import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { db, ensureDb } from "@/lib/db";
import { UUID_RE } from "@/lib/format";
import { isQrOnly } from "@/lib/qr";
import { documents } from "@/lib/schema";
import { readPdf } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });
  await ensureDb();
  const [d] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
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
