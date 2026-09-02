import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { ExerciseChoice } from "@/components/site/ExerciseChoice";
import { ExerciseMatch } from "@/components/site/ExerciseMatch";
import { SiteLayout } from "@/components/site/SiteLayout";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { Skeleton } from "@/components/ui/skeleton";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import { useProgress } from "@/hooks/useProgress";
import { audioUrl } from "@/lib/publicApi";
import { cn } from "@/lib/utils";
import type { StudioWord } from "@/lib/content";
import { LessonSession } from "@/lib/session";

type Phase = "intro" | "practice" | "summary";

export default function Lesson(): JSX.Element {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { content, isLoading } = useContent();
  const progress = useProgress();

  const [phase, setPhase] = useState<Phase>("intro");
  const [introIndex, setIntroIndex] = useState<number>(0);
  /** Bumped whenever the session mutates, to re-render from the class instance. */
  const [, setTick] = useState<number>(0);
  const sessionRef = useRef<LessonSession | null>(null);

  const location = useMemo(() => {
    for (const unit of content.units) {
      const lesson = unit.lessons.find((candidate) => candidate.id === lessonId);
      if (lesson) return { unit, lesson };
    }
    return null;
  }, [content.units, lessonId]);

  const lesson = location?.lesson;
  const milestoneWords = useMemo(
    () => location?.unit.lessons.flatMap((entry) => entry.words) ?? [],
    [location],
  );
  const corpus = useMemo(() => allUniqueWords(content), [content]);

  const word: StudioWord | undefined = lesson?.words[introIndex];

  // Each intro card speaks itself once as it arrives.
  useEffect(() => {
    if (phase !== "intro" || !word?.audioKey) return;
    const audio = new Audio(audioUrl(word.audioKey));
    void audio.play().catch(() => undefined);
    return () => audio.pause();
  }, [phase, word?.audioKey, word?.id]);

  const startPractice = useCallback((): void => {
    if (!lesson) return;
    sessionRef.current = new LessonSession(lesson.words, milestoneWords, corpus, {
      onCorrectAnswer: () => progress.award("correctAnswer"),
      onPerfectBonus: () => progress.award("perfectQuiz"),
      recordAnswer: progress.recordAnswer,
      reviewWords: (excluded, limit) => progress.reviewWords(corpus, excluded, limit),
    });
    setPhase("practice");
  }, [lesson, milestoneWords, corpus, progress]);

  const syncSession = useCallback((): void => {
    const session = sessionRef.current;
    setTick((value) => value + 1);
    if (session?.isFinished) {
      if (lesson && !progress.isLessonComplete(lesson.id)) {
        progress.completeLesson(lesson.id);
        progress.award("lessonComplete");
      }
      setPhase("summary");
    }
  }, [lesson, progress]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="site-container max-w-2xl space-y-5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </SiteLayout>
    );
  }

  if (!lesson) {
    return (
      <SiteLayout>
        <div className="site-container text-center">
          <h1 className="text-2xl font-bold">We couldn't find that lesson</h1>
          <Link to="/learn" className="mt-4 inline-block font-semibold text-primary hover:underline">
            ← Back to the path
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const session = sessionRef.current;

  return (
    <SiteLayout>
      <div className="site-container max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          {phase === "intro" ? (
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              The path
            </Link>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {lesson.title}
            </span>
          )}

          {phase === "practice" && (
            <button
              type="button"
              onClick={() => navigate("/learn")}
              aria-label="Leave this lesson"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Phase 1 — meet each word */}
        {phase === "intro" && word && (
          <div>
            <div className="mb-7 flex items-center justify-center gap-1.5">
              {lesson.words.map((entry, index) => (
                <span
                  key={entry.id}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === introIndex ? "w-6 bg-primary" : "w-2 bg-border",
                  )}
                />
              ))}
            </div>

            <div className="app-card p-8 text-center sm:p-10">
              <p className="dari-display text-6xl font-semibold text-foreground sm:text-7xl">
                {word.dari}
              </p>
              <p className="mt-4 text-xl italic text-muted-foreground">{word.phonetic}</p>
              <div className="my-6 h-px bg-border" />
              <p className="text-3xl font-bold text-foreground">{word.english}</p>

              <div className="mt-7 flex justify-center">
                <AudioButton audioKey={word.audioKey} text={word.dari} size="lg" />
              </div>

              {word.exampleDari && (
                <div className="mt-8 rounded-2xl bg-secondary/60 p-5">
                  <p className="dari-display text-xl text-foreground">{word.exampleDari}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{word.exampleEnglish}</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (introIndex >= lesson.words.length - 1) startPractice();
                  else setIntroIndex((index) => index + 1);
                }}
                className="w-full rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-[0.99]"
              >
                {introIndex >= lesson.words.length - 1 ? "Start practice" : "Next"}
              </button>

              <div className="flex justify-between">
                <button
                  type="button"
                  disabled={introIndex === 0}
                  onClick={() => setIntroIndex((index) => Math.max(0, index - 1))}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors enabled:hover:text-primary disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={startPractice}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Skip to practice
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2 — practise */}
        {phase === "practice" && session?.current && (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${session.progressFraction * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums text-primary">
                +{session.earnedXP} XP
              </span>
            </div>

            {session.current.item.isReview && (
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                Review from earlier
              </p>
            )}

            {session.current.item.kind === "matchPairs" ? (
              <ExerciseMatch
                key={session.current.id}
                words={session.current.pairs}
                onFinished={(firstTry, missed) => {
                  session.submitMatch(firstTry, missed);
                  syncSession();
                }}
              />
            ) : (
              <ExerciseChoice
                key={session.current.id}
                exercise={session.current}
                onAnswer={(correct) => {
                  session.submit(correct);
                  syncSession();
                }}
              />
            )}
          </div>
        )}

        {/* Phase 3 — summary */}
        {phase === "summary" && session && (
          <div className="text-center">
            <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary">
              <Trophy className="h-10 w-10" />
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              {session.isFlawless ? "Flawless!" : "Lesson complete"}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              {session.isFlawless
                ? "Every answer first time. Outstanding."
                : "You worked through every word — that's how it sticks."}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { value: String(session.wordsPractisedCount), label: "Words practised" },
                { value: `${Math.round(session.accuracy * 100)}%`, label: "Accuracy" },
                { value: `+${session.earnedXP}`, label: "XP earned" },
              ].map((stat) => (
                <div key={stat.label} className="app-card p-5">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {progress.state.streak > 0 && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
                <Flame className="h-4 w-4 text-brand-amber" />
                <span className="text-sm font-semibold">
                  {progress.state.streak} day streak
                </span>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <Link
                to="/learn"
                className="block w-full rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-[0.99]"
              >
                Continue
              </Link>
            </div>

            {/* Asked when they're most convinced. */}
            <div className="app-card mt-10 p-7">
              <p className="font-semibold text-foreground">Take this with you</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                The iPhone app is coming soon, with lessons that adapt to the words you
                find hard. We'll email you once — the day it's live.
              </p>
              <WaitlistForm source="lesson-complete" className="mt-5" label="Notify me" />
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
