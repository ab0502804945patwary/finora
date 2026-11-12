import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-sand px-4 py-12 text-center">
      <Logo />
      <span className="mt-12 flex size-14 items-center justify-center rounded-full bg-white text-brand shadow-card ring-1 ring-line">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-5 t-eyebrow text-brand">Error 404</p>
      <h1 className="t-h1 mt-2">Page not found</h1>
      <p className="mt-3 max-w-sm t-body text-sm">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn btn-primary mt-8">
        <ArrowLeft /> Back to home
      </Link>
    </main>
  );
}
