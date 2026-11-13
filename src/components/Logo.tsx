import Image from "next/image";
import { cn } from "@/lib/cn";

// finora-logo.svg viewBox is 424 x 81
const RATIO = 424 / 81;

/**
 * The Finora wordmark (public/finora-logo.svg). `light` uses the white version for dark backgrounds.
 * `sub` adds a small caption under the logo, e.g. "eVerify Admin".
 */
export function Logo({
  sub,
  light = false,
  height = 26,
  className,
}: {
  sub?: string;
  light?: boolean;
  height?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-start gap-1.5 leading-none", className)}>
      <Image
        src={light ? "/finora-logo-white.svg" : "/finora-logo.svg"}
        alt="Finora"
        width={Math.round(height * RATIO)}
        height={height}
        unoptimized
        priority
        style={{ height, width: "auto" }}
      />
      {sub && (
        <span className={cn("text-[0.625rem] font-semibold tracking-[0.16em] uppercase", light ? "text-white/60" : "text-muted")}>
          {sub}
        </span>
      )}
    </span>
  );
}
