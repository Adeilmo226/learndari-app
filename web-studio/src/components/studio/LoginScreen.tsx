import type { JSX } from "react";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, login } from "@/lib/api";

interface LoginScreenProps {
  onSignedIn: () => void;
}

/** The only door into the Studio: one password, no sign-up. */
export function LoginScreen({ onSignedIn }: LoginScreenProps): JSX.Element {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!password) return;
    setIsBusy(true);
    setError(null);
    try {
      await login(password);
      onSignedIn();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Could not reach the backend. Try again.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-6">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="brand-gradient px-6 py-8 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">LearnDari</p>
          <h1 className="mt-1 text-2xl font-bold">Studio</h1>
          <p className="mt-1 text-sm opacity-90">Content, lessons and audio</p>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full gap-2" disabled={isBusy || !password}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Sign in
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Private area. Only you can publish content to the app.
          </p>
        </form>
      </div>
    </div>
  );
}
