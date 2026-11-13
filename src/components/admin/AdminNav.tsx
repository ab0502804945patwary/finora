"use client";

import { ChevronDown, ExternalLink, FilePlus2, Files, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/Logo";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { site } from "@/lib/config";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/admin", label: "Documents", icon: Files, match: (p: string) => p === "/admin" || p.startsWith("/admin/doc/") },
  { href: "/admin/new", label: "Issue Document", icon: FilePlus2, match: (p: string) => p === "/admin/new" },
];

function crumbsFor(p: string): Crumb[] {
  if (p === "/admin/new") return [{ label: "Documents", href: "/admin" }, { label: "Issue document" }];
  if (p.startsWith("/admin/doc/")) return [{ label: "Documents", href: "/admin" }, { label: "Document details" }];
  return [{ label: "Documents" }];
}

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link href="/admin" aria-label="Documents">
          <Logo sub="eVerify Admin" />
        </Link>
      </div>
      <nav aria-label="Admin" className="flex-1 px-3 py-5">
        <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase">Workspace</p>
        <ul className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon, match }) => {
            const active = match(path);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                    active ? "bg-brand-tint text-brand-dark" : "text-ink-soft hover:bg-sand hover:text-ink",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-line px-3 py-4">
        <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase">Account</p>
        <a
          href={site.verifyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-soft transition hover:bg-sand hover:text-ink"
        >
          <ExternalLink className="size-4" aria-hidden="true" /> Public portal
        </a>
        <form action={logout}>
          <button className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-soft transition hover:bg-bad-tint hover:text-bad">
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AdminTopbar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:h-16 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/admin" className="lg:hidden" aria-label="Documents">
          <Logo height={18} />
        </Link>
        <Breadcrumbs items={crumbsFor(path)} />
      </div>
      <AccountMenu />
    </header>
  );
}

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const items = () => Array.from(wrap.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    items()[0]?.focus();
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      const list = items();
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        list[(i + 1) % list.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length]?.focus();
      } else if (e.key === "Tab") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-md pr-2 pl-1 text-sm font-medium text-ink transition hover:bg-sand"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-ink text-white">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Administrator</span>
        <ChevronDown className={cn("size-4 text-muted transition", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label="Account" className="absolute right-0 mt-2 w-56 origin-top-right animate-pop-in rounded-lg border border-line bg-white p-1.5 shadow-pop">
          <div className="px-2.5 py-2">
            <p className="text-sm font-semibold">Administrator</p>
            <p className="text-xs text-muted">eVerify Admin</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <a
            role="menuitem"
            href={site.verifyUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-ink-soft outline-none hover:bg-sand focus:bg-sand"
          >
            <ExternalLink className="size-4" aria-hidden="true" /> Public portal
          </a>
          <form action={logout}>
            <button
              role="menuitem"
              className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-bad outline-none hover:bg-bad-tint focus:bg-bad-tint"
            >
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function AdminTabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-2">
        {nav.map(({ href, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition", active && "bg-brand-tint")}>
                  <Icon className="size-[1.125rem]" aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
