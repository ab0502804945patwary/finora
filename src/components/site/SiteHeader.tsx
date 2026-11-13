"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { siteNav } from "./nav";

export function SiteHeader({ tagline }: { tagline: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled || open ? "border-line bg-white/90 shadow-[0_1px_0_rgb(11_31_58/0.02)] backdrop-blur-md" : "border-transparent bg-white/0",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <a href="#top" aria-label="Finora home" onClick={() => setOpen(false)}>
          <Logo sub={tagline} fit />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {siteNav.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand after:transition-transform hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" className="btn btn-primary hidden sm:inline-flex">
            Get a Quote <ArrowRight />
          </a>
          <button
            ref={btnRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="btn btn-secondary btn-icon lg:hidden"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" ref={panelRef} className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] animate-fade-in overflow-y-auto border-t border-line bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-site flex min-h-full flex-col py-4">
            <ul className="divide-y divide-line-soft">
              {siteNav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 text-lg font-medium text-ink"
                  >
                    {l.label}
                    <ArrowRight className="size-4 text-muted" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <a href="#contact" onClick={() => setOpen(false)} className="btn btn-primary btn-lg mt-6 w-full">
              Get a Quote
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
