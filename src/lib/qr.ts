import QRCode from "qrcode";
import { site } from "./config";

/** Records issued without a PDF store this marker instead of a file reference. */
export const QR_ONLY_REF = "qr-only";
export const isQrOnly = (fileRef: string) => fileRef === QR_ONLY_REF;
/** `sha256` is NOT NULL UNIQUE, so QR-only records get a placeholder that can never match a real 64-hex hash. */
export const qrOnlyPlaceholderHash = (id: string) => `qr-only:${id}`;

export const verifyLinkFor = (id: string) => `${site.verifyUrl}/audit/${id}`;

const colors = { dark: "#0b1f3a", light: "#ffffff" };

/** Print-ready PNG: integer pixels per module and a full 4-module quiet zone. */
export function qrPng(link: string): Promise<Buffer> {
  return QRCode.toBuffer(link, { errorCorrectionLevel: "M", margin: 4, scale: 16, color: colors });
}

/** Vector QR for professional printing and scaling. */
export function qrSvg(link: string): Promise<string> {
  return QRCode.toString(link, { type: "svg", errorCorrectionLevel: "M", margin: 4, color: colors });
}

/** Refuse to issue a QR that points at localhost in production: nobody else could ever scan it. */
export function publicUrlProblem(): string | null {
  if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(site.verifyUrl)) {
    return "NEXT_PUBLIC_VERIFY_URL is not set to the public address. Set it before issuing documents.";
  }
  return null;
}
