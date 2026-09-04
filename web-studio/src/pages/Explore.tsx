import { Search, Star, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { SiteLayout } from "@/components/site/SiteLayout";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import type { StudioWord } from "@/lib/content";

const MAX_RESULTS = 60;

/** Stable Word of the Day: today's scheduled entry, else a daily-rotating pick. */
function pickWordOfTheDay(
  scheduled: { date: string; word: StudioWord }[],
  pool: StudioWord[],
): StudioWord | null {
  const today = new Date().toISOString().slice(0, 10);
  const planned = scheduled.find((entry) => entry.date === today);
  if (planned) return planned.word;
  if (pool.length === 0) return null;
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  return pool[daysSinceEpoch % pool.length];
}

export default function Explore(): JSX.Element {
  const { content } = useContent();
  const [query, setQuery] = useState<string>("");

  const words = useMemo(() => allUniqueWords(content), [content]);
  const wordOfTheDay = useMemo(
    () => pickWordOfTheDay(content.wordOfTheDaySchedule, content.popularWords.length ? content.popularWords : words),
    [content.wordOfTheDaySchedule, content.popularWords, words],
  );

  const results = useMemo<StudioWord[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return words
      .filter(
        (word) =>
          word.english.toLowerCase().includes(term) ||
          word.phonetic.toLowerCase().includes(term) ||
          word.dari.includes(query.trim()),
      )
      .slice(0, MAX_RESULTS);
  }, [words, query]);

  const isSearching = query.trim().length > 0;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Explore Dari Vocabulary
          </h1>
          <p className="text-xl text-gray-600">
            Search for words in English, Dari, or phonetic spelling
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto mb-6 max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={100}
              placeholder="Search for a word... (e.g., 'hello', 'salaam', or 'سلام')"
              className="w-full rounded-xl border-2 border-gray-300 py-4 pl-14 pr-4 text-lg transition-colors focus:border-red-600 focus:outline-none"
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-400">
            Don&apos;t see the word you&apos;re looking for?{" "}
            <Link to="/feedback" className="text-red-600 underline hover:text-red-700">
              Let us know
            </Link>
          </p>
        </div>

        {/* Word of the Day */}
        {!isSearching && wordOfTheDay && (
          <div className="mx-auto mb-6 max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-br from-red-500 to-green-600 p-6 text-white shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Word of the Day</h2>
              </div>
              <WordCard word={wordOfTheDay} featured />
            </div>
          </div>
        )}

        {/* Search results */}
        {isSearching && (
          <div className="mx-auto max-w-5xl">
            {results.length > 0 ? (
              <div>
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Results ({results.length}
                  {results.length === MAX_RESULTS ? "+" : ""})
                </h2>
                <div className="space-y-3">
                  {results.map((word) => (
                    <WordCard key={word.id} word={word} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">No results found</h3>
                <p className="text-gray-600">
                  Try searching with different spelling or in Dari script
                </p>
              </div>
            )}
          </div>
        )}

        {/* Popular words (no active search) */}
        {!isSearching && content.popularWords.length > 0 && (
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Popular Words</h2>
            </div>
            <div className="space-y-3">
              {content.popularWords.map((word) => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

/** Word row with audio, in the original site's card styling. */
function WordCard({
  word,
  featured = false,
}: {
  word: StudioWord;
  featured?: boolean;
}): JSX.Element {
  if (featured) {
    return (
      <div className="rounded-xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-white/80">English</p>
              <p className="text-3xl font-bold text-white">{word.english}</p>
            </div>
            <div className="text-left">
              <p className="mb-1 text-sm text-white/80">Dari</p>
              <p className="text-left text-4xl font-bold text-white" dir="rtl">
                {word.dari}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-white/80">Pronunciation</p>
              <p className="text-2xl font-medium italic text-white">{word.phonetic}</p>
            </div>
          </div>
          <AudioButton
            audioKey={word.audioKey}
            text={word.dari}
            size="lg"
            className="ml-6 h-16 w-16 border-white/30 bg-white/20 text-white hover:bg-white hover:text-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 transition-colors hover:border-gray-300">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
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
          <div>
            {word.category && (
              <>
                <p className="mb-1 text-sm text-gray-500">Category</p>
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {word.category}
                </span>
              </>
            )}
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
