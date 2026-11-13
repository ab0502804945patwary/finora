import { ArrowUpRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: `${site.name} eVerify — Document verification`, template: `%s · ${site.name} eVerify` },
  description: `Confirm the authenticity and integrity of documents issued by ${site.name}.`,
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  const mainHost = new URL(site.siteUrl).host;
  return (
    <div className="flex min-h-dvh flex-col bg-sand">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="eVerify home">
            <Logo sub="Document verification" fit />
          </Link>
          <nav aria-label="Portal" className="flex items-center gap-1">
            <Link href="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">Verify a document</Link>
            <a href={site.siteUrl} className="btn btn-ghost btn-sm" aria-label={`Visit ${mainHost}`}>
              <span className="hidden sm:inline">{mainHost}</span>
              <ArrowUpRight />
            </a>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-14">{children}</main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-brand" aria-hidden="true" />
            Official document registry of {site.legalName}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={`mailto:${site.email}`} className="transition hover:text-ink">{site.email}</a>
            <a href={site.siteUrl} className="transition hover:text-ink">{mainHost}</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
