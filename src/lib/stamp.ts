import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export type StampPages = "all" | "first" | "last";

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Adds a QR code + verification footer to the PDF and returns the new bytes. */
export async function stampPdf(
  input: Uint8Array,
  opts: { verifyLink: string; id: string; pages: StampPages; host: string },
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(input);
  const qrPng = await QRCode.toBuffer(opts.verifyLink, {
    errorCorrectionLevel: "M",
    margin: 4, // full 4-module quiet zone baked into the image, required by QR scanners
    scale: 8, // integer pixels per module keeps edges crisp when scanned from a screen
    color: { dark: "#0b1f3a", light: "#ffffff" },
  });
  const qr = await pdf.embedPng(qrPng);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const all = pdf.getPages();
  const targets = opts.pages === "all" ? all : opts.pages === "first" ? [all[0]] : [all[all.length - 1]];

  const navy = rgb(0.043, 0.122, 0.227);
  const grey = rgb(0.35, 0.38, 0.43);

  for (const page of targets) {
    const box = page.getCropBox();
    const size = 88; // includes the quiet zone, about 31 mm printed: still scans on screen at 75% PDF zoom (about 2 px per module)
    const margin = 14;
    const x = box.x + box.width - size - margin;
    const y = box.y + margin;

    const lines = [
      { text: "Scan to verify authenticity", f: bold, s: 6.5, c: navy },
      { text: opts.host, f: font, s: 6.5, c: navy },
      { text: `ID: ${opts.id}`, f: font, s: 5, c: grey },
    ];
    const textW = Math.max(...lines.map((l) => l.f.widthOfTextAtSize(l.text, l.s)));

    // white backing so the stamp stays readable on any page background
    page.drawRectangle({
      x: x - textW - 14,
      y: y - 4,
      width: textW + size + 18,
      height: size + 8,
      color: rgb(1, 1, 1),
    });
    page.drawImage(qr, { x, y, width: size, height: size });

    let ty = y + size / 2 + 8;
    for (const l of lines) {
      const w = l.f.widthOfTextAtSize(l.text, l.s);
      page.drawText(l.text, { x: x - 6 - w, y: ty, size: l.s, font: l.f, color: l.c });
      ty -= l.s + 3.5;
    }
  }

  pdf.setProducer("Finora eVerify");
  return pdf.save();
}
