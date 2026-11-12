import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/** Label + control + hint/error, wired with ids so inputs can set aria-describedby={describedBy(id, …)}. */
export function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="t-label">
          {label}
          {required && <span className="ml-0.5 text-bad" aria-hidden="true">*</span>}
        </label>
        {optional && <span className="text-xs text-muted">Optional</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-bad">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1.5 t-caption">{hint}</p>
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string | null, hint?: boolean) =>
  cn(error ? `${id}-error` : hint ? `${id}-hint` : "") || undefined;
