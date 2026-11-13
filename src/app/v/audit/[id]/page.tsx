import { ArrowLeft, ChevronRight, Fingerprint, Mail, SearchX, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/ui/CopyButton";
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
  const dates: [string, string][] = [
    ["Audit date", fmtDate(d.auditDate)],
    ["Financial year end", fmtDate(d.fyEnd)],
    ["Issued on", fmtDate(d.issuedOn)],
    ["Issued by", site.issuer],
  ];

  return (
    <div className="mx-auto max-w-2xl animate-slide-up space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted transition hover:text-ink">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Verify another document
      </Link>

      <section aria-labelledby="status-title" className="overflow-hidden rounded-3xl border border-line bg-white shadow-raised">
        <div className={`h-1.5 ${valid ? "bg-ok" : "bg-bad"}`} aria-hidden="true" />

        <div className="px-5 pt-9 pb-7 text-center sm:px-10 sm:pt-12">
          {valid ? <AnimatedCheck /> : <RevokedMark />}
          <p className={`mt-6 t-eyebrow ${valid ? "text-ok" : "text-bad"}`}>{valid ? "Issuance confirmed" : "Revoked"}</p>
          <h1 id="status-title" className="mt-2 font-display text-[2.75rem] leading-none font-medium tracking-[-0.02em] sm:text-6xl">
            {valid ? "Verified" : "Revoked"}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
            {valid
              ? `This ${d.docType.toLowerCase()} was issued by ${site.issuer} and is recorded in our registry.`
              : `${site.issuer} has withdrawn this document. Do not rely on it.`}
          </p>
        </div>

        <div className="space-y-4 px-5 pb-7 sm:px-10 sm:pb-10">
          {!valid && (
            <div className="rounded-2xl border border-bad/20 bg-bad-tint p-4">
              <p className="text-xs font-semibold tracking-wide text-bad uppercase">Revocation reason</p>
              <p className="mt-1 text-sm text-ink">{d.revokedReason || "No reason was given."}</p>
            </div>
          )}

          {/* Company name: the most important fact on the page */}
          <div className={`rounded-2xl border p-5 sm:p-6 ${valid ? "border-ok/15 bg-ok-tint/60" : "border-line bg-sand"}`}>
            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-muted uppercase">Company name</p>
            <p className="mt-2 text-[1.625rem] leading-tight font-bold tracking-[-0.01em] break-words text-ink sm:text-[2rem]">{d.companyName}</p>
            {d.registrationNo && <p className="mt-2 text-sm text-ink-soft">Registration no. {d.registrationNo}</p>}
            <p className="mt-3 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-soft ring-1 ring-line">{d.docType}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 px-1 py-2">
            {dates.map(([k, v]) => (
              <div key={k} className="border-b border-line-soft pb-4">
                <dt className="text-[0.8125rem] text-muted">{k}</dt>
                <dd className="mt-1 text-base font-bold break-words text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-2xl border border-line bg-sand/60 p-5">
            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-muted uppercase">Verification ID</p>
            <p className="mt-2 t-mono text-ink">{d.id}</p>
            <CopyButton text={link} icon="link" label="Copy verification link" toastTitle="Verification link copied" className="mt-4" />
          </div>

          {!qrOnly && (
            <details className="group px-1">
              <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-sm text-ink-soft select-none [&::-webkit-details-marker]:hidden">
                <ChevronRight className="size-4 transition group-open:rotate-90" aria-hidden="true" />
                <Fingerprint className="size-4 text-muted" aria-hidden="true" />
                Document fingerprint (SHA-256)
              </summary>
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-sand/60 p-3">
                <p className="t-mono min-w-0 flex-1 text-ink">{d.sha256}</p>
                <CopyButton variant="icon" text={d.sha256} label="Copy fingerprint" toastTitle="Fingerprint copied" />
              </div>
            </details>
          )}
        </div>
      </section>

      {!qrOnly && <HashCheck id={d.id} expected={d.sha256} />}

      <p className="px-1 text-center t-caption">
        {qrOnly
          ? "The QR code confirms this registry entry. Make sure the company name and dates match the document in front of you."
          : "The QR code confirms this registry entry. The fingerprint identifies the exact issued file: a PDF that has been edited, re-saved or printed will not match. Make sure the company name and dates match the document in front of you."}
      </p>
    </div>
  );
}

/** Circle draws itself, then the tick draws, then a ring pulses once. Static when reduced motion is on. */
function AnimatedCheck() {
  return (
    <span className="relative mx-auto flex size-24 items-center justify-center sm:size-28" role="img" aria-label="Verified">
      <span className="verify-ring absolute inset-0 rounded-full bg-ok/10" aria-hidden="true" />
      <svg viewBox="0 0 120 120" className="relative size-full" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="#ecf7ef" />
        <circle
          className="verify-circle"
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#15803d"
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <path className="verify-tick" d="M38 62 L54 77 L84 45" fill="none" stroke="#15803d" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function RevokedMark() {
  return (
    <span
      className="mx-auto flex size-24 items-center justify-center rounded-full bg-bad-tint text-bad ring-8 ring-bad/5 sm:size-28"
      role="img"
      aria-label="Revoked"
    >
      <ShieldAlert className="size-11 sm:size-12" aria-hidden="true" />
    </span>
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
