import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";

import { cn } from "@/lib/utils";
import { audioUrl } from "@/lib/publicApi";
import type { StudioWord } from "@/lib/content";
import { shuffle } from "@/lib/exercises";

interface ExerciseMatchProps {
  words: StudioWord[];
  onFinished: (firstTryCorrect: Set<string>, missed: Set<string>) => void;
}

const WRONG_FLASH_MS = 500;
const COMPLETE_DELAY_MS = 550;

/**
 * Tap a Dari word, then its meaning. Pairs clear as they're made.
 *
 * Words matched without a wrong tap are reported as first-try correct, which
 * lets the session retire their other queued exercises.
 */
export function ExerciseMatch({ words, onFinished }: ExerciseMatchProps): JSX.Element {
  const dariColumn = useMemo(() => shuffle(words), [words]);
  const englishColumn = useMemo(() => shuffle(words), [words]);

  const [selectedDari, setSelectedDari] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const missedRef = useRef<Set<string>>(new Set());
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const finish = useCallback((): void => {
    const missed = missedRef.current;
    const firstTry = new Set(
      words.filter((word) => !missed.has(word.id)).map((word) => word.id),
    );
    onFinished(firstTry, missed);
  }, [words, onFinished]);

  const tapDari = useCallback((word: StudioWord): void => {
    if (matched.has(word.id)) return;
    setSelectedDari(word.id);
    if (word.audioKey) {
      const audio = new Audio(audioUrl(word.audioKey));
      void audio.play().catch(() => undefined);
    }
  }, [matched]);

  const tapEnglish = useCallback(
    (word: StudioWord): void => {
      if (!selectedDari || matched.has(word.id)) return;

      if (selectedDari === word.id) {
        const next = new Set(matched).add(word.id);
        setMatched(next);
        setSelectedDari(null);
        if (next.size === words.length) {
          timers.current.push(window.setTimeout(finish, COMPLETE_DELAY_MS));
        }
        return;
      }

      // Wrong pairing: both words involved count as missed.
      missedRef.current.add(selectedDari);
      missedRef.current.add(word.id);
      setWrongPair(word.id);
      timers.current.push(
        window.setTimeout(() => {
          setWrongPair(null);
          setSelectedDari(null);
        }, WRONG_FLASH_MS),
      );
    },
    [selectedDari, matched, words.length, finish],
  );

  const tileClasses = (isMatched: boolean, isSelected: boolean, isWrong: boolean): string =>
    cn(
      "flex min-h-[4.5rem] items-center justify-center rounded-2xl border px-4 py-3 text-center font-medium transition-all",
      isMatched
        ? "pointer-events-none border-brand-green/40 bg-brand-green/10 text-brand-green opacity-60"
        : isWrong
          ? "border-destructive bg-destructive/10"
          : isSelected
            ? "border-primary bg-accent text-primary"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent active:scale-[0.98]",
    );

  return (
    <div>
      <div className="app-card p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Match each word to its meaning
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {dariColumn.map((word) => (
            <button
              key={word.id}
              type="button"
              onClick={() => tapDari(word)}
              className={cn(
                tileClasses(matched.has(word.id), selectedDari === word.id, false),
                "dari-display w-full text-2xl",
              )}
            >
              {word.dari}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {englishColumn.map((word) => (
            <button
              key={word.id}
              type="button"
              onClick={() => tapEnglish(word)}
              className={cn(
                tileClasses(
                  matched.has(word.id),
                  false,
                  wrongPair === word.id,
                ),
                "w-full text-lg",
              )}
            >
              {word.english}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
