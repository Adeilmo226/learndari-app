/**
 * The content document shared by the Studio, the backend and the iOS app.
 * Keep these types in step with `functions/content-types.ts`.
 */

export interface StudioWord {
  id: string;
  english: string;
  dari: string;
  phonetic: string;
  category?: string;
  audioKey?: string;
  /** Sentence using the word, shown while the lesson introduces it. */
  exampleDari?: string;
  exampleEnglish?: string;
}

export interface StudioVocabSet {
  id: string;
  emoji: string;
  name: string;
  summary: string;
  words: StudioWord[];
}

export interface StudioLesson {
  id: string;
  title: string;
  subtitle: string;
  words: StudioWord[];
}

export interface StudioUnit {
  id: string;
  index: number;
  title: string;
  lessons: StudioLesson[];
}

export interface StudioProverb {
  id: string;
  english: string;
  dari: string;
  phonetic: string;
  meaning: string;
  category: string;
  audioKey?: string;
}

export interface ScheduledWord {
  date: string;
  word: StudioWord;
}

export interface ContentDocument {
  vocabSets: StudioVocabSet[];
  units: StudioUnit[];
  proverbs: StudioProverb[];
  popularWords: StudioWord[];
  phrases: StudioWord[];
  wordOfTheDaySchedule: ScheduledWord[];
}

export interface ContentEnvelope {
  version: number;
  updatedAt: number;
  content: ContentDocument;
}

export interface HistoryEntry {
  version: number;
  note: string;
  createdAt: number;
}

/** Short, readable, collision-resistant id. */
export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function emptyWord(prefix = "w"): StudioWord {
  return { id: newId(prefix), english: "", dari: "", phonetic: "" };
}

/** Audio for a word and for a proverb live in the same key space. */
export function audioKeyFor(id: string): string {
  return `rec-${id}`;
}

/** Every word in the document, in the order it appears in the Studio. */
export function allWords(doc: ContentDocument): StudioWord[] {
  return [
    ...doc.vocabSets.flatMap((set) => set.words),
    ...doc.units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.words)),
    ...doc.popularWords,
    ...doc.phrases,
  ];
}

export interface ContentStats {
  units: number;
  lessons: number;
  vocabSets: number;
  words: number;
  proverbs: number;
  recorded: number;
  missingAudio: number;
}

export function contentStats(doc: ContentDocument, recordings: Set<string>): ContentStats {
  const words = allWords(doc);
  const items: { audioKey?: string }[] = [...words, ...doc.proverbs];
  const recorded = items.filter((item) => item.audioKey && recordings.has(item.audioKey)).length;

  return {
    units: doc.units.length,
    lessons: doc.units.reduce((total, unit) => total + unit.lessons.length, 0),
    vocabSets: doc.vocabSets.length,
    words: words.length,
    proverbs: doc.proverbs.length,
    recorded,
    missingAudio: items.length - recorded,
  };
}

/**
 * Turns pasted rows into words. Accepts tab, comma, slash or pipe separators:
 *   Hello / سلام / salaam
 * Missing phonetics are allowed; blank lines are skipped.
 */
export function parseBulkWords(text: string, idPrefix: string): StudioWord[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line
        .split(/\t|\s*\|\s*|\s+\/\s+|\s*,\s*/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      return {
        id: newId(idPrefix),
        english: parts[0] ?? "",
        dari: parts[1] ?? "",
        phonetic: parts[2] ?? "",
      };
    })
    .filter((word) => word.english.length > 0 && word.dari.length > 0);
}

/** Moves an item within a list, returning a new array. */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Re-attaches recordings to their items.
 *
 * A recording is stored under `rec-<item id>`, but the app only looks for it
 * when the item carries a matching `audioKey`. If a save was interrupted after
 * the upload, that link goes missing and the recording is silently ignored.
 * This restores it. Returns the same object when nothing needed fixing.
 */
export function attachRecordedAudioKeys(
  doc: ContentDocument,
  recordings: Set<string>,
): ContentDocument {
  let changed = false;

  const fix = <T extends { id: string; audioKey?: string }>(item: T): T => {
    if (item.audioKey) return item;
    const key = audioKeyFor(item.id);
    if (!recordings.has(key)) return item;
    changed = true;
    return { ...item, audioKey: key };
  };

  const next: ContentDocument = {
    ...doc,
    vocabSets: doc.vocabSets.map((set) => ({ ...set, words: set.words.map(fix) })),
    units: doc.units.map((unit) => ({
      ...unit,
      lessons: unit.lessons.map((lesson) => ({ ...lesson, words: lesson.words.map(fix) })),
    })),
    proverbs: doc.proverbs.map(fix),
    popularWords: doc.popularWords.map(fix),
    phrases: doc.phrases.map(fix),
    wordOfTheDaySchedule: doc.wordOfTheDaySchedule.map((entry) => ({
      ...entry,
      word: fix(entry.word),
    })),
  };

  return changed ? next : doc;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
