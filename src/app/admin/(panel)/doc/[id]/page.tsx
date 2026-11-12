import { CheckCircle2, Download, ExternalLink, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { isQrOnly, qrSvg, verifyLinkFor } from "@/lib/qr";
import { getDoc } from "@/lib/documents";
import { fmtDate, fmtDateTime, UUID_RE } from "@/lib/format";
import { StatusPanel } from "./StatusPanel";

export default async function DocPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!UUID_RE.test(id)) notFound();
  const d = await getDoc(id);
  if (!d) notFound();

  const link = verifyLinkFor(d.id);
  const qrOnly = isQrOnly(d.fileRef);
  const svg = await qrSvg(link);
  const info: [string, string][] = [
    ["Company name", d.companyName],
    ["Registration number", d.registrationNo || "—"],
    ["Document type", d.docType],
    ["Audit date", fmtDate(d.auditDate)],
    ["Financial year end", fmtDate(d.fyEnd)],
    ["Issued on", fmtDate(d.issuedOn)],
    ["Created", fmtDateTime(d.createdAt)],
    [qrOnly ? "Issued as" : "Original filename", qrOnly ? "QR code only (no PDF)" : d.fileName || "—"],
  ];

  return (
    <div className="space-y-6">
      {created && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-ok/25 bg-ok-tint p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ok">Document issued</p>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-soft">
              {qrOnly
                ? "Download the QR code below and place it on the document before printing. Scanning it opens the verification page."
                : "Download the stamped PDF below and send that file to the client. The original upload will not match the recorded fingerprint."}
            </p>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="t-h1 break-words">{d.companyName}</h1>
            <StatusBadge status={d.status} size="md" />
          </div>
          <p className="mt-1.5 text-sm text-muted">{d.docType}</p>
        </div>
      </header>

      <div className="grid gap-2.5 sm:flex sm:flex-wrap">
        {qrOnly ? (
          <a href={`/api/admin/qr/${d.id}?format=png`} className="btn btn-brand">
            <QrCode /> Download QR (PNG)
          </a>
        ) : (
          <a href={`/api/admin/download/${d.id}`} className="btn btn-brand">
            <Download /> Download Stamped PDF
          </a>
        )}
        <a href={link} target="_blank" rel="noreferrer" className="btn btn-secondary">
          <ExternalLink /> Open Public Verification
        </a>
        <CopyButton text={link} icon="link" label="Copy Verification Link" toastTitle="Verification link copied" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="card" aria-labelledby="info-title">
            <h2 id="info-title" className="border-b border-line px-5 py-4 t-h3 sm:px-6">Document information</h2>
            <dl className="grid sm:grid-cols-2">
              {info.map(([k, v], i) => (
                <div
                  key={k}
                  className={`border-line-soft px-5 py-3.5 sm:px-6 ${i < info.length - 2 ? "border-b" : ""} ${i < info.length - 1 ? "max-sm:border-b" : ""} ${
                    i % 2 === 0 ? "sm:border-r" : ""
                  }`}
                >
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card card-pad" aria-labelledby="ver-title">
            <h2 id="ver-title" className="t-h3">Verification record</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="flex items-center justify-between text-xs text-muted">
                  Document UUID
                  <CopyButton variant="icon" text={d.id} label="Copy document ID" toastTitle="Document ID copied" />
                </dt>
                <dd className="t-mono text-ink">{d.id}</dd>
              </div>
              {!qrOnly && (
              <div>
                <dt className="flex items-center justify-between text-xs text-muted">
                  SHA-256 fingerprint (issued file)
                  <CopyButton variant="icon" text={d.sha256} label="Copy fingerprint" toastTitle="Fingerprint copied" />
                </dt>
                <dd className="t-mono text-ink">{d.sha256}</dd>
              </div>
              )}
            </dl>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card card-pad" aria-labelledby="qr-title">
            <h2 id="qr-title" className="t-h3">QR code</h2>
            <p className="mt-1 t-caption">
              {qrOnly ? "Place this on the document before printing." : "Already stamped on the PDF. Download it if you also need it separately."}
            </p>
            <div
              role="img"
              aria-label="QR code for the verification link"
              className="mx-auto mt-4 w-full max-w-[220px] rounded-lg border border-line bg-white p-1 [&>svg]:h-auto [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`/api/admin/qr/${d.id}?format=png`} className="btn btn-secondary btn-sm">
                <Download /> PNG
              </a>
              <a href={`/api/admin/qr/${d.id}?format=svg`} className="btn btn-secondary btn-sm">
                <Download /> SVG
              </a>
            </div>
            <p className="mt-3 t-caption">PNG for Word or Canva. SVG for print shops and sharp scaling. Keep it at least 25 mm wide.</p>
          </section>
          <StatusPanel id={d.id} status={d.status} reason={d.revokedReason} company={d.companyName} />
        </div>
      </div>
    </div>
  );
}
