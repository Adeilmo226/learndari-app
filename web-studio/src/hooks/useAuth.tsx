import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { JSX, ReactNode } from "react";

const AUTH_URL = import.meta.env.EXPO_PUBLIC_RORK_AUTH_URL as string;
const APP_KEY = import.meta.env.EXPO_PUBLIC_RORK_APP_KEY as string;

const ACCESS_TOKEN_KEY = "rork:access_token";
const REFRESH_TOKEN_KEY = "rork:refresh_token";
const CODE_VERIFIER_KEY = "rork:pkce_verifier";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Reads the JWT payload for user details, treating an expired token as absent. */
function userFromToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
      exp?: number;
    };
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: (provider: "google" | "apple") => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  exchangeCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const clearError = useCallback((): void => setError(null), []);

  const signOut = useCallback((): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CODE_VERIFIER_KEY);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      signOut();
      return;
    }

    const response = await fetch(`${AUTH_URL}/oauth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_key: APP_KEY, refresh_token: stored }),
    });

    if (!response.ok) {
      signOut();
      return;
    }

    const { access_token } = (await response.json()) as { access_token: string };
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    setUser(userFromToken(access_token));
  }, [signOut]);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken) {
          const decoded = userFromToken(accessToken);
          if (decoded) {
            setUser(decoded);
            return;
          }
        }
        if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
          await refreshToken();
        }
      } finally {
        setIsLoading(false);
      }
    };
    void checkAuth();
  }, [refreshToken]);

  useEffect(() => {
    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
        messageListenerRef.current = null;
      }
    };
  }, []);

  const exchangeCode = useCallback(async (code: string): Promise<void> => {
    const verifier = localStorage.getItem(CODE_VERIFIER_KEY);
    if (!verifier) {
      setError("Your sign-in link expired. Please try again.");
      return;
    }
    localStorage.removeItem(CODE_VERIFIER_KEY);

    const response = await fetch(`${AUTH_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_key: APP_KEY, code, code_verifier: verifier }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "We couldn't sign you in. Please try again.");
      return;
    }

    const { access_token, refresh_token, user: userData } = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      user: AuthUser;
    };
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    setUser(userData);
  }, []);

  const signIn = useCallback(
    async (provider: "google" | "apple"): Promise<void> => {
      setIsSigningIn(true);
      setError(null);
      try {
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
        localStorage.setItem(CODE_VERIFIER_KEY, verifier);

        const isPreview = window.parent !== window;
        const body: Record<string, unknown> = {
          app_key: APP_KEY,
          provider,
          code_challenge: challenge,
          target: "web",
          env: isPreview ? "preview" : "production",
        };
        if (isPreview) body.app_path = "web";

        const response = await fetch(`${AUTH_URL}/oauth/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          localStorage.removeItem(CODE_VERIFIER_KEY);
          const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
          setError(errorBody.error ?? "We couldn't start sign-in. Please try again.");
          return;
        }

        const { auth_url } = (await response.json()) as { auth_url: string };

        if (isPreview) {
          const popup = window.open(auth_url, "_blank", "width=500,height=650");
          if (!popup) {
            setError("Your browser blocked the sign-in window. Please allow popups.");
            localStorage.removeItem(CODE_VERIFIER_KEY);
            return;
          }

          await new Promise<void>((resolve) => {
            const onMessage = async (event: MessageEvent): Promise<void> => {
              const data = event.data as { type?: string; code?: string } | null;
              if (data?.type !== "rork_auth_callback") return;
              window.removeEventListener("message", onMessage);
              messageListenerRef.current = null;
              window.clearInterval(pollTimer);
              if (data.code) await exchangeCode(data.code);
              resolve();
            };
            messageListenerRef.current = onMessage;
            window.addEventListener("message", onMessage);

            const pollTimer = window.setInterval(() => {
              if (popup.closed) {
                window.clearInterval(pollTimer);
                window.removeEventListener("message", onMessage);
                messageListenerRef.current = null;
                localStorage.removeItem(CODE_VERIFIER_KEY);
                resolve();
              }
            }, 500);
          });
        } else {
          window.location.href = auth_url;
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Sign in failed");
        localStorage.removeItem(CODE_VERIFIER_KEY);
      } finally {
        setIsSigningIn(false);
      }
    },
    [exchangeCode],
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isSigningIn, error, signIn, signOut, clearError, exchangeCode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
