/** CSS-only tooltip; shows on hover and keyboard focus. The trigger must carry its own aria-label. */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 translate-y-1 rounded-md bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-pop transition duration-150 group-focus-within/tt:translate-y-0 group-focus-within/tt:opacity-100 group-hover/tt:translate-y-0 group-hover/tt:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
