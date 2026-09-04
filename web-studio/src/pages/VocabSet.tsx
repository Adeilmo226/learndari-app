import { ArrowLeft, BookOpen, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { Flashcard } from "@/components/site/Flashcard";
import { QuizRunner } from "@/components/site/QuizRunner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import type { StudioWord } from "@/lib/content";

type Mode = "overview" | "flashcards" | "quiz";

export default function VocabSet(): JSX.Element {
  const { setId } = useParams<{ setId: string }>();
  const { content, isLoading } = useContent();

  const [mode, setMode] = useState<Mode>("overview");
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

  const startMode = useCallback((next: Mode): void => {
    setIndex(0);
    setIsFlipped(false);
    setMode(next);
  }, []);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </SiteLayout>
    );
  }

  if (!set) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">We couldn&apos;t find that set</h1>
          <Link
            to="/vocab"
            className="mt-4 inline-block font-semibold text-red-600 hover:underline"
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
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Back link */}
        {mode === "overview" ? (
          <Link
            to="/vocab"
            className="mb-3 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Vocabulary Sets
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setMode("overview")}
            className="mb-3 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to {set.name}
          </button>
        )}

        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <span className="text-6xl" aria-hidden>
            {set.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{set.name}</h1>
            <p className="mt-1 text-gray-600">{set.summary}</p>
          </div>
        </div>

        {/* Overview: mode cards + word list */}
        {mode === "overview" && (
          <>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => startMode("flashcards")}
                className="group flex items-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-red-600 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-100 transition-colors group-hover:bg-red-600">
                  <BookOpen className="h-7 w-7 text-red-600 transition-colors group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Flashcards</h3>
                  <p className="text-gray-600">Review vocabulary with interactive cards</p>
                </div>
                <span className="text-2xl text-gray-400 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={() => startMode("quiz")}
                className="group flex items-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-green-600 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100 transition-colors group-hover:bg-green-600">
                  <Brain className="h-7 w-7 text-green-600 transition-colors group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Quiz Mode</h3>
                  <p className="text-gray-600">Test your knowledge with multiple choice</p>
                </div>
                <span className="text-2xl text-gray-400 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              All Words ({words.length})
            </h2>
            <div className="space-y-3">
              {words.map((entry) => (
                <VocabWordCard key={entry.id} word={entry} />
              ))}
            </div>
          </>
        )}

        {/* Flashcards */}
        {mode === "flashcards" && word && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-300"
                  style={{ width: `${((index + 1) / words.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium tabular-nums text-gray-500">
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
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-red-600 hover:text-red-600"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-95"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz */}
        {mode === "quiz" && (
          <div className="mx-auto max-w-3xl">
            <QuizRunner words={words} distractorPool={pool} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

/** Word row with audio, in the original site's card styling. */
function VocabWordCard({ word }: { word: StudioWord }): JSX.Element {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 transition-colors hover:border-gray-300">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="mb-1 text-sm text-gray-500">English</p>
            <p className="text-xl font-semibold text-gray-900">{word.english}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-500">Dari</p>
            <p className="text-left text-2xl font-semibold text-gray-900" dir="rtl">
              {word.dari}
            </p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-500">Pronunciation</p>
            <p className="text-xl font-medium italic text-gray-700">{word.phonetic}</p>
          </div>
        </div>
        <AudioButton
          audioKey={word.audioKey}
          text={word.dari}
          size="lg"
          className="ml-6 h-14 w-14 border-red-200 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
        />
      </div>
    </div>
  );
}
