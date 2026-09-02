import { Loader2 } from "lucide-react";
import type { JSX } from "react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

function GoogleMark(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}

function AppleMark(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M16.4 12.8c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.3.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8 2.3-1.3 3.2-2.5c1-1.5 1.4-2.9 1.4-3-.1 0-2.7-1-2.9-4.1ZM14.1 4.6c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.4-.6 3.1-1.5Z" />
    </svg>
  );
}

/** Google and Apple sign-in, used on the profile page and anywhere else. */
export function SignInPanel({ className }: { className?: string }): JSX.Element {
  const { isSigningIn, error, signIn, clearError } = useAuth();

  return (
    <div className={cn("w-full", className)}>
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={clearError}
            className="shrink-0 text-sm font-medium text-destructive underline-offset-4 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => void signIn("google")}
          disabled={isSigningIn}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card py-3.5 text-base font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-secondary active:scale-[0.99] disabled:opacity-60"
        >
          {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => void signIn("apple")}
          disabled={isSigningIn}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground py-3.5 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <AppleMark />}
          Continue with Apple
        </button>
      </div>
    </div>
  );
}
