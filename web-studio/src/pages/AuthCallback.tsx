import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

/** Lands here after a production sign-in redirect, then bounces onwards. */
export default function AuthCallback(): JSX.Element {
  const { exchangeCode } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef<boolean>(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      navigate("/", { replace: true });
      return;
    }
    void exchangeCode(code).finally(() => navigate("/profile", { replace: true }));
  }, [exchangeCode, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}
