import { cn } from "@/lib/cn";

export function LogoMark({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="7" fill={light ? "#ffffff" : "#0b1f3a"} />
      <path d="M10.5 23V9h11.5v3.1h-8v2.7h6.9v3h-6.9V23z" fill={light ? "#0b1f3a" : "#ffffff"} />
      <rect x="20.6" y="20.2" width="3.4" height="3.4" rx="0.8" fill="#14b8a6" />
    </svg>
  );
}

export function Logo({ sub, light = false, className }: { sub?: string; light?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark light={light} />
      <span className="leading-none">
        <span className={cn("block text-[1.05rem] font-semibold tracking-[0.14em]", light ? "text-white" : "text-ink")}>
          FINORA
        </span>
        {sub && (
          <span className={cn("mt-1 block text-[0.625rem] font-semibold tracking-[0.16em] uppercase", light ? "text-white/60" : "text-muted")}>
            {sub}
          </span>
        )}
      </span>
    </span>
  );
}
