import {
  BookOpen,
  Check,
  Flame,
  ListOrdered,
  Lock,
  Mountain,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { JSX, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { QuizRunner } from "@/components/site/QuizRunner";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useContent } from "@/hooks/useContent";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import type { StudioLesson, StudioUnit, StudioWord } from "@/lib/content";

type LessonState = "completed" | "current" | "locked";

/**
 * The learning path — the browser twin of the app's `LearnView`.
 *
 * Same winding board-game path, same unit banners, same trophy at the end of
 * every unit, so a learner moving between phone and laptop sees one product.
 */

/** Repeating zigzag so the path snakes down the screen like a board game. */
const SWAY: number[] = [0, -54, -84, -54, 0, 54, 84, 54];

const LANDMARKS: string[] = ["🕌", "🫖", "🏔️", "🪁", "🧿", "🍇", "🐫", "📜"];

export default function Learn(): JSX.Element {
  const { content, isLoading } = useContent();
  const progress = useProgress();
  const navigate = useNavigate();

  const [guidebookUnit, setGuidebookUnit] = useState<StudioUnit | null>(null);
  const [reviewUnit, setReviewUnit] = useState<StudioUnit | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const orderedLessons = useMemo<StudioLesson[]>(
    () => content.units.flatMap((unit) => unit.lessons),
    [content.units],
  );

  const currentLessonId = useMemo<string | null>(() => {
    const next = orderedLessons.find((lesson) => !progress.isLessonComplete(lesson.id));
    return next?.id ?? null;
  }, [orderedLessons, progress]);

  const stateFor = useCallback(
    (lesson: StudioLesson): LessonState => {
      if (progress.isLessonComplete(lesson.id)) return "completed";
      return lesson.id === currentLessonId ? "current" : "locked";
    },
    [progress, currentLessonId],
  );

  const completedCount = orderedLessons.filter((lesson) =>
    progress.isLessonComplete(lesson.id),
  ).length;

  const wordsLearned = useMemo<number>(
    () => Object.keys(progress.state.vocab).length,
    [progress.state.vocab],
  );

  const showToast = useCallback((message: string): void => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const openLesson = useCallback(
    (lesson: StudioLesson, state: LessonState): void => {
      if (state === "locked") {
        showToast("Finish the lesson before this one first");
        return;
      }
      navigate(`/learn/${lesson.id}`);
    },
    [navigate, showToast],
  );

  return (
    <SiteLayout flush>
      {/* Stats strip — mirrors the app's top bar. */}
      <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="site-container flex max-w-3xl gap-2 py-2.5">
          <StatChip icon={<Flame className="h-4 w-4" />} value={progress.state.streak} tint="text-primary" />
          <StatChip icon={<Zap className="h-4 w-4" />} value={progress.state.xp} tint="text-brand-amber" />
          <StatChip icon={<BookOpen className="h-4 w-4" />} value={wordsLearned} tint="text-brand-green" />
          <StatChip
            icon={<Check className="h-4 w-4" />}
            value={`${completedCount}/${orderedLessons.length}`}
            tint="text-foreground"
          />
        </div>
      </div>

      <div className="site-container max-w-3xl pb-16">
        {isLoading && (
          <div className="space-y-6 py-10">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex justify-center">
                <Skeleton className="h-[74px] w-[74px] rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading &&
          content.units.map((unit) => (
            <section key={unit.id}>
              <UnitBanner
                unit={unit}
                stateFor={stateFor}
                onGuidebook={() => setGuidebookUnit(unit)}
              />

              <UnitPath
                unit={unit}
                stateFor={stateFor}
                onLesson={openLesson}
                onReview={() => setReviewUnit(unit)}
                onLocked={showToast}
              />
            </section>
          ))}

        {!isLoading && (
          <div className="flex flex-col items-center gap-2.5 pt-8">
            <Mountain className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              More units on the way
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="animate-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <p className="rounded-full bg-foreground/92 px-5 py-3 text-sm font-semibold text-background shadow-lg">
            {toast}
          </p>
        </div>
      )}

      {/* Unit contents */}
      <Dialog
        open={guidebookUnit !== null}
        onOpenChange={(open) => !open && setGuidebookUnit(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{guidebookUnit?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {guidebookUnit?.lessons.map((lesson) => {
              const state = stateFor(lesson);
              return (
                <div key={lesson.id} className="app-card flex items-center gap-3.5 p-4">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      state === "completed" && "bg-brand-green/12 text-brand-green",
                      state === "current" && "bg-primary/12 text-primary",
                      state === "locked" && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {state === "completed" ? (
                      <Check className="h-4 w-4" />
                    ) : state === "current" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{lesson.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {lesson.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                    {lesson.words.length}
                  </span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit review quiz */}
      <Dialog open={reviewUnit !== null} onOpenChange={(open) => !open && setReviewUnit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{reviewUnit?.title} review</DialogTitle>
          </DialogHeader>
          {reviewUnit && <UnitReview unit={reviewUnit} />}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

function UnitReview({ unit }: { unit: StudioUnit }): JSX.Element {
  const progress = useProgress();
  const words = useMemo<StudioWord[]>(
    () => unit.lessons.flatMap((lesson) => lesson.words),
    [unit],
  );

  return (
    <QuizRunner
      words={words}
      distractorPool={words}
      onFinished={(correct, total) => {
        if (total > 0 && correct === total) progress.award("perfectQuiz");
      }}
    />
  );
}

function StatChip({
  icon,
  value,
  tint,
}: {
  icon: ReactNode;
  value: string | number;
  tint: string;
}): JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary py-2">
      <span className={tint}>{icon}</span>
      <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function UnitBanner({
  unit,
  stateFor,
  onGuidebook,
}: {
  unit: StudioUnit;
  stateFor: (lesson: StudioLesson) => LessonState;
  onGuidebook: () => void;
}): JSX.Element {
  const isActive = unit.lessons.some((lesson) => stateFor(lesson) === "current");
  const isComplete = unit.lessons.every((lesson) => stateFor(lesson) === "completed");
  const isLit = isActive || isComplete;

  return (
    <div className="pb-2.5 pt-5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-3xl px-5 py-4",
          isActive && "brand-gradient",
          isComplete && !isActive && "bg-brand-green",
          !isLit && "border border-border bg-secondary",
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-extrabold uppercase tracking-wider",
              isLit ? "text-white/85" : "text-muted-foreground",
            )}
          >
            Unit {unit.index}
          </p>
          <h2
            className={cn(
              "text-xl font-bold tracking-tight",
              isLit ? "text-white" : "text-foreground",
            )}
          >
            {unit.title}
          </h2>
        </div>

        <span className={cn("h-10 w-px", isLit ? "bg-white/28" : "bg-border")} />

        <button
          type="button"
          onClick={onGuidebook}
          aria-label={`${unit.title} contents`}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            isLit ? "text-white hover:bg-white/15" : "text-foreground hover:bg-background",
          )}
        >
          <ListOrdered className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function UnitPath({
  unit,
  stateFor,
  onLesson,
  onReview,
  onLocked,
}: {
  unit: StudioUnit;
  stateFor: (lesson: StudioLesson) => LessonState;
  onLesson: (lesson: StudioLesson, state: LessonState) => void;
  onReview: () => void;
  onLocked: (message: string) => void;
}): JSX.Element {
  const isUnitComplete = unit.lessons.every((lesson) => stateFor(lesson) === "completed");

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {unit.lessons.map((lesson, index) => {
        const state = stateFor(lesson);
        const glyph: NodeGlyph =
          state === "completed" ? "check" : state === "locked" ? "lock" : index % 3 === 0 ? "book" : "star";

        return (
          <div
            key={lesson.id}
            className="relative flex justify-center"
            style={{ transform: `translateX(${SWAY[index % SWAY.length]}px)` }}
          >
            <PathNode
              glyph={glyph}
              label={lesson.title}
              state={state}
              showStartBubble={state === "current"}
              onClick={() => onLesson(lesson, state)}
            />

            {/* A landmark off to the side of the path — pure decoration. */}
            {index === 1 && (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-1/2 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-3xl sm:flex",
                  unit.index % 2 === 0 ? "left-[calc(100%+34px)]" : "right-[calc(100%+34px)]",
                )}
              >
                {LANDMARKS[(unit.index - 1) % LANDMARKS.length]}
              </span>
            )}
          </div>
        );
      })}

      <div className="pt-1">
        <PathNode
          glyph="trophy"
          label={`${unit.title} review`}
          state={isUnitComplete ? "current" : "locked"}
          isTrophy
          showStartBubble={false}
          onClick={() => {
            if (isUnitComplete) onReview();
            else onLocked("Complete every lesson in this unit to unlock the trophy");
          }}
        />
      </div>
    </div>
  );
}

type NodeGlyph = "check" | "lock" | "star" | "book" | "trophy";

function GlyphIcon({ glyph, className }: { glyph: NodeGlyph; className: string }): JSX.Element {
  switch (glyph) {
    case "check":
      return <Check className={className} strokeWidth={3.5} />;
    case "lock":
      return <Lock className={className} strokeWidth={3} />;
    case "book":
      return <BookOpen className={className} strokeWidth={2.75} />;
    case "trophy":
      return <Trophy className={className} strokeWidth={2.5} />;
    default:
      return <Star className={cn(className, "fill-current")} strokeWidth={2.5} />;
  }
}

/**
 * One node on the path. Sits on a darker base so it reads as a physical
 * button, and presses down into it when clicked.
 */
function PathNode({
  glyph,
  label,
  state,
  isTrophy = false,
  showStartBubble,
  onClick,
}: {
  glyph: NodeGlyph;
  label: string;
  state: LessonState;
  isTrophy?: boolean;
  showStartBubble: boolean;
  onClick: () => void;
}): JSX.Element {
  const diameter = isTrophy ? 82 : 74;
  const isLocked = state === "locked";

  const face = isTrophy
    ? isLocked
      ? "bg-secondary"
      : "bg-brand-amber"
    : state === "completed"
      ? "bg-brand-green"
      : state === "current"
        ? "bg-primary"
        : "bg-secondary";

  return (
    <div className="flex flex-col items-center gap-2">
      {showStartBubble && (
        <span className="animate-bubble-lift rounded-full border-[1.5px] border-border bg-card px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-primary shadow-md">
          {isTrophy ? "Review" : "Start"}
        </span>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="group relative shrink-0 active:translate-y-[5px] active:scale-[0.97] motion-safe:transition-transform motion-safe:duration-100"
        style={{ width: diameter, height: diameter + 7 }}
      >
        {/* Base — the shadow the node presses into. */}
        <span
          className={cn(
            "absolute left-0 top-[7px] rounded-full",
            isLocked ? "bg-border" : cn(face, "brightness-[0.78]"),
          )}
          style={{ width: diameter, height: diameter }}
        />

        {/* Pulsing halo on the live node. */}
        {state === "current" && !isTrophy && (
          <span
            aria-hidden
            className="animate-halo absolute left-0 top-0 rounded-full border-[5px] border-primary/30 motion-reduce:hidden"
            style={{ width: diameter, height: diameter }}
          />
        )}

        {/* Face */}
        <span
          className={cn("absolute left-0 top-0 rounded-full", face)}
          style={{ width: diameter, height: diameter }}
        >
          <span
            className={cn(
              "absolute inset-[6px] rounded-full border-2",
              isLocked ? "border-transparent" : "border-white/35",
            )}
          />
        </span>

        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            isLocked ? "text-muted-foreground" : "text-white",
          )}
          style={{ height: diameter }}
        >
          <GlyphIcon glyph={glyph} className={isTrophy ? "h-8 w-8" : "h-7 w-7"} />
        </span>
      </button>
    </div>
  );
}
