import type { StudioWord } from "./content";
import { shuffle, type PromptDirection } from "./exercises";

/**
 * Drives one lesson practice session: builds the queue, hands out exercises,
 * requeues anything missed, and tracks the running score.
 *
 * A direct port of the iOS `LessonSession` so both surfaces teach identically.
 * Sessions are deliberately not persisted — leaving mid-way and coming back
 * starts fresh, which keeps the model simple.
 */

export type ExerciseKind = "multipleChoice" | "listening" | "matchPairs";

export interface SessionItem {
  id: string;
  word: StudioWord;
  kind: ExerciseKind;
  /** True for words blended in from earlier lessons. */
  isReview: boolean;
}

export interface Exercise {
  id: string;
  item: SessionItem;
  direction: PromptDirection;
  /** Four choices for multiple choice and listening; empty for match pairs. */
  options: StudioWord[];
  /** Four words to pair up; empty for the other kinds. */
  pairs: StudioWord[];
}

/** Callbacks into the learner's progress record. */
export interface SessionHooks {
  onCorrectAnswer: () => number;
  onPerfectBonus: () => number;
  recordAnswer: (wordId: string, correct: boolean) => void;
  reviewWords: (excluded: Set<string>, limit: number) => StudioWord[];
}

const REPEATS_PER_WORD = 2;
const WORDS_PER_MATCH = 4;
const MAX_MATCH_SLOTS = 2;
const REVIEW_MIN = 2;
const REVIEW_MAX = 4;
const REQUEUE_MIN = 3;
const REQUEUE_MAX = 5;

function randomBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export class LessonSession {
  current: Exercise | null = null;
  isFinished = false;
  answeredCount = 0;
  correctCount = 0;
  earnedXP = 0;

  private queue: SessionItem[] = [];
  private clearedCount = 0;
  private misses = new Map<string, number>();
  private practisedWordIds = new Set<string>();

  constructor(
    private readonly lessonWords: StudioWord[],
    private readonly milestoneWords: StudioWord[],
    private readonly corpus: StudioWord[],
    private readonly hooks: SessionHooks,
  ) {
    this.buildQueue();
    this.advance();
  }

  // MARK: - Progress

  /**
   * Fraction of the session cleared. The denominator grows when an answer is
   * missed, so the bar eases back rather than lying about what's left.
   */
  get progressFraction(): number {
    const total = this.clearedCount + this.queue.length;
    return total > 0 ? this.clearedCount / total : 1;
  }

  get accuracy(): number {
    return this.answeredCount > 0 ? this.correctCount / this.answeredCount : 0;
  }

  get wordsPractisedCount(): number {
    return this.practisedWordIds.size;
  }

  get isFlawless(): boolean {
    return this.answeredCount > 0 && this.correctCount === this.answeredCount;
  }

  // MARK: - Answering

  /** Records the answer to the current multiple choice or listening exercise. */
  submit(correct: boolean): void {
    const exercise = this.current;
    if (!exercise || this.queue.length === 0) return;

    this.register(exercise.item.word, correct);

    const item = this.queue.shift() as SessionItem;
    if (correct) {
      this.clearedCount += 1;
    } else {
      // Third time unlucky: drop to multiple choice so the right answer can
      // actually land before the session ends.
      if ((this.misses.get(item.word.id) ?? 0) >= 2) {
        item.kind = "multipleChoice";
      }
      const offset = Math.min(this.queue.length, randomBetween(REQUEUE_MIN, REQUEUE_MAX));
      this.queue.splice(offset, 0, item);
    }
    this.advance();
  }

  /**
   * Records a finished match-pairs grid. Words paired without a mistake also
   * clear one pending queue slot, so matching is worth doing well.
   */
  submitMatch(firstTryCorrect: Set<string>, missed: Set<string>): void {
    if (!this.current || this.queue.length === 0) return;
    const pairs = this.current.pairs;

    for (const word of pairs) {
      this.register(word, !missed.has(word.id));
    }

    this.queue.shift();
    this.clearedCount += 1;

    for (const wordId of firstTryCorrect) {
      const index = this.queue.findIndex((item) => item.word.id === wordId);
      if (index === -1) continue;
      this.queue.splice(index, 1);
      this.clearedCount += 1;
    }
    this.advance();
  }

  private register(word: StudioWord, correct: boolean): void {
    this.practisedWordIds.add(word.id);
    this.answeredCount += 1;
    if (correct) {
      this.correctCount += 1;
      this.earnedXP += this.hooks.onCorrectAnswer();
    } else {
      this.misses.set(word.id, (this.misses.get(word.id) ?? 0) + 1);
    }
    this.hooks.recordAnswer(word.id, correct);
  }

  private advance(): void {
    const next = this.queue[0];
    if (!next) {
      if (this.isFlawless) this.earnedXP += this.hooks.onPerfectBonus();
      this.current = null;
      this.isFinished = true;
      return;
    }
    this.current = this.makeExercise(next);
  }

  // MARK: - Queue construction

  private buildQueue(): void {
    const newWords = this.lessonWords;
    if (newWords.length === 0) {
      this.isFinished = true;
      return;
    }

    const canMatch = newWords.length >= WORDS_PER_MATCH;
    let matchSlots = canMatch ? MAX_MATCH_SLOTS : 0;
    const items: SessionItem[] = [];

    // Each word gets one multiple choice plus one other format, which lands
    // close to the intended 50/25/25 split while keeping variety per word.
    newWords.forEach((word, offset) => {
      items.push({ id: `${word.id}-mc`, word, kind: "multipleChoice", isReview: false });

      const wantsMatch = canMatch && matchSlots > 0 && offset % 2 === 0;
      if (wantsMatch) matchSlots -= 1;
      items.push({
        id: `${word.id}-alt`,
        word,
        kind: wantsMatch ? "matchPairs" : "listening",
        isReview: false,
      });
    });

    items.push(...this.reviewItems(newWords.length * REPEATS_PER_WORD));
    this.queue = shuffle(items);
  }

  /**
   * Weakest previously-seen words, roughly a quarter of the queue. Review never
   * uses match pairs — it stays one word at a time.
   */
  private reviewItems(queueSize: number): SessionItem[] {
    const target = Math.min(REVIEW_MAX, Math.max(REVIEW_MIN, Math.round(queueSize * 0.25)));
    const lessonIds = new Set(this.lessonWords.map((word) => word.id));
    const candidates = this.hooks.reviewWords(lessonIds, target);

    return candidates.map((word, offset) => ({
      id: `${word.id}-review-${offset}`,
      word,
      kind: offset % 2 === 0 ? "multipleChoice" : "listening",
      isReview: true,
    }));
  }

  // MARK: - Exercise assembly

  private makeExercise(item: SessionItem): Exercise {
    const instanceId = `${item.id}-${this.clearedCount}-${this.answeredCount}`;

    if (item.kind === "matchPairs") {
      return {
        id: instanceId,
        item,
        direction: "dariToEnglish",
        options: [],
        pairs: this.matchGroup(item.word),
      };
    }

    return {
      id: instanceId,
      item,
      // Listening always asks for the meaning, so the task never changes shape
      // while the audio is playing.
      direction:
        item.kind === "listening"
          ? "dariToEnglish"
          : Math.random() < 0.5
            ? "dariToEnglish"
            : "englishToDari",
      options: this.optionsFor(item.word),
      pairs: [],
    };
  }

  /**
   * The correct word plus three distractors, preferring words the learner is
   * already working with so the choice is a real discrimination test.
   */
  private optionsFor(word: StudioWord): StudioWord[] {
    const chosen: StudioWord[] = [word];
    const tiers = [this.lessonWords, this.milestoneWords, this.corpus];

    for (const tier of tiers) {
      if (chosen.length >= 4) break;
      for (const candidate of shuffle(tier)) {
        if (chosen.length >= 4) break;
        const clashes = chosen.some(
          (entry) =>
            entry.id === candidate.id ||
            entry.english === candidate.english ||
            entry.dari === candidate.dari,
        );
        if (!clashes) chosen.push(candidate);
      }
    }
    return shuffle(chosen);
  }

  /**
   * Four words for a grid: the queued word plus others from this lesson,
   * favouring ones already drilled so the grid reinforces rather than surprises.
   */
  private matchGroup(word: StudioWord): StudioWord[] {
    const group: StudioWord[] = [word];
    const others = this.lessonWords.filter((entry) => entry.id !== word.id);
    const drilled = shuffle(others.filter((entry) => this.practisedWordIds.has(entry.id)));
    const fresh = shuffle(others.filter((entry) => !this.practisedWordIds.has(entry.id)));

    for (const candidate of [...drilled, ...fresh]) {
      if (group.length >= WORDS_PER_MATCH) break;
      group.push(candidate);
    }
    return shuffle(group);
  }
}
