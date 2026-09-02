import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { JSX, ReactNode } from "react";

import type { StudioWord } from "@/lib/content";

/**
 * Learner progress in the browser.
 *
 * Deliberately mirrors the iOS `ProgressStore` — same XP awards, same level
 * size, same word-strength decay — so a single account can be driven from
 * either surface without the numbers disagreeing.
 */

export const XP_PER_LEVEL = 500;

export const AWARD = {
  correctAnswer: 10,
  perfectQuiz: 15,
  lessonComplete: 25,
} as const;

export type AwardKind = keyof typeof AWARD;

const STRENGTH_DECAY_PER_DAY = 5;
const STRENGTH_GAIN = 15;
const STRENGTH_PENALTY = 20;
const DAY_MS = 86_400_000;

export interface VocabProgress {
  vocabItemId: string;
  /** Epoch milliseconds. */
  lastSeenAt: number;
  lastCorrect: boolean;
  correctStreak: number;
  timesSeen: number;
  strength: number;
}

export interface ProgressState {
  completedLessonIds: string[];
  xp: number;
  streak: number;
  /** ISO date (YYYY-MM-DD) of the last day the learner practised. */
  lastActiveDate: string;
  vocab: Record<string, VocabProgress>;
}

const STORAGE_KEY = "learndari-progress";

export const emptyProgress: ProgressState = {
  completedLessonIds: [],
  xp: 0,
  streak: 0,
  lastActiveDate: "",
  vocab: {},
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStored(): ProgressState {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completedLessonIds: parsed.completedLessonIds ?? [],
      xp: parsed.xp ?? 0,
      streak: parsed.streak ?? 0,
      lastActiveDate: parsed.lastActiveDate ?? "",
      vocab: parsed.vocab ?? {},
    };
  } catch {
    return emptyProgress;
  }
}

/** Strength after time decay, or null when the word has never been seen. */
export function effectiveStrength(
  record: VocabProgress | undefined,
  now: number = Date.now(),
): number | null {
  if (!record) return null;
  const days = (now - record.lastSeenAt) / DAY_MS;
  if (days <= 0) return record.strength;
  return Math.max(0, record.strength - days * STRENGTH_DECAY_PER_DAY);
}

export interface ProgressApi {
  state: ProgressState;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
  isLessonComplete: (lessonId: string) => boolean;
  award: (kind: AwardKind, times?: number) => number;
  recordAnswer: (wordId: string, correct: boolean) => void;
  completeLesson: (lessonId: string) => void;
  /** Weakest previously-seen words, for blending review into a new lesson. */
  reviewWords: (pool: StudioWord[], excluded: Set<string>, limit: number) => StudioWord[];
  strengthFor: (wordId: string) => number | null;
  reset: () => void;
  /** Replaces local state wholesale — used when an account's progress arrives. */
  replace: (next: ProgressState) => void;
}

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<ProgressState>(readStored);
  const stateRef = useRef<ProgressState>(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode); progress simply won't persist.
    }
  }, [state]);

  /** Keeps the streak honest: same day is a no-op, yesterday extends, a gap resets. */
  const touchStreak = useCallback((current: ProgressState): ProgressState => {
    const today = todayISO();
    if (current.lastActiveDate === today) return current;

    const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
    const streak = current.lastActiveDate === yesterday ? current.streak + 1 : 1;
    return { ...current, streak, lastActiveDate: today };
  }, []);

  const award = useCallback(
    (kind: AwardKind, times = 1): number => {
      const amount = AWARD[kind] * Math.max(times, 0);
      if (amount <= 0) return 0;
      setState((current) => touchStreak({ ...current, xp: current.xp + amount }));
      return amount;
    },
    [touchStreak],
  );

  const recordAnswer = useCallback((wordId: string, correct: boolean): void => {
    setState((current) => {
      const existing = current.vocab[wordId];
      const base = effectiveStrength(existing) ?? 0;
      const strength = correct
        ? Math.min(100, base + STRENGTH_GAIN)
        : Math.max(0, base - STRENGTH_PENALTY);

      return {
        ...current,
        vocab: {
          ...current.vocab,
          [wordId]: {
            vocabItemId: wordId,
            lastSeenAt: Date.now(),
            lastCorrect: correct,
            correctStreak: correct ? (existing?.correctStreak ?? 0) + 1 : 0,
            timesSeen: (existing?.timesSeen ?? 0) + 1,
            strength,
          },
        },
      };
    });
  }, []);

  const completeLesson = useCallback(
    (lessonId: string): void => {
      setState((current) => {
        if (current.completedLessonIds.includes(lessonId)) return current;
        return touchStreak({
          ...current,
          completedLessonIds: [...current.completedLessonIds, lessonId],
        });
      });
    },
    [touchStreak],
  );

  const reviewWords = useCallback(
    (pool: StudioWord[], excluded: Set<string>, limit: number): StudioWord[] => {
      if (limit <= 0) return [];
      const now = Date.now();
      const scored: { word: StudioWord; strength: number }[] = [];

      for (const word of pool) {
        if (excluded.has(word.id)) continue;
        const strength = effectiveStrength(stateRef.current.vocab[word.id], now);
        if (strength === null) continue;
        scored.push({ word, strength });
      }

      return scored
        .sort((a, b) => a.strength - b.strength)
        .slice(0, limit)
        .map((entry) => entry.word);
    },
    [],
  );

  const value = useMemo<ProgressApi>(() => {
    const xpIntoLevel = state.xp % XP_PER_LEVEL;
    return {
      state,
      level: Math.floor(state.xp / XP_PER_LEVEL) + 1,
      xpIntoLevel,
      xpToNextLevel: XP_PER_LEVEL - xpIntoLevel,
      levelProgress: xpIntoLevel / XP_PER_LEVEL,
      isLessonComplete: (lessonId) => state.completedLessonIds.includes(lessonId),
      award,
      recordAnswer,
      completeLesson,
      reviewWords,
      strengthFor: (wordId) => effectiveStrength(state.vocab[wordId]),
      reset: () => setState(emptyProgress),
      replace: (next) => setState(next),
    };
  }, [state, award, recordAnswer, completeLesson, reviewWords]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used inside a ProgressProvider");
  }
  return context;
}
