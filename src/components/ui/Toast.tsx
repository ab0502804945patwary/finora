"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; title: string; description?: string; tone: Tone };
type Push = (t: { title: string; description?: string; tone?: Tone }) => void;

const ToastCtx = createContext<Push>(() => {});
export const useToast = () => useContext(ToastCtx);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const tones = { success: "text-ok", error: "text-bad", info: "text-brand" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setItems((s) => s.filter((x) => x.id !== id)), []);
  const push = useCallback<Push>(
    ({ tone = "success", ...t }) => {
      const id = Date.now() + Math.random();
      setItems((s) => [...s.slice(-2), { ...t, tone, id }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-3 sm:top-auto sm:bottom-0 sm:left-auto sm:items-end sm:p-5"
      >
        {items.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-lg border border-line bg-white p-3.5 pr-2.5 shadow-pop"
            >
              <Icon className={cn("mt-0.5 size-[1.125rem] shrink-0", tones[t.tone])} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded p-1 text-muted transition hover:bg-sand hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
