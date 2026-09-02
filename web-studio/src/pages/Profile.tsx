import { Flame, Loader2, LogOut, Sparkles, Trash2, TrendingUp } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";
import { SignInPanel } from "@/components/site/SignInPanel";
import { useContent } from "@/hooks/useContent";
import { getAccessToken, useAuth } from "@/hooks/useAuth";
import { useProgress, XP_PER_LEVEL } from "@/hooks/useProgress";
import { deleteAccountProgress } from "@/lib/publicApi";

export default function Profile(): JSX.Element {
  const { user, isLoading, signOut } = useAuth();
  const progress = useProgress();
  const { content } = useContent();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const totalLessons = useMemo(
    () => content.units.reduce((total, unit) => total + unit.lessons.length, 0),
    [content.units],
  );
  const completed = progress.state.completedLessonIds.length;

  const deleteAccount = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    try {
      const token = getAccessToken();
      if (token) await deleteAccountProgress(token);
      progress.reset();
      signOut();
    } catch {
      setIsDeleting(false);
    }
  }, [progress, signOut]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="site-container flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="site-container max-w-md">
          <div className="app-card p-8 text-center sm:p-10">
            <p className="dari-display text-4xl font-semibold text-primary">دری</p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Save your progress</h1>
            <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted-foreground">
              Sign in and your lessons, points and streak follow you — including onto the
              iPhone app when it arrives. Everything you've done so far comes with you.
            </p>

            <SignInPanel className="mt-8" />

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              By signing in you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-2 hover:text-primary">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            You don't need an account to learn —{" "}
            <Link to="/learn" className="font-semibold text-primary hover:underline">
              carry on without one
            </Link>
            .
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeading title={user.name ?? "Your profile"} subtitle={user.email} />

      <div className="site-container max-w-3xl space-y-5">
        {/* Level */}
        <div className="app-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-foreground">Level {progress.level}</h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {progress.xpIntoLevel} / {XP_PER_LEVEL} XP
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-brand-amber transition-all duration-500"
              style={{ width: `${progress.levelProgress * 100}%` }}
            />
          </div>
          <p className="mt-2.5 text-sm text-muted-foreground">
            {progress.xpToNextLevel} XP to level {progress.level + 1}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: Flame,
              value: String(progress.state.streak),
              label: "Day streak",
              tint: "text-brand-amber",
            },
            {
              icon: Sparkles,
              value: String(Object.keys(progress.state.vocab).length),
              label: "Words practised",
              tint: "text-primary",
            },
            {
              icon: TrendingUp,
              value: String(progress.state.xp),
              label: "Total XP",
              tint: "text-brand-green",
            },
          ].map((stat) => (
            <div key={stat.label} className="app-card p-5 text-center">
              <stat.icon className={`mx-auto h-5 w-5 ${stat.tint}`} />
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Course progress */}
        <div className="app-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-foreground">Course progress</h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {completed} / {totalLessons} lessons
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${totalLessons > 0 ? (completed / totalLessons) * 100 : 0}%`,
              }}
            />
          </div>
          <Link
            to="/learn"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Continue learning →
          </Link>
        </div>

        {/* Account */}
        <div className="app-card divide-y divide-border">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 px-6 py-4 text-left font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Sign out
          </button>

          <div className="px-6 py-4">
            {confirmDelete ? (
              <div>
                <p className="font-medium text-foreground">
                  Delete your account and all progress?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This removes your lessons, points and word history. It can't be undone.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void deleteAccount()}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
                  >
                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Yes, delete it
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center gap-3 text-left font-medium text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
