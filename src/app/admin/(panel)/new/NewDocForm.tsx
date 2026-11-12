"use client";

import { AlertCircle, ArrowRight, FileUp, QrCode } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Field, describedBy } from "@/components/ui/Field";
import { PdfDropzone } from "@/components/ui/PdfDropzone";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { createDocument } from "../../actions";

const MAX_BYTES = 4 * 1024 * 1024;
type Pages = "all" | "first" | "last";
type Mode = "pdf" | "qr";
type Errors = Partial<Record<"file" | "companyName" | "issuedOn", string>>;

export function NewDocForm({ docTypes, today }: { docTypes: string[]; today: string }) {
  const [state, action, pending] = useActionState(createDocument, undefined);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Pages>("all");
  const [mode, setMode] = useState<Mode>("pdf");
  const [issuedOn, setIssuedOn] = useState(today);
  const issuedTouched = useRef(false);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  // default "Issued on" to the user's local date rather than the server's UTC date
  useEffect(() => {
    if (!issuedTouched.current) {
      const d = new Date();
      setIssuedOn(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    if (mode === "pdf" && !file) next.file = "Choose the PDF to issue.";
    if (!String(data.get("companyName") ?? "").trim()) next.companyName = "Company name is required.";
    if (!issuedOn) next.issuedOn = "Issue date is required.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = next.file ? "file" : next.companyName ? "companyName" : "issuedOn";
      requestAnimationFrame(() => {
        (formRef.current?.querySelector(`#${first}`) ?? formRef.current?.querySelector(`[data-field="${first}"]`))?.scrollIntoView({ block: "center", behavior: "smooth" });
        formRef.current?.querySelector<HTMLElement>(first === "file" ? "button" : `#${first}`)?.focus({ preventScroll: true });
      });
      return;
    }
    data.set("mode", mode);
    if (mode === "pdf") data.set("file", file!);
    else data.delete("file");
    startTransition(() => action(data));
  }

  const pdf = mode === "pdf";
  const L = pdf ? { co: "B", doc: "C", dt: "D", qr: "E" } : { co: "A", doc: "B", dt: "C", qr: "" };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      {/* How to issue */}
      <fieldset className="card card-pad">
        <legend className="sr-only">How do you want to issue this document?</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(
            [
              ["pdf", FileUp, "Upload PDF & stamp", "We stamp the QR code on your PDF for you"],
              ["qr", QrCode, "QR code only", "No upload. Download the QR and place it on the document yourself"],
            ] as const
          ).map(([v, Icon, label, sub]) => (
            <label
              key={v}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition",
                mode === v ? "border-brand bg-brand-tint/50 ring-1 ring-brand" : "border-line hover:border-[#cfccc2]",
              )}
            >
              <input type="radio" name="issue-mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="sr-only" />
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", mode === v ? "bg-brand text-white" : "bg-sand text-ink-soft")}>
                <Icon className="size-[1.125rem]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">{sub}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* A — Upload */}
      {pdf && (
      <Section n="A" title="Upload document" description="The final PDF, maximum 4 MB.">
        <div data-field="file">
          <PdfDropzone
            size="lg"
            file={file}
            invalid={Boolean(errors.file)}
            maxBytes={MAX_BYTES}
            hint="PDF only · up to 4 MB. Password-protected files cannot be stamped."
            onFile={(f) => {
              setFile(f);
              setErrors((e) => ({ ...e, file: undefined }));
            }}
            onReject={(m) => {
              setFile(null);
              setErrors((e) => ({ ...e, file: m }));
            }}
            onClear={() => setFile(null)}
          />
          {errors.file && <FieldError id="file-error" message={errors.file} />}
        </div>
      </Section>
      )}

      {/* B — Company */}
      <Section n={L.co} title="Company information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="companyName" label="Company name" required error={errors.companyName} className="sm:col-span-2">
            <input
              id="companyName"
              name="companyName"
              maxLength={200}
              autoComplete="off"
              placeholder="e.g. Example Trading LLC"
              aria-invalid={Boolean(errors.companyName)}
              aria-describedby={describedBy("companyName", errors.companyName)}
              onChange={() => errors.companyName && setErrors((e) => ({ ...e, companyName: undefined }))}
              className="input"
            />
          </Field>
          <Field id="registrationNo" label="Registration number" optional>
            <input id="registrationNo" name="registrationNo" maxLength={80} autoComplete="off" className="input" />
          </Field>
        </div>
      </Section>

      {/* C — Document */}
      <Section n={L.doc} title="Document information">
        <Field id="docType" label="Document type" required>
          <select id="docType" name="docType" defaultValue={docTypes[0]} className="input">
            {docTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </Section>

      {/* D — Dates */}
      <Section n={L.dt} title="Audit & financial dates">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="auditDate" label="Audit date" optional>
            <input id="auditDate" name="auditDate" type="date" className="input" />
          </Field>
          <Field id="fyEnd" label="Financial year end" optional>
            <input id="fyEnd" name="fyEnd" type="date" className="input" />
          </Field>
          <Field id="issuedOn" label="Issued on" required error={errors.issuedOn}>
            <input
              id="issuedOn"
              name="issuedOn"
              type="date"
              value={issuedOn}
              onChange={(e) => {
                issuedTouched.current = true;
                setIssuedOn(e.target.value);
                setErrors((x) => ({ ...x, issuedOn: undefined }));
              }}
              aria-invalid={Boolean(errors.issuedOn)}
              aria-describedby={describedBy("issuedOn", errors.issuedOn)}
              className="input"
            />
          </Field>
        </div>
      </Section>

      {/* E — QR */}
      {pdf && (
      <Section n={L.qr} title="QR stamp configuration" description="Where the verification QR code is placed in the PDF.">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <fieldset>
            <legend className="sr-only">Stamp QR on</legend>
            <div className="grid gap-2">
              {(
                [
                  ["all", "Every page", "Best for multi-page reports"],
                  ["first", "First page only", "Cover page carries the QR"],
                  ["last", "Last page only", "QR beside the signature page"],
                ] as const
              ).map(([v, label, sub]) => (
                <label
                  key={v}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition",
                    pages === v ? "border-brand bg-brand-tint/50 ring-1 ring-brand" : "border-line hover:border-[#cfccc2]",
                  )}
                >
                  <input type="radio" name="pages" value={v} checked={pages === v} onChange={() => setPages(v)} className="size-4 accent-[#0f766e]" />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted">{sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <QrPreview pages={pages} />
        </div>
      </Section>
      )}

      {/* F — Submit */}
      <div className="card card-pad">
        <div aria-live="polite">
          {state?.error && (
            <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-bad/20 bg-bad-tint p-3 text-sm text-bad">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {state.error}
            </p>
          )}
        </div>
        <button className="btn btn-brand btn-lg w-full" disabled={pending}>
          {pending && <Spinner />}
          {pending ? (pdf ? "Stamping and recording…" : "Creating QR code…") : pdf ? "Stamp & Issue Document" : "Generate QR Code & Issue"}
          {!pending && <ArrowRight />}
        </button>
        <p className="mt-3 text-center t-caption">
          {pdf
            ? "The stamped PDF is what you send to the client. Its fingerprint will not match the original upload."
            : "You will download the QR code on the next screen and place it on the document before printing. The public page will show the details above."}
        </p>
      </div>
    </form>
  );
}

function Section({ n, title, description, children }: { n: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card card-pad">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-semibold text-white" aria-hidden="true">
          {n}
        </span>
        <div>
          <h2 className="t-h3">{title}</h2>
          {description && <p className="mt-0.5 t-caption">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-bad">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/** Illustrative only: shows which pages receive the QR stamp. */
function QrPreview({ pages }: { pages: Pages }) {
  const sheets: { stamped: boolean; label: string }[] = [
    { stamped: pages !== "last", label: "First page" },
    { stamped: pages === "all", label: "Middle pages" },
    { stamped: pages !== "first", label: "Last page" },
  ];
  return (
    <figure className="mx-auto" aria-label="Illustrative preview of QR placement">
      <div className="flex items-end gap-2.5 rounded-xl bg-sand p-4">
        {sheets.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5">
            <div className={cn("relative h-[5.5rem] w-16 rounded-[3px] border bg-white shadow-card transition", s.stamped ? "border-brand/40" : "border-line opacity-60")}>
              <div className="space-y-1 p-1.5">
                <span className="block h-1 w-8 rounded-full bg-line" />
                <span className="block h-1 w-11 rounded-full bg-line-soft" />
                <span className="block h-1 w-10 rounded-full bg-line-soft" />
              </div>
              {s.stamped && <span className="absolute right-1 bottom-1 size-3.5 rounded-[2px] bg-ink [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] [background-size:3px_3px]" />}
            </div>
            <span className="text-[0.625rem] text-muted">{s.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-[0.6875rem] text-muted">Illustrative preview</figcaption>
    </figure>
  );
}
