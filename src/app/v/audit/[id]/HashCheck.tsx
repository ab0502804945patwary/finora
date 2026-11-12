"use client";

import { CircleCheck, CircleX, FileSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { PdfDropzone } from "@/components/ui/PdfDropzone";
import { hashFile } from "@/lib/clientHash";
import { fmtBytes } from "@/lib/format";
import { takeChecked } from "@/lib/handoff";

type Result = { ok: boolean; hash: string; name: string; size: number };

export function HashCheck({ id, expected }: { id: string; expected: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A file checked on the verify home page: compare its hash against the registry value again here.
  useEffect(() => {
    const c = takeChecked(id);
    if (c) setResult({ ok: c.hash === expected, hash: c.hash, name: c.name, size: c.size });
  }, [id, expected]);

  async function check(f: File) {
    setError(null);
    setResult(null);
    setFile(f);
    setBusy(true);
    try {
      const hash = await hashFile(f);
      setResult({ ok: hash === expected, hash, name: f.name, size: f.size });
    } catch {
      setError("The file could not be read. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="hc-title" className="card card-pad">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <FileSearch className="size-[1.125rem]" aria-hidden="true" />
        </span>
        <div>
          <h2 id="hc-title" className="t-h3">Check your copy of the PDF</h2>
          <p className="mt-0.5 t-caption">Confirms the file you received is unchanged since it was issued.</p>
        </div>
      </div>

      <div className="mt-5">
        {result && !busy ? (
          <div
            aria-live="polite"
            className={result.ok ? "rounded-lg border border-ok/25 bg-ok-tint p-4" : "rounded-lg border border-bad/25 bg-bad-tint p-4"}
          >
            <p className={`flex items-center gap-2 text-sm font-semibold ${result.ok ? "text-ok" : "text-bad"}`}>
              {result.ok ? <CircleCheck className="size-[1.125rem]" aria-hidden="true" /> : <CircleX className="size-[1.125rem]" aria-hidden="true" />}
              {result.ok ? "Match — this is the exact file that was issued" : "No match — this file differs from the issued document"}
            </p>
            <p className="mt-1 truncate text-[0.8125rem] text-ink-soft">
              {result.name} · {fmtBytes(result.size)}
            </p>
            <dl className="mt-3 space-y-2 border-t border-black/5 pt-3">
              <div>
                <dt className="text-[0.6875rem] font-semibold tracking-wide text-muted uppercase">Your file</dt>
                <dd className="t-mono text-ink">{result.hash}</dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-semibold tracking-wide text-muted uppercase">Issued file</dt>
                <dd className="t-mono text-ink">{expected}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-4"
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
            >
              Check another file
            </button>
          </div>
        ) : (
          <PdfDropzone
            file={file}
            busy={busy}
            busyLabel="Computing SHA-256 fingerprint on your device…"
            onFile={check}
            onReject={setError}
            onClear={() => setFile(null)}
            hint="Fingerprinted in your browser. The file is never uploaded."
          />
        )}
        {error && <p role="alert" className="mt-3 text-[0.8125rem] text-bad">{error}</p>}
      </div>
    </section>
  );
}
