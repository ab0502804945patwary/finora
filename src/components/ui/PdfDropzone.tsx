"use client";

import { FileText, RefreshCw, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { fmtBytes } from "@/lib/format";
import { ProgressBar } from "./Spinner";

type Props = {
  file?: File | null;
  onFile: (f: File) => void;
  onReject?: (message: string) => void;
  onClear?: () => void;
  busy?: boolean;
  busyLabel?: string;
  hint: string;
  maxBytes?: number;
  invalid?: boolean;
  size?: "md" | "lg";
  inputId?: string;
  describedBy?: string;
};

const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

/** Drag-and-drop / browse PDF picker. Validates type (and size when maxBytes is set) before calling onFile. */
export function PdfDropzone({ file, onFile, onReject, onClear, busy, busyLabel = "Checking…", hint, maxBytes, invalid, size = "md", inputId, describedBy }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const id = inputId ?? autoId;
  const [over, setOver] = useState(false);

  function take(f?: File | null) {
    if (!f) return;
    if (!isPdf(f)) return onReject?.("Only PDF files are supported.");
    if (maxBytes && f.size > maxBytes) return onReject?.(`This file is ${fmtBytes(f.size)}. The maximum is ${fmtBytes(maxBytes)}.`);
    onFile(f);
  }

  const input = (
    <input
      ref={ref}
      id={id}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      aria-describedby={describedBy}
      tabIndex={-1}
      onChange={(e) => {
        take(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  if (busy) {
    return (
      <div className="rounded-xl border border-brand/30 bg-brand-tint/50 p-5" aria-live="polite">
        <div className="flex items-center gap-3">
          <FileIcon />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{file?.name ?? "PDF"}</p>
            <p className="mt-0.5 text-[0.8125rem] text-brand">{busyLabel}</p>
          </div>
        </div>
        <div className="mt-4"><ProgressBar label={busyLabel} /></div>
      </div>
    );
  }

  if (file) {
    return (
      <div className={cn("flex items-center gap-3 rounded-xl border bg-white p-4", invalid ? "border-bad" : "border-line")}>
        {input}
        <FileIcon />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{file.name}</p>
          <p className="mt-0.5 text-[0.8125rem] text-muted">PDF · {fmtBytes(file.size)}</p>
        </div>
        <button type="button" onClick={() => ref.current?.click()} className="btn btn-ghost btn-sm">
          <RefreshCw /> <span className="hidden sm:inline">Replace</span>
        </button>
        {onClear && (
          <button type="button" onClick={onClear} className="btn btn-ghost btn-icon h-8 w-8" aria-label={`Remove ${file.name}`}>
            <X />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed text-center transition-colors",
        size === "lg" ? "px-6 py-10 sm:py-12" : "px-5 py-8",
        over ? "border-brand bg-brand-tint" : invalid ? "border-bad/60 bg-bad-tint/40" : "border-[#d6d3c9] bg-sand/50 hover:border-brand/50",
      )}
    >
      {input}
      <span className={cn("flex items-center justify-center rounded-xl bg-white text-brand shadow-card ring-1 ring-line", size === "lg" ? "size-12" : "size-10")}>
        <UploadCloud className={size === "lg" ? "size-6" : "size-5"} aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">
        {over ? "Release to add the PDF" : <>Drag &amp; drop your PDF here</>}
      </p>
      <p className="mt-1 text-[0.8125rem] text-muted">or</p>
      <button type="button" onClick={() => ref.current?.click()} className="btn btn-secondary btn-sm mt-2">
        Browse files
      </button>
      <p className="mt-3 max-w-xs t-caption">{hint}</p>
    </div>
  );
}

function FileIcon() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bad-tint text-bad">
      <FileText className="size-5" aria-hidden="true" />
    </span>
  );
}
