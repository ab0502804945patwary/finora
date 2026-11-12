import { ArrowLeft, Fingerprint, QrCode, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

const points = [
  { icon: QrCode, text: "QR code and verification ID stamped on every issued PDF" },
  { icon: Fingerprint, text: "SHA-256 fingerprint recorded for the exact issued file" },
  { icon: ShieldCheck, text: "Revoke or restore a document at any time" },
];

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]"
        />
        <Logo light sub="eVerify Admin" className="relative" />
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-tight font-medium tracking-[-0.015em]">
            Issue documents the world can verify.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-white/75">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">Authorised personnel only.</p>
      </section>

      <section className="flex flex-col bg-sand px-4 py-8 sm:px-8">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[400px] animate-slide-up">
            <Logo sub="eVerify Admin" className="mb-10 lg:hidden" />
            <p className="t-eyebrow text-brand">eVerify Admin</p>
            <h1 className="t-h1 mt-2">Welcome back</h1>
            <p className="mt-2 t-body text-sm">Sign in with the admin password to issue and manage verifiable documents.</p>
            <LoginForm />
          </div>
        </div>
        <Link href="/" className="mx-auto mt-8 inline-flex items-center gap-1.5 text-[0.8125rem] text-muted transition hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to verification portal
        </Link>
      </section>
    </main>
  );
}
