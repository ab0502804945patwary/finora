"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  tone?: "danger" | "default";
  pending?: boolean;
  children?: React.ReactNode;
};

/** Accessible confirmation dialog built on the native <dialog> element (focus trap + Esc handled by the browser). */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, tone = "default", pending, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white p-0 text-ink shadow-pop open:animate-pop-in"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {tone === "danger" && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bad-tint text-bad">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold">{title}</h2>
            <div id={descId} className="mt-1.5 text-sm leading-relaxed text-muted">{description}</div>
          </div>
          <button type="button" onClick={onClose} disabled={pending} className="btn btn-ghost btn-icon -mt-1.5 -mr-2 h-8 w-8" aria-label="Close dialog">
            <X />
          </button>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-line bg-sand/50 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
        <button type="button" onClick={onClose} disabled={pending} className="btn btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={cn("btn", tone === "danger" ? "btn-danger" : "btn-primary")}
        >
          {pending && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
