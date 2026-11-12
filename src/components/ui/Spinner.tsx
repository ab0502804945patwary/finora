import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-4 animate-spin", className)} aria-hidden="true" />;
}

export function ProgressBar({ label }: { label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-busy="true" className="h-1 w-full overflow-hidden rounded-full bg-line-soft">
      <div className="h-full w-2/5 animate-indeterminate rounded-full bg-brand" />
    </div>
  );
}
