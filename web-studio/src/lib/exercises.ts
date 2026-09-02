import type { StudioWord } from "./content";

/**
 * Shared exercise-building helpers used by the vocab quiz and the lesson
 * session. Kept apart from the views so both surfaces ask questions the same
 * way the iOS app does.
 */

export type PromptDirection = "dariToEnglish" | "englishToDari";

export interface ChoiceQuestion {
  id: string;
  word: StudioWord;
  direction: PromptDirection;
  /** Four options, including the answer, already shuffled. */
  options: string[];
  answer: string;
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function pickRandom<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Builds the option list for a word.
 *
 * Distractors are drawn from the surrounding pool first so wrong answers stay
 * plausible; only if the pool is too thin do we look wider.
 */
export function buildOptions(
  word: StudioWord,
  pool: StudioWord[],
  direction: PromptDirection,
  optionCount = 4,
): { options: string[]; answer: string } {
  const label = (candidate: StudioWord): string =>
    direction === "dariToEnglish" ? candidate.english : candidate.dari;

  const answer = label(word);
  const seen = new Set<string>([answer]);
  const distractors: string[] = [];

  for (const candidate of shuffle(pool)) {
    if (distractors.length >= optionCount - 1) break;
    if (candidate.id === word.id) continue;
    const text = label(candidate);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    distractors.push(text);
  }

  return { options: shuffle([answer, ...distractors]), answer };
}

/** A quiz over `words`, one question each, in random order. */
export function buildChoiceQuestions(
  words: StudioWord[],
  distractorPool: StudioWord[],
): ChoiceQuestion[] {
  const usable = words.filter((word) => word.english && word.dari);
  if (usable.length < 2) return [];

  const pool = distractorPool.length >= 4 ? distractorPool : usable;

  return shuffle(usable).map((word, index) => {
    const direction: PromptDirection =
      Math.random() < 0.5 ? "dariToEnglish" : "englishToDari";
    const { options, answer } = buildOptions(word, pool, direction);
    return { id: `${word.id}-${index}`, word, direction, options, answer };
  });
}
