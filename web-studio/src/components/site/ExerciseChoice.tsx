import { Check, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";

import { AudioButton } from "@/components/site/AudioButton";
import { cn } from "@/lib/utils";
import { audioUrl } from "@/lib/publicApi";
import type { Exercise } from "@/lib/session";

interface ExerciseChoiceProps {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}

const CORRECT_DELAY_MS = 850;
const WRONG_DELAY_MS = 1500;

/**
 * Multiple choice and listening share this layout — only the prompt differs.
 * Feedback holds longer on a miss so the right answer has time to register.
 */
export function ExerciseChoice({ exercise, onAnswer }: ExerciseChoiceProps): JSX.Element {
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const { item, direction, options } = exercise;
  const isListening = item.kind === "listening";

  const label = useCallback(
    (word: { english: string; dari: string }): string =>
      direction === "dariToEnglish" ? word.english : word.dari,
    [direction],
  );

  // Listening exercises speak themselves as they appear.
  useEffect(() => {
    if (!isListening) return;
    if (!item.word.audioKey) return;
    const audio = new Audio(audioUrl(item.word.audioKey));
    void audio.play().catch(() => {
      // Autoplay can be blocked before the first interaction; the replay
      // button is right there.
    });
    return () => {
      audio.pause();
    };
  }, [isListening, item.word.audioKey, exercise.id]);

  useEffect(() => {
    setPicked(null);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [exercise.id]);

  const pick = useCallback(
    (wordId: string): void => {
      if (picked !== null) return;
      setPicked(wordId);
      const correct = wordId === item.word.id;
      timer.current = window.setTimeout(
        () => onAnswer(correct),
        correct ? CORRECT_DELAY_MS : WRONG_DELAY_MS,
      );
    },
    [picked, item.word.id, onAnswer],
  );

  return (
    <div>
      <div className="app-card p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isListening
            ? "Listen — what did you hear?"
            : direction === "dariToEnglish"
              ? "What does this mean?"
              : "How do you say this?"}
        </p>

        {isListening ? (
          <div className="mt-6 flex justify-center">
            <AudioButton audioKey={item.word.audioKey} text={item.word.dari} size="lg" />
          </div>
        ) : direction === "dariToEnglish" ? (
          <>
            <p className="dari-display mt-4 text-5xl font-semibold text-foreground sm:text-6xl">
              {item.word.dari}
            </p>
            <div className="mt-5 flex justify-center">
              <AudioButton audioKey={item.word.audioKey} text={item.word.dari} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
            {item.word.english}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isAnswer = option.id === item.word.id;
          const isPicked = option.id === picked;
          const revealed = picked !== null;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => pick(option.id)}
              disabled={revealed}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-left text-lg font-medium transition-all",
                !revealed && "hover:border-primary/50 hover:bg-accent active:scale-[0.99]",
                revealed && isAnswer && "border-brand-green bg-brand-green/10",
                revealed && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                revealed && !isAnswer && !isPicked && "opacity-50",
                direction === "englishToDari" && "dari-display justify-end text-2xl",
              )}
            >
              <span>{label(option)}</span>
              {revealed && isAnswer && (
                <Check className="h-5 w-5 shrink-0 text-brand-green" />
              )}
              {revealed && isPicked && !isAnswer && (
                <X className="h-5 w-5 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
