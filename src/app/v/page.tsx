import { Database, Fingerprint, MonitorSmartphone, QrCode, ShieldCheck, Zap } from "lucide-react";
import { site } from "@/lib/config";
import { VerifyHome } from "./VerifyHome";

const how = [
  { icon: QrCode, t: "QR code", d: "Each issued document carries a unique verification ID and a QR code on its pages." },
  { icon: Database, t: "Document registry", d: "The ID opens our official record of the company, dates and document type." },
  { icon: Fingerprint, t: "SHA-256 fingerprint", d: "A cryptographic checksum proves the PDF is byte-for-byte the file we issued." },
];

export default function VerifyIndex() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft shadow-card">
          <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
          {site.name} eVerify
        </p>
        <h1 className="t-h1 mt-5 sm:text-5xl">Verify a Document</h1>
        <p className="mx-auto mt-4 max-w-lg t-body sm:text-base">
          Confirm the authenticity and integrity of documents issued by {site.name}.
        </p>
      </div>

      <VerifyHome />

      <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted">
        {[
          [MonitorSmartphone, "Files are checked on your device"],
          [Database, "Official issuer registry"],
          [Zap, "Free and instant"],
        ].map(([Icon, t]) => {
          const I = Icon as typeof Zap;
          return (
            <li key={t as string} className="flex items-center gap-1.5">
              <I className="size-3.5 text-brand" aria-hidden="true" />
              {t as string}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="how-title" className="mt-16 sm:mt-20">
        <h2 id="how-title" className="text-center t-eyebrow text-muted">How verification works</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {how.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-4 t-h3">{t}</h3>
              <p className="mt-1.5 t-caption">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
