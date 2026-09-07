import { useCallback, useState } from "react";
import {
  useAuth as useClerkAuth,
  useSignIn,
  useUser,
} from "@clerk/clerk-react";

/**
 * Auth for the website, backed by Clerk.
 *
 * LearnDari owns its identity through Clerk (the same instance the original
 * website used, so returning users keep their accounts). This hook keeps the
 * small surface the rest of the app already expects — `user`, `signIn`,
 * `signOut`, `getToken` — so components didn't need to change when we moved
 * off the previous provider.
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthValue {
  user: AuthUser | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: (provider: "google" | "apple") => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  /** Fresh Clerk session token for calls to our backend. Null when signed out. */
  getToken: () => Promise<string | null>;
}

export function useAuth(): AuthValue {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { isLoaded: signInLoaded, signIn: clerkSignIn } = useSignIn();

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const user: AuthUser | null =
    isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
          name: clerkUser.fullName ?? clerkUser.firstName ?? undefined,
          picture: clerkUser.imageUrl,
        }
      : null;

  const signIn = useCallback(
    async (provider: "google" | "apple"): Promise<void> => {
      if (!signInLoaded || !clerkSignIn) return;
      setIsSigningIn(true);
      setError(null);
      try {
        await clerkSignIn.authenticateWithRedirect({
          strategy: provider === "google" ? "oauth_google" : "oauth_apple",
          redirectUrl: "/auth/callback",
          redirectUrlComplete: "/profile",
        });
      } catch (err) {
        setIsSigningIn(false);
        setError(
          err instanceof Error ? err.message : "Sign-in failed. Please try again.",
        );
      }
    },
    [signInLoaded, clerkSignIn],
  );

  const signOut = useCallback((): void => {
    void clerkSignOut();
  }, [clerkSignOut]);

  const clearError = useCallback((): void => setError(null), []);

  const getTokenSafe = useCallback(async (): Promise<string | null> => {
    try {
      return (await getToken()) ?? null;
    } catch {
      return null;
    }
  }, [getToken]);

  return {
    user,
    isLoading: !isLoaded,
    isSigningIn,
    error,
    signIn,
    signOut,
    clearError,
    getToken: getTokenSafe,
  };
}
