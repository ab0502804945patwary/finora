"use client";

import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";

export function CopyButton({
  text,
  label = "Copy",
  toastTitle = "Copied to clipboard",
  variant = "button",
  icon = "copy",
  className,
}: {
  text: string;
  label?: string;
  toastTitle?: string;
  variant?: "button" | "icon";
  icon?: "copy" | "link";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const Icon = copied ? Check : icon === "link" ? Link2 : Copy;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: toastTitle });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ tone: "error", title: "Could not copy", description: "Select the text and copy it manually." });
    }
  }

  if (variant === "icon") {
    return (
      <Tooltip label={copied ? "Copied" : label}>
        <button type="button" onClick={copy} aria-label={label} className={cn("btn btn-ghost btn-icon h-8 w-8", copied && "text-ok", className)}>
          <Icon />
        </button>
      </Tooltip>
    );
  }
  return (
    <button type="button" onClick={copy} className={cn("btn btn-secondary", className)}>
      <Icon className={copied ? "text-ok" : undefined} />
      {copied ? "Copied" : label}
    </button>
  );
}
