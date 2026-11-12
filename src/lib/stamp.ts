import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";

export type StampPages = "all" | "first" | "last";

export type StampDetails = {
  verifyLink: string;
  id: string;
  pages: StampPages;
  auditDate?: string | null; // already formatted, e.g. "06 Feb 2026"
  fyEnd?: string | null;
  issuedOn: string;
};

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Adds the verification block to the PDF: QR code on the left, details on the right
 * ("Scan to verify", dates, verification ID, link). Returns the new PDF bytes.
 */
export async function stampPdf(input: Uint8Array, d: StampDetails): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(input);
  const qrPng = await QRCode.toBuffer(d.verifyLink, {
    errorCorrectionLevel: "M",
    margin: 4, // full 4-module quiet zone baked into the image, required by QR scanners
    scale: 8, // integer pixels per module keeps edges crisp when scanned from a screen
    color: { dark: "#0b1f3a", light: "#ffffff" },
  });
  const qr = await pdf.embedPng(qrPng);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const all = pdf.getPages();
  const targets = d.pages === "all" ? all : d.pages === "first" ? [all[0]] : [all[all.length - 1]];

  const navy = rgb(0.043, 0.122, 0.227);
  const teal = rgb(0.059, 0.463, 0.431);
  const grey = rgb(0.36, 0.4, 0.45);

  type Line = { text: string; f: PDFFont; s: number; c: ReturnType<typeof rgb>; gapAfter: number };
  const lines: Line[] = [{ text: "Scan to verify", f: bold, s: 12, c: teal, gapAfter: 5 }];
  if (d.auditDate) lines.push({ text: `Audit date: ${d.auditDate}`, f: font, s: 8.5, c: navy, gapAfter: 3.5 });
  if (d.fyEnd) lines.push({ text: `Financial year end: ${d.fyEnd}`, f: font, s: 8.5, c: navy, gapAfter: 3.5 });
  lines.push({ text: `Issued on: ${d.issuedOn}`, f: font, s: 8.5, c: navy, gapAfter: 3.5 });
  lines.push({ text: `Verification ID: ${d.id}`, f: font, s: 8.5, c: navy, gapAfter: 4 });
  lines.push({ text: d.verifyLink, f: font, s: 6, c: grey, gapAfter: 0 });

  const qrSize = 84; // includes the quiet zone, about 30 mm printed
  const gap = 6;
  const pad = 6;
  const textW = Math.max(...lines.map((l) => l.f.widthOfTextAtSize(l.text, l.s)));
  const textH = lines.reduce((h, l) => h + l.s + l.gapAfter, 0);
  const blockW = pad + qrSize + gap + textW + pad;
  const blockH = Math.max(qrSize, textH) + pad * 2;

  for (const page of targets) {
    const box = page.getCropBox();
    const margin = 14;
    // shrink the whole block on very small pages so it never runs off the edge
    const scale = Math.min(1, (box.width - margin * 2) / blockW);
    const x0 = box.x + margin;
    const y0 = box.y + margin;
    const w = blockW * scale;
    const h = blockH * scale;

    page.drawRectangle({
      x: x0,
      y: y0,
      width: w,
      height: h,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.89, 0.88, 0.85),
      borderWidth: 0.5,
    });

    page.drawImage(qr, { x: x0 + pad * scale, y: y0 + (h - qrSize * scale) / 2, width: qrSize * scale, height: qrSize * scale });

    // text block, vertically centred beside the QR code
    const tx = x0 + (pad + qrSize + gap) * scale;
    let ty = y0 + h / 2 + (textH * scale) / 2;
    for (const l of lines) {
      ty -= l.s * scale;
      page.drawText(l.text, { x: tx, y: ty, size: l.s * scale, font: l.f, color: l.c });
      ty -= l.gapAfter * scale;
    }
  }

  pdf.setProducer("Finora eVerify");
  return pdf.save();
}
