import { CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const ok = status === "valid";
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-[0.8125rem]",
        ok ? "border-ok/20 bg-ok-tint text-ok" : "border-bad/20 bg-bad-tint text-bad",
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden="true" />
      <span>
        <span className="sr-only">Status: </span>
        {ok ? "Valid" : "Revoked"}
      </span>
    </span>
  );
}
