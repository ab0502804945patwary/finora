"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useActionState, useState } from "react";
import { describedBy } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  const error = state?.error;

  return (
    <form action={action} className="card mt-8 space-y-5 p-5 shadow-raised sm:p-6">
      <div>
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            required
            autoFocus
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy("password", error)}
            className="input h-11 pr-11 pl-9"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-sand hover:text-ink"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div aria-live="assertive">
          {error && (
            <p id="password-error" className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-bad">
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              Incorrect password. Please try again.
            </p>
          )}
        </div>
      </div>
      <button className="btn btn-primary btn-lg w-full" disabled={pending}>
        {pending && <Spinner />}
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <ArrowRight />}
      </button>
    </form>
  );
}
