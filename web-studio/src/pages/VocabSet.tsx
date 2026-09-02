import { ArrowLeft, ChevronLeft, ChevronRight, Layers, Target } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { Flashcard } from "@/components/site/Flashcard";
import { QuizRunner } from "@/components/site/QuizRunner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";

type Mode = "flashcards" | "quiz" | "list";

const modes: { id: Mode; label: string; icon: typeof Layers }[] = [
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: Target },
  { id: "list", label: "All words", icon: ChevronRight },
];

export default function VocabSet(): JSX.Element {
  const { setId } = useParams<{ setId: string }>();
  const { content, isLoading } = useContent();

  const [mode, setMode] = useState<Mode>("flashcards");
  const [index, setIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const set = content.vocabSets.find((candidate) => candidate.id === setId);
  const words = useMemo(() => set?.words ?? [], [set]);
  const pool = useMemo(() => allUniqueWords(content), [content]);

  const move = useCallback(
    (delta: number): void => {
      setIsFlipped(false);
      setIndex((current) => {
        const next = current + delta;
        if (next < 0) return words.length - 1;
        if (next >= words.length) return 0;
        return next;
      });
    },
    [words.length],
  );

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="site-container space-y-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </SiteLayout>
    );
  }

  if (!set) {
    return (
      <SiteLayout>
        <div className="site-container text-center">
          <h1 className="text-2xl font-bold">We couldn't find that set</h1>
          <Link
            to="/vocab"
            className="mt-4 inline-block font-semibold text-primary hover:underline"
          >
            ← Back to all sets
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const word = words[index];

  return (
    <SiteLayout>
      <div className="site-container max-w-3xl">
        <Link
          to="/vocab"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All sets
        </Link>

        <div className="mt-5 flex items-start gap-4">
          <span className="text-5xl" aria-hidden>
            {set.emoji}
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{set.name}</h1>
            <p className="mt-1 text-muted-foreground">{set.summary}</p>
          </div>
        </div>

        {/* Mode switch */}
        <div className="mt-7 inline-flex rounded-full border border-border bg-secondary/60 p-1">
          {modes.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5",
                mode === option.id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {mode === "flashcards" && word && (
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${((index + 1) / words.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {index + 1}/{words.length}
                </span>
              </div>

              <Flashcard
                word={word}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((flipped) => !flipped)}
              />

              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {mode === "quiz" && <QuizRunner words={words} distractorPool={pool} />}

          {mode === "list" && (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {words.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-4 bg-card px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{entry.english}</p>
                    <p className="text-sm italic text-muted-foreground">{entry.phonetic}</p>
                  </div>
                  <p className="dari-display shrink-0 text-2xl text-foreground">
                    {entry.dari}
                  </p>
                  <AudioButton audioKey={entry.audioKey} text={entry.dari} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
