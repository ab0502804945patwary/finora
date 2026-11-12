"use client";

import { RotateCcw, ShieldAlert } from "lucide-react";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { setStatus } from "../../../actions";

export function StatusPanel({ id, status, reason, company }: { id: string; status: string; reason: string | null; company: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();

  function run(action: "revoke" | "restore") {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("action", action);
    if (action === "revoke") fd.set("reason", text);
    start(async () => {
      try {
        await setStatus(fd);
        setOpen(false);
        setText("");
        toast(
          action === "revoke"
            ? { title: "Document revoked", description: "The public page now shows it as revoked." }
            : { title: "Document restored", description: "The public page shows it as valid again." },
        );
      } catch {
        toast({ tone: "error", title: "Could not update the document", description: "Please try again." });
      }
    });
  }

  if (status !== "valid") {
    return (
      <section className="card card-pad" aria-labelledby="st-title">
        <h2 id="st-title" className="t-h3">Document status</h2>
        <div className="mt-3 rounded-lg border border-bad/20 bg-bad-tint p-3.5">
          <p className="text-xs font-semibold tracking-wide text-bad uppercase">Revoked</p>
          <p className="mt-1 text-sm text-ink">{reason || "No reason was recorded."}</p>
        </div>
        <p className="mt-3 t-caption">Restoring makes the public verification page show this document as valid again.</p>
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={() => run("restore")} disabled={pending}>
          {pending ? <Spinner /> : <RotateCcw />} Restore as Valid
        </button>
      </section>
    );
  }

  return (
    <section className="card card-pad" aria-labelledby="st-title">
      <h2 id="st-title" className="t-h3">Revoke document</h2>
      <p className="mt-1.5 t-caption">
        Withdraw this document if it was issued in error or is no longer valid. You can restore it later.
      </p>
      <button type="button" className="btn btn-danger-outline mt-4 w-full" onClick={() => setOpen(true)}>
        <ShieldAlert /> Revoke Document…
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => run("revoke")}
        pending={pending}
        tone="danger"
        title="Revoke this document?"
        confirmLabel="Revoke document"
        description={
          <>
            <p>
              The public verification page for <strong className="text-ink">{company}</strong> will immediately show
              “Revoked”. Anyone scanning its QR code will be told not to rely on it.
            </p>
            <p className="mt-2">You can restore it at any time.</p>
          </>
        }
      >
        <label htmlFor="reason" className="label">
          Reason <span className="font-normal text-muted">(optional, shown publicly)</span>
        </label>
        <textarea
          id="reason"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="e.g. Issued with an incorrect financial year end"
          className="input"
        />
      </ConfirmDialog>
    </section>
  );
}
