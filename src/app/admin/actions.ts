"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { docTypes } from "@/lib/config";
import { insertDoc, updateStatus } from "@/lib/documents";
import { fmtDate, UUID_RE } from "@/lib/format";
import { publicUrlProblem, qrOnlyPlaceholderHash, QR_ONLY_REF, verifyLinkFor } from "@/lib/qr";
import { sha256Hex, stampPdf, type StampPages } from "@/lib/stamp";
import { savePdf } from "@/lib/storage";

export type FormState = { error?: string } | undefined;

const MAX_BYTES = 4 * 1024 * 1024;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const optDate = (v: string) => (v && DATE_RE.test(v) ? v : null);

export async function login(_: FormState, form: FormData): Promise<FormState> {
  // small fixed delay slows down password guessing
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "Wrong password." };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function createDocument(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  // "qr" = no PDF upload: record the details and give the admin a QR code to place on the document manually
  const qrOnly = str(form, "mode") === "qr";

  const file = form.get("file");
  if (!qrOnly) {
    if (!(file instanceof File) || file.size === 0) return { error: "Choose a PDF file." };
    if (file.size > MAX_BYTES) return { error: "PDF must be 4 MB or smaller." };
  }

  const companyName = str(form, "companyName");
  const docType = str(form, "docType");
  const issuedOn = str(form, "issuedOn");
  if (!companyName) return { error: "Company name is required." };
  if (!docTypes.includes(docType as (typeof docTypes)[number])) return { error: "Pick a document type." };
  if (!DATE_RE.test(issuedOn)) return { error: "Issue date is required." };
  const auditDate = optDate(str(form, "auditDate"));
  const fyEnd = optDate(str(form, "fyEnd"));
  const pagesRaw = str(form, "pages");
  const pages: StampPages = pagesRaw === "first" || pagesRaw === "last" ? pagesRaw : "all";

  const problem = publicUrlProblem();
  if (problem) return { error: problem };

  const id = randomUUID();
  let sha256: string;
  let originalSha256: string | null = null;
  let fileRef: string;
  let fileName: string | null = null;

  if (qrOnly) {
    sha256 = qrOnlyPlaceholderHash(id);
    fileRef = QR_ONLY_REF;
  } else {
    const upload = file as File;
    const original = new Uint8Array(await upload.arrayBuffer());
    if (new TextDecoder().decode(original.slice(0, 5)) !== "%PDF-") return { error: "That file is not a PDF." };

    let stamped: Uint8Array;
    try {
      stamped = await stampPdf(original, {
        verifyLink: verifyLinkFor(id),
        id,
        pages,
        auditDate: auditDate ? fmtDate(auditDate) : null,
        fyEnd: fyEnd ? fmtDate(fyEnd) : null,
        issuedOn: fmtDate(issuedOn),
      });
    } catch {
      return { error: "Could not read this PDF. It may be password-protected or damaged." };
    }
    sha256 = sha256Hex(stamped);
    originalSha256 = sha256Hex(original);
    fileRef = await savePdf(id, stamped);
    fileName = upload.name.slice(0, 200);
  }

  await insertDoc({
    id,
    companyName,
    registrationNo: str(form, "registrationNo", 80) || null,
    docType,
    auditDate,
    fyEnd,
    issuedOn,
    sha256,
    originalSha256,
    status: "valid",
    revokedReason: null,
    fileRef,
    fileName,
    createdAt: Date.now(),
  });

  revalidatePath("/admin");
  redirect(`/admin/doc/${id}?created=1`);
}

export async function setStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!UUID_RE.test(id)) return;
  const revoke = form.get("action") === "revoke";
  await updateStatus(id, revoke ? "revoked" : "valid", revoke ? str(form, "reason", 300) || null : null);
  revalidatePath(`/admin/doc/${id}`);
  revalidatePath("/admin");
}
