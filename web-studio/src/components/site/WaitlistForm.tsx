import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { JSX } from "react";

import { cn } from "@/lib/utils";
import { joinWaitlist } from "@/lib/publicApi";

interface WaitlistFormProps {
  /** Where the signup came from, so the list is useful later. */
  source: string;
  className?: string;
  label?: string;
}

/** Email capture for the iPhone launch. */
export function WaitlistForm({
  source,
  className,
  label = "Get early access",
}: WaitlistFormProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const submit = useCallback(
    async (event: React.FormEvent): Promise<void> => {
      event.preventDefault();
      if (status === "saving") return;

      const trimmed = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setStatus("error");
        setMessage("That email doesn't look right.");
        return;
      }

      setStatus("saving");
      try {
        await joinWaitlist(trimmed, source);
        setStatus("done");
        setMessage("You're on the list. We'll email you the day it launches.");
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Try again in a moment.");
      }
    },
    [email, source, status],
  );

  if (status === "done") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border border-brand-green/30 bg-brand-green/5 px-5 py-3.5",
          className,
        )}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form
        onSubmit={submit}
        className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center"
      >
        <label htmlFor={`waitlist-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`waitlist-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@example.com"
          className={cn(
            "h-12 flex-1 rounded-full border bg-card px-5 text-base outline-none transition-colors",
            "placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
            status === "error" ? "border-destructive" : "border-border",
          )}
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-70"
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {label}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 pl-1 text-sm text-destructive">{message}</p>
      )}
    </div>
  );
}
