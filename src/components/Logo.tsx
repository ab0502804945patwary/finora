import Image from "next/image";
import { cn } from "@/lib/cn";

// finora-logo.svg viewBox is 424 x 81
const RATIO = 424 / 81;

/**
 * The Finora wordmark (public/finora-logo.svg). `light` uses the white version for dark backgrounds.
 * `sub` adds a small caption under the logo, e.g. "eVerify Admin".
 * `fit` stretches the caption to exactly the logo width (used for the one-line tagline).
 */
export function Logo({
  sub,
  fit = false,
  light = false,
  height = 26,
  className,
}: {
  sub?: string;
  fit?: boolean;
  light?: boolean;
  height?: number;
  className?: string;
}) {
  const width = Math.round(height * RATIO);
  return (
    <span className={cn("inline-flex flex-col items-start gap-1 leading-none", className)}>
      <Image
        src={light ? "/finora-logo-white.svg" : "/finora-logo.svg"}
        alt="Finora"
        width={width}
        height={height}
        unoptimized
        priority
        style={{ height, width: "auto" }}
      />
      {sub && (
        <span
          className={cn("font-semibold tracking-[0.1em] whitespace-nowrap uppercase", light ? "text-white/60" : "text-muted")}
          style={{ fontSize: Math.max(5.5, height * 0.235), ...(fit ? { width, textAlign: "justify", textAlignLast: "justify" } : null) }}
        >
          {sub}
        </span>
      )}
    </span>
  );
}
