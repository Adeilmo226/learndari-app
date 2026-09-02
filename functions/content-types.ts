/**
 * Shared shape of the LearnDari content document.
 *
 * One JSON document holds every piece of learner-facing content. The Studio
 * writes it, the iOS app reads it. Keeping it as a single document keeps
 * publishing atomic: the app never sees half an edit.
 */

export interface ContentWord {
  id: string;
  english: string;
  dari: string;
  phonetic: string;
  category?: string;
  /** Key of a human recording stored on the backend. Absent = fall back to speech synthesis. */
  audioKey?: string;
  /** Optional sentence using the word, shown while the lesson introduces it. */
  exampleDari?: string;
  exampleEnglish?: string;
}

export interface ContentVocabSet {
  id: string;
  emoji: string;
  name: string;
  summary: string;
  words: ContentWord[];
}

export interface ContentLesson {
  id: string;
  title: string;
  subtitle: string;
  words: ContentWord[];
}

export interface ContentUnit {
  id: string;
  index: number;
  title: string;
  lessons: ContentLesson[];
}

export interface ContentProverb {
  id: string;
  english: string;
  dari: string;
  phonetic: string;
  meaning: string;
  category: string;
  audioKey?: string;
}

/** A word pinned to a calendar date, as scheduled in the Studio. */
export interface ScheduledWord {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  word: ContentWord;
}

export interface ContentDocument {
  vocabSets: ContentVocabSet[];
  units: ContentUnit[];
  proverbs: ContentProverb[];
  popularWords: ContentWord[];
  phrases: ContentWord[];
  wordOfTheDaySchedule: ScheduledWord[];
}

export interface ContentEnvelope {
  version: number;
  updatedAt: number;
  content: ContentDocument;
}

/**
 * Guards against a malformed or half-written document going live.
 * Returns a list of problems; empty means the document is publishable.
 */
export function validateDocument(value: unknown): string[] {
  const problems: string[] = [];
  if (typeof value !== "object" || value === null) {
    return ["Content must be an object"];
  }
  const doc = value as Partial<ContentDocument>;

  const requiredArrays: (keyof ContentDocument)[] = [
    "vocabSets",
    "units",
    "proverbs",
    "popularWords",
    "phrases",
    "wordOfTheDaySchedule",
  ];
  for (const key of requiredArrays) {
    if (!Array.isArray(doc[key])) problems.push(`Missing or invalid "${key}"`);
  }
  if (problems.length > 0) return problems;

  if ((doc.units ?? []).length === 0) problems.push("At least one unit is required");
  if ((doc.vocabSets ?? []).length === 0) problems.push("At least one vocab set is required");

  const seenWordIds = new Set<string>();
  const checkWord = (word: ContentWord, where: string): void => {
    if (!word?.id) problems.push(`${where}: a word is missing an id`);
    if (!word?.english?.trim()) problems.push(`${where}: "${word?.id}" has no English`);
    if (!word?.dari?.trim()) problems.push(`${where}: "${word?.english}" has no Dari`);
    if (word?.id) {
      if (seenWordIds.has(word.id)) problems.push(`${where}: duplicate word id "${word.id}"`);
      seenWordIds.add(word.id);
    }
  };

  for (const set of doc.vocabSets ?? []) {
    if (!set.id) problems.push("A vocab set is missing an id");
    if (!set.name?.trim()) problems.push(`Vocab set "${set.id}" has no name`);
    if (set.words.length === 0) problems.push(`Vocab set "${set.name}" has no words`);
    for (const word of set.words) checkWord(word, `Set ${set.name}`);
  }

  for (const unit of doc.units ?? []) {
    if (!unit.id) problems.push("A unit is missing an id");
    if (!unit.title?.trim()) problems.push(`Unit "${unit.id}" has no title`);
    if (unit.lessons.length === 0) problems.push(`Unit "${unit.title}" has no lessons`);
    for (const lesson of unit.lessons) {
      if (!lesson.id) problems.push(`Unit "${unit.title}" has a lesson with no id`);
      if (!lesson.title?.trim()) problems.push(`Lesson "${lesson.id}" has no title`);
      if (lesson.words.length === 0) problems.push(`Lesson "${lesson.title}" has no words`);
      for (const word of lesson.words) checkWord(word, `Lesson ${lesson.title}`);
    }
  }

  for (const proverb of doc.proverbs ?? []) {
    if (!proverb.id) problems.push("A proverb is missing an id");
    if (!proverb.dari?.trim()) problems.push(`Proverb "${proverb.id}" has no Dari text`);
    if (!proverb.english?.trim()) problems.push(`Proverb "${proverb.id}" has no translation`);
  }

  return problems.slice(0, 25);
}
