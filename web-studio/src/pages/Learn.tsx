import { Check, Flame, Lock, Play } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useContent } from "@/hooks/useContent";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import type { StudioLesson } from "@/lib/content";

type LessonState = "completed" | "current" | "locked";

export default function Learn(): JSX.Element {
  const { content, isLoading } = useContent();
  const progress = useProgress();

  const orderedLessons = useMemo<StudioLesson[]>(
    () => content.units.flatMap((unit) => unit.lessons),
    [content.units],
  );

  const currentLesson = useMemo(
    () => orderedLessons.find((lesson) => !progress.isLessonComplete(lesson.id)),
    [orderedLessons, progress],
  );

  const stateFor = (lesson: StudioLesson): LessonState => {
    if (progress.isLessonComplete(lesson.id)) return "completed";
    return lesson.id === currentLesson?.id ? "current" : "locked";
  };

  const completedCount = orderedLessons.filter((lesson) =>
    progress.isLessonComplete(lesson.id),
  ).length;

  return (
    <SiteLayout>
      <PageHeading
        title="Learn to Read Dari"
        subtitle="Master Dari step by step, from your first words to full phrases."
      />

      <div className="site-container max-w-3xl">
        {/* Progress summary */}
        <div className="app-card flex flex-wrap items-center gap-6 p-6">
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Level {progress.level}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {completedCount} / {orderedLessons.length} lessons
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${
                    orderedLessons.length > 0
                      ? (completedCount / orderedLessons.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {progress.state.streak > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
              <Flame className="h-4 w-4 text-brand-amber" />
              <span className="text-sm font-semibold">
                {progress.state.streak} day streak
              </span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="mt-10 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        )}

        {/* The path */}
        {!isLoading &&
          content.units.map((unit) => (
            <section key={unit.id} className="mt-12">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {unit.index}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {unit.title}
                </h2>
              </div>

              <ol className="relative space-y-3 border-l border-border pl-6">
                {unit.lessons.map((lesson) => {
                  const state = stateFor(lesson);
                  const isLocked = state === "locked";

                  const inner = (
                    <>
                      <span
                        className={cn(
                          "absolute -left-[2.15rem] flex h-8 w-8 items-center justify-center rounded-full border-2 border-background",
                          state === "completed" && "bg-brand-green text-white",
                          state === "current" && "bg-primary text-primary-foreground",
                          isLocked && "bg-secondary text-muted-foreground",
                        )}
                      >
                        {state === "completed" ? (
                          <Check className="h-4 w-4" />
                        ) : state === "current" ? (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-semibold",
                            isLocked ? "text-muted-foreground" : "text-foreground",
                          )}
                        >
                          {lesson.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {lesson.subtitle}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-medium text-muted-foreground">
                        {lesson.words.length} words
                      </span>
                    </>
                  );

                  return (
                    <li key={lesson.id} className="relative">
                      {isLocked ? (
                        <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 px-5 py-4 opacity-70">
                          {inner}
                        </div>
                      ) : (
                        <Link
                          to={`/learn/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-4 rounded-2xl border bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)]",
                            state === "current"
                              ? "border-primary/50 ring-1 ring-primary/20"
                              : "border-border",
                          )}
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

        {!isLoading && orderedLessons.length > 0 && completedCount === orderedLessons.length && (
          <div className="app-card mt-12 p-8 text-center">
            <p className="text-2xl font-bold text-foreground">
              You've finished every lesson.
            </p>
            <p className="mt-2 text-muted-foreground">
              More levels are being recorded now. In the meantime, the vocab sets are a
              good way to keep everything sharp.
            </p>
            <Link
              to="/vocab"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Practise vocabulary
            </Link>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
