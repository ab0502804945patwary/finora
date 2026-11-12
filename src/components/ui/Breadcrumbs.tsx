import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-[0.8125rem]">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted/60" aria-hidden="true" />}
              {c.href && !last ? (
                <Link href={c.href} className="truncate text-muted transition hover:text-ink">{c.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="truncate font-medium text-ink">{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
