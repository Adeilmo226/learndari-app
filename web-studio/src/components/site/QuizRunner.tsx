import { Check, RotateCcw, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";

import { AudioButton } from "@/components/site/AudioButton";
import { cn } from "@/lib/utils";
import type { StudioWord } from "@/lib/content";
import { buildChoiceQuestions, type ChoiceQuestion } from "@/lib/exercises";

interface QuizRunnerProps {
  words: StudioWord[];
  /** Extra words used as plausible wrong answers. */
  distractorPool: StudioWord[];
  onFinished?: (correct: number, total: number) => void;
}

/** A short multiple-choice quiz over a set of words. */
export function QuizRunner({
  words,
  distractorPool,
  onFinished,
}: QuizRunnerProps): JSX.Element {
  const [round, setRound] = useState<number>(0);
  const questions = useMemo<ChoiceQuestion[]>(
    () => buildChoiceQuestions(words, distractorPool),
    // `round` reshuffles the quiz when the learner plays again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words, distractorPool, round],
  );

  const [index, setIndex] = useState<number>(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const question = questions[index];
  const isDone = index >= questions.length;

  const pick = useCallback(
    (option: string): void => {
      if (picked !== null || !question) return;
      setPicked(option);

      const isRight = option === question.answer;
      if (isRight) setCorrectCount((count) => count + 1);

      window.setTimeout(
        () => {
          setPicked(null);
          setIndex((current) => {
            const next = current + 1;
            if (next >= questions.length) {
              onFinished?.(isRight ? correctCount + 1 : correctCount, questions.length);
            }
            return next;
          });
        },
        isRight ? 700 : 1400,
      );
    },
    [picked, question, questions.length, correctCount, onFinished],
  );

  const restart = useCallback((): void => {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setRound((value) => value + 1);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="app-card p-8 text-center text-muted-foreground">
        This set needs at least a few words before it can be quizzed.
      </div>
    );
  }

  if (isDone) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="app-card p-10 text-center">
        <p className="text-5xl font-bold text-primary">{percent}%</p>
        <p className="mt-3 text-lg font-semibold text-foreground">
          {correctCount} of {questions.length} correct
        </p>
        <p className="mt-2 text-muted-foreground">
          {percent === 100
            ? "Perfect. Every single one."
            : percent >= 70
              ? "Solid work — go again to lock them in."
              : "Worth another pass. Repetition is the whole trick."}
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="app-card p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {question.direction === "dariToEnglish" ? "What does this mean?" : "How do you say"}
        </p>

        {question.direction === "dariToEnglish" ? (
          <>
            <p className="dari-display mt-4 text-5xl font-semibold text-foreground">
              {question.word.dari}
            </p>
            <div className="mt-5 flex justify-center">
              <AudioButton audioKey={question.word.audioKey} text={question.word.dari} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-4xl font-bold text-foreground">{question.word.english}</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isAnswer = option === question.answer;
          const isPicked = option === picked;
          const revealed = picked !== null;

          return (
            <button
              key={option}
              type="button"
              onClick={() => pick(option)}
              disabled={revealed}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-lg font-medium transition-all",
                "border-border bg-card hover:border-primary/50 hover:bg-accent active:scale-[0.99]",
                revealed && isAnswer && "border-brand-green bg-brand-green/10 text-foreground",
                revealed && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                revealed && !isAnswer && !isPicked && "opacity-50",
                question.direction === "englishToDari" && "dari-display justify-end text-2xl",
              )}
            >
              <span>{option}</span>
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
