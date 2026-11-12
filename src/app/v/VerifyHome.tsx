"use client";

import { AlertCircle, ArrowRight, CircleCheck, FileText, Hash, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { describedBy } from "@/components/ui/Field";
import { PdfDropzone } from "@/components/ui/PdfDropzone";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { hashFile } from "@/lib/clientHash";
import { site } from "@/lib/config";
import { saveChecked } from "@/lib/handoff";

const UUID_IN_TEXT = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
type Tab = "id" | "pdf";
type FileState =
  | { s: "idle" }
  | { s: "busy"; file: File; label: string }
  | { s: "match"; file: File }
  | { s: "nomatch"; file: File; hash: string }
  | { s: "error"; message: string; file?: File };

export function VerifyHome() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("id");
  const tabsId = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ id: null, pdf: null });

  const [value, setValue] = useState("");
  const [idError, setIdError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [fs, setFs] = useState<FileState>({ s: "idle" });

  const match = value.match(UUID_IN_TEXT);
  const validFormat = Boolean(match);

  function submitId(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return setIdError("Enter the verification ID or paste the verification link.");
    if (!match) return setIdError("This is not a valid verification ID. It looks like xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx.");
    setIdError(null);
    setNavigating(true);
    router.push(`/audit/${match[0].toLowerCase()}`);
  }

  async function onFile(file: File) {
    try {
      setFs({ s: "busy", file, label: "Computing SHA-256 fingerprint on your device…" });
      const hash = await hashFile(file);
      setFs({ s: "busy", file, label: "Searching the document registry…" });
      const res = await fetch(`/api/lookup?hash=${hash}`, { cache: "no-store" });
      if (res.ok) {
        const { id } = (await res.json()) as { id: string };
        setFs({ s: "match", file });
        saveChecked(id, { hash, name: file.name, size: file.size });
        router.push(`/audit/${id}`);
        return;
      }
      if (res.status === 404) return setFs({ s: "nomatch", file, hash });
      setFs({ s: "error", file, message: "The registry could not be reached. Please try again." });
    } catch {
      setFs({ s: "error", file, message: "The file could not be checked. Please try again." });
    }
  }

  function onTabKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next: Tab = tab === "id" ? "pdf" : "id";
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  const tabs: { key: Tab; label: string; icon: typeof Hash }[] = [
    { key: "id", label: "Document ID", icon: Hash },
    { key: "pdf", label: "PDF file", icon: FileText },
  ];

  return (
    <div className="card mt-10 overflow-hidden shadow-raised">
      <div role="tablist" aria-label="Verification method" className="grid grid-cols-2 border-b border-line bg-sand/40 p-1.5" onKeyDown={onTabKey}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            ref={(el) => {
              tabRefs.current[key] = el;
            }}
            role="tab"
            type="button"
            id={`${tabsId}-${key}-tab`}
            aria-selected={tab === key}
            aria-controls={`${tabsId}-${key}-panel`}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => setTab(key)}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition",
              tab === key ? "bg-white text-ink shadow-card ring-1 ring-line" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-8">
        {tab === "id" ? (
          <div role="tabpanel" id={`${tabsId}-id-panel`} aria-labelledby={`${tabsId}-id-tab`}>
            <form onSubmit={submitId} noValidate>
              <label htmlFor="vid" className="t-label">Verification ID or link</label>
              <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    id="vid"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (idError) setIdError(null);
                    }}
                    placeholder="e.g. 8f8b1a90-b577-44ea-998d-9d2ee2c3c49d"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={Boolean(idError)}
                    aria-describedby={describedBy("vid", idError, true)}
                    className="input h-12 pr-10 font-mono text-[0.8125rem]"
                  />
                  {validFormat && !idError && (
                    <CircleCheck className="absolute top-1/2 right-3 size-[1.125rem] -translate-y-1/2 text-ok" aria-label="Valid ID format" />
                  )}
                </div>
                <button className="btn btn-primary btn-lg sm:w-36" disabled={navigating}>
                  {navigating ? <Spinner /> : null}
                  Verify
                  {!navigating && <ArrowRight />}
                </button>
              </div>
              {idError ? (
                <p id="vid-error" role="alert" className="mt-2 flex items-start gap-1.5 text-[0.8125rem] text-bad">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {idError}
                </p>
              ) : (
                <p id="vid-hint" className="mt-2 t-caption">
                  Printed next to the QR code on the document. You can also paste the full verification link.
                </p>
              )}
            </form>
          </div>
        ) : (
          <div role="tabpanel" id={`${tabsId}-pdf-panel`} aria-labelledby={`${tabsId}-pdf-tab`} className="space-y-4">
            <PdfDropzone
              size="lg"
              file={fs.s === "idle" ? null : "file" in fs ? fs.file : null}
              busy={fs.s === "busy" || fs.s === "match"}
              busyLabel={fs.s === "busy" ? fs.label : "Match found. Opening the record…"}
              onFile={onFile}
              onReject={(message) => setFs({ s: "error", message })}
              onClear={() => setFs({ s: "idle" })}
              hint="The PDF is fingerprinted in your browser and never uploaded."
            />
            <div aria-live="polite">
              {fs.s === "nomatch" && (
                <div className="rounded-lg border border-bad/20 bg-bad-tint p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-bad">
                    <SearchX className="size-4" aria-hidden="true" /> No issued document matches this file
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-soft">
                    The file may have been edited, re-saved or printed to PDF, or it was not issued by {site.name}. Try
                    the verification ID printed on the document instead.
                  </p>
                  <p className="mt-2 t-mono text-muted">SHA-256: {fs.hash}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTab("id")}>
                      Use document ID
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFs({ s: "idle" })}>
                      Check another file
                    </button>
                  </div>
                </div>
              )}
              {fs.s === "error" && (
                <p role="alert" className="flex items-start gap-2 rounded-lg border border-bad/20 bg-bad-tint p-3 text-[0.8125rem] text-bad">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {fs.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
