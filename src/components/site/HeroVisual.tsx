import { BadgeCheck, QrCode } from "lucide-react";

/** Abstract financial artwork + a clearly labelled illustrative verification card. Decorative only. */
export function HeroVisual({ issuer, verifyHost }: { issuer: string; verifyHost: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* Ledger panel */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-raised" aria-hidden="true">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-line" />
            <span className="size-2 rounded-full bg-line" />
            <span className="size-2 rounded-full bg-line" />
          </div>
          <span className="h-2 w-20 rounded-full bg-line-soft" />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className="block h-2 w-16 rounded-full bg-line" />
              <span className="block h-4 w-32 rounded bg-ink/85" />
            </div>
            <span className="h-5 w-14 rounded-full bg-brand-tint" />
          </div>
          <svg viewBox="0 0 400 150" className="mt-5 w-full" role="presentation">
            <defs>
              <linearGradient id="hv-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[30, 70, 110].map((y) => (
              <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#eeece6" strokeWidth="1" />
            ))}
            {[18, 30, 24, 40, 34, 52, 46, 62, 58, 74].map((h, i) => (
              <rect key={i} x={12 + i * 39} y={150 - h} width="16" height={h} rx="3" fill={i === 9 ? "#0b1f3a" : "#e3e1da"} />
            ))}
            <path d="M0 110 C 50 100, 80 88, 120 90 S 200 70, 240 60 S 320 40, 400 22 L400 150 L0 150 Z" fill="url(#hv-area)" />
            <path d="M0 110 C 50 100, 80 88, 120 90 S 200 70, 240 60 S 320 40, 400 22" fill="none" stroke="#0f766e" strokeWidth="2.25" />
            <circle cx="400" cy="22" r="4" fill="#0f766e" />
          </svg>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-line-soft p-3">
                <span className="block h-1.5 w-10 rounded-full bg-line" />
                <span className="mt-2 block h-2.5 w-14 rounded bg-ink/70" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Illustrative verification card */}
      <figure className="relative z-10 -mt-14 ml-auto w-[88%] rounded-xl border border-line bg-white p-4 shadow-pop sm:-mr-6 sm:w-[78%] sm:p-5">
        <figcaption className="mb-3 inline-flex items-center rounded-full border border-line bg-sand px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.12em] text-muted uppercase">
          Illustrative preview · sample only
        </figcaption>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ok-tint text-ok">
            <BadgeCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow text-ok">Issuance confirmed</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">Audited Financial Statements</p>
            <p className="mt-0.5 truncate text-xs text-muted">Issued by {issuer}</p>
          </div>
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-md border border-line text-ink sm:flex">
            <QrCode className="size-7" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 border-t border-line-soft pt-3 font-mono text-[0.6875rem] text-muted">{verifyHost}/audit/…</p>
      </figure>
    </div>
  );
}
