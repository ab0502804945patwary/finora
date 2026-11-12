"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-sand px-4 py-12 text-center">
      <Logo />
      <span className="mt-12 flex size-14 items-center justify-center rounded-full bg-bad-tint text-bad ring-8 ring-bad/5">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="t-h1 mt-6">Something went wrong</h1>
      <p className="mt-3 max-w-sm t-body text-sm">An unexpected error occurred. Please try again. If it keeps happening, contact support.</p>
      {error.digest && <p className="mt-3 t-mono text-muted">Ref: {error.digest}</p>}
      <button onClick={reset} className="btn btn-primary mt-8">
        <RotateCcw /> Try again
      </button>
    </main>
  );
}
