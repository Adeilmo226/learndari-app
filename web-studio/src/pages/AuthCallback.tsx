import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import type { JSX } from "react";

/**
 * Lands here after an OAuth sign-in redirect. Clerk completes the handshake and
 * then sends the learner on to their profile.
 */
export default function AuthCallback(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Signing you in…</p>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/profile"
        signUpForceRedirectUrl="/profile"
      />
    </div>
  );
}
