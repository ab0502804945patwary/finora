import { ArrowLeft, Mail, SearchX, ShieldAlert, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { site } from "@/lib/config";
import { getDoc } from "@/lib/documents";
import { fmtDate, UUID_RE } from "@/lib/format";
import { isQrOnly } from "@/lib/qr";
import { HashCheck } from "./HashCheck";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verification result", robots: { index: false, follow: false } };

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = rawId.toLowerCase();
  const d = UUID_RE.test(id) ? await getDoc(id) : null;

  if (!d) return <NotFound rawId={rawId} />;

  const valid = d.status === "valid";
  const qrOnly = isQrOnly(d.fileRef);
  const link = `${site.verifyUrl}/audit/${d.id}`;
  const fields: [string, string][] = [
    ["Company name", d.companyName],
    ["Registration number", d.registrationNo || "—"],
    ["Document type", d.docType],
    ["Audit date", fmtDate(d.auditDate)],
    ["Financial year end", fmtDate(d.fyEnd)],
    ["Issued on", fmtDate(d.issuedOn)],
    ["Issued by", site.issuer],
  ];

  return (
    <div className="animate-slide-up space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted transition hover:text-ink">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Verify another document
      </Link>

      {/* Status banner */}
      <section
        aria-labelledby="status-title"
        className={`overflow-hidden rounded-2xl border shadow-raised ${valid ? "border-ok/25 bg-white" : "border-bad/30 bg-white"}`}
      >
        <div className={`flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-8 ${valid ? "bg-ok-tint/70" : "bg-bad-tint"}`}>
          <span
            className={`flex size-14 shrink-0 items-center justify-center rounded-full ring-8 sm:size-16 ${
              valid ? "bg-ok text-white ring-ok/10" : "bg-bad text-white ring-bad/10"
            }`}
          >
            {valid ? <ShieldCheck className="size-7 sm:size-8" aria-hidden="true" /> : <ShieldAlert className="size-7 sm:size-8" aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`t-eyebrow ${valid ? "text-ok" : "text-bad"}`}>{valid ? "Issuance confirmed" : "Revoked"}</p>
            <h1 id="status-title" className="mt-1 font-display text-2xl font-medium tracking-[-0.015em] sm:text-[2rem]">
              {valid ? "Document verified" : "This document has been revoked"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {valid
                ? `This ${d.docType} for ${d.companyName} was issued by ${site.issuer} and is recorded in our registry.`
                : `${site.issuer} has withdrawn this document. Do not rely on it.`}
            </p>
          </div>
          <div className="sm:self-start">
            <StatusBadge status={d.status} size="md" />
          </div>
        </div>
        {!valid && (
          <div className="border-t border-bad/15 px-5 py-4 sm:px-8">
            <p className="text-xs font-semibold tracking-wide text-bad uppercase">Revocation reason</p>
            <p className="mt-1 text-sm text-ink">{d.revokedReason || "No reason was given."}</p>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section aria-labelledby="details-title" className="card">
            <h2 id="details-title" className="border-b border-line px-5 py-4 t-h3 sm:px-6">Document details</h2>
            <dl className="grid sm:grid-cols-2">
              {fields.map(([k, v], i) => (
                <div
                  key={k}
                  className={`border-line-soft px-5 py-3.5 sm:px-6 ${i < fields.length - 1 ? "border-b" : ""} ${
                    i % 2 === 0 ? "sm:border-r" : ""
                  } ${i === fields.length - 1 ? "sm:col-span-2 sm:border-r-0" : ""}`}
                >
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          {!qrOnly && <HashCheck id={d.id} expected={d.sha256} />}
        </div>

        <aside className="space-y-5">
          <section aria-labelledby="record-title" className="card card-pad">
            <h2 id="record-title" className="t-h3">Verification record</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="flex items-center justify-between text-xs text-muted">
                  Document ID
                  <CopyButton variant="icon" text={d.id} label="Copy document ID" toastTitle="Document ID copied" />
                </dt>
                <dd className="t-mono text-ink">{d.id}</dd>
              </div>
              {!qrOnly && (
              <div>
                <dt className="flex items-center justify-between text-xs text-muted">
                  SHA-256 fingerprint
                  <CopyButton variant="icon" text={d.sha256} label="Copy fingerprint" toastTitle="Fingerprint copied" />
                </dt>
                <dd className="t-mono text-ink">{d.sha256}</dd>
              </div>
              )}
            </dl>
            <CopyButton text={link} icon="link" label="Copy verification link" toastTitle="Verification link copied" className="mt-5 w-full" />
          </section>
          <p className="px-1 t-caption">
            {qrOnly
              ? "The QR code confirms this registry entry. Make sure the company name and dates match the document in front of you."
              : "The QR code confirms this registry entry. The fingerprint identifies the exact issued file: a PDF that has been edited, re-saved or printed will not match. Make sure the company name and dates match the document in front of you."}
          </p>
        </aside>
      </div>
    </div>
  );
}

function NotFound({ rawId }: { rawId: string }) {
  return (
    <div className="mx-auto max-w-xl animate-slide-up">
      <section className="card overflow-hidden text-center shadow-raised">
        <div className="px-6 pt-10 pb-8 sm:px-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-bad-tint text-bad ring-8 ring-bad/5">
            <SearchX className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-5 t-eyebrow text-bad">No record found</p>
          <h1 className="mt-1.5 font-display text-2xl font-medium sm:text-3xl">Document not found</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            No document with this ID was issued by {site.issuer}. Check the ID for typos. If the document claims to be
            from us, contact us before relying on it.
          </p>
          <p className="mx-auto mt-4 max-w-sm rounded-md bg-sand px-3 py-2 t-mono text-muted">{rawId}</p>
        </div>
        <div className="flex flex-col gap-2 border-t border-line bg-sand/50 px-6 py-4 sm:flex-row sm:justify-center">
          <Link href="/" className="btn btn-primary">Verify another document</Link>
          <a href={`mailto:${site.email}`} className="btn btn-secondary">
            <Mail /> {site.email}
          </a>
        </div>
      </section>
    </div>
  );
}
