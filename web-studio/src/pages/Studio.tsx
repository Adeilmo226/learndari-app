import type { JSX } from "react";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Check,
  Cloud,
  Compass,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Quote,
  Route,
} from "lucide-react";

import { DashboardPanel } from "@/components/studio/DashboardPanel";
import { ExplorePanel } from "@/components/studio/ExplorePanel";
import { HistoryPanel } from "@/components/studio/HistoryPanel";
import { LessonsPanel } from "@/components/studio/LessonsPanel";
import { LoginScreen } from "@/components/studio/LoginScreen";
import { ProverbsPanel } from "@/components/studio/ProverbsPanel";
import { VocabPanel } from "@/components/studio/VocabPanel";
import { WaitlistPanel } from "@/components/studio/WaitlistPanel";
import { WordOfTheDayPanel } from "@/components/studio/WordOfTheDayPanel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StudioProvider, useStudio } from "@/hooks/useStudio";
import { logout, verifySession } from "@/lib/api";
import { cn } from "@/lib/utils";

type SectionId =
  | "dashboard"
  | "lessons"
  | "vocab"
  | "proverbs"
  | "wotd"
  | "explore"
  | "waitlist"
  | "history";

const SECTIONS: { id: SectionId; label: string; icon: typeof BookOpen }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "lessons", label: "Lessons", icon: Route },
  { id: "vocab", label: "Vocab sets", icon: BookOpen },
  { id: "proverbs", label: "Proverbs", icon: Quote },
  { id: "wotd", label: "Word of the Day", icon: CalendarDays },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "waitlist", label: "App waitlist", icon: Mail },
  { id: "history", label: "History", icon: History },
];

/** Live publishing status, so it is always obvious whether an edit is out. */
function SaveIndicator(): JSX.Element {
  const { saveState, saveProblems, lastSavedAt } = useStudio();

  if (saveState === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Publishing…
      </span>
    );
  }

  if (saveState === "dirty") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Cloud className="h-4 w-4" />
        Unsaved changes
      </span>
    );
  }

  if (saveState === "error") {
    return (
      <span
        className="flex items-center gap-1.5 text-sm text-destructive"
        title={saveProblems.join("\n")}
      >
        <AlertCircle className="h-4 w-4" />
        {saveProblems[0] ?? "Not published"}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--brand-green))]">
      <Check className="h-4 w-4" />
      Live in the app
      {lastSavedAt ? (
        <span className="hidden text-muted-foreground sm:inline">
          · {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : null}
    </span>
  );
}

function StudioWorkspace({ onSignOut }: { onSignOut: () => void }): JSX.Element {
  const { isLoading, loadError, reload } = useStudio();
  const [section, setSection] = useState<SectionId>("dashboard");
  const [needsAudioOnly, setNeedsAudioOnly] = useState<boolean>(false);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading your content…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="max-w-sm text-muted-foreground">{loadError}</p>
        <Button onClick={() => void reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsNavOpen((open) => !open)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
              LD
            </span>
            <span className="text-sm font-semibold">
              LearnDari <span className="text-muted-foreground">Studio</span>
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <label className="hidden items-center gap-2 text-sm sm:flex">
              <Switch checked={needsAudioOnly} onCheckedChange={setNeedsAudioOnly} />
              Needs audio
            </label>
            <SaveIndicator />
            <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav
          className={cn(
            "fixed inset-y-0 left-0 top-[57px] z-20 w-56 shrink-0 border-r bg-background p-3 lg:sticky lg:block",
            isNavOpen ? "block" : "hidden",
          )}
        >
          <ul className="space-y-1">
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setIsNavOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                    section === item.id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <label className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm sm:hidden">
            <Switch checked={needsAudioOnly} onCheckedChange={setNeedsAudioOnly} />
            Needs audio
          </label>
        </nav>

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          {section === "dashboard" && <DashboardPanel />}
          {section === "lessons" && <LessonsPanel needsAudioOnly={needsAudioOnly} />}
          {section === "vocab" && <VocabPanel needsAudioOnly={needsAudioOnly} />}
          {section === "proverbs" && <ProverbsPanel needsAudioOnly={needsAudioOnly} />}
          {section === "wotd" && <WordOfTheDayPanel />}
          {section === "explore" && <ExplorePanel needsAudioOnly={needsAudioOnly} />}
          {section === "waitlist" && <WaitlistPanel />}
          {section === "history" && <HistoryPanel />}
        </main>
      </div>
    </div>
  );
}

/** Entry point: password gate, then the workspace. */
export default function Studio(): JSX.Element {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    void verifySession().then(setIsSignedIn);
  }, []);

  if (isSignedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <LoginScreen onSignedIn={() => setIsSignedIn(true)} />;
  }

  return (
    <StudioProvider>
      <StudioWorkspace
        onSignOut={() => {
          logout();
          setIsSignedIn(false);
        }}
      />
    </StudioProvider>
  );
}
