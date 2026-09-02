import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import type { StudioWord } from "@/lib/content";

const MAX_RESULTS = 60;

function WordRow({ word }: { word: StudioWord }): JSX.Element {
  return (
    <li className="flex items-center gap-4 bg-card px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{word.english}</p>
        <p className="text-sm italic text-muted-foreground">{word.phonetic}</p>
      </div>
      <p className="dari-display shrink-0 text-2xl text-foreground">{word.dari}</p>
      <AudioButton audioKey={word.audioKey} text={word.dari} size="sm" />
    </li>
  );
}

export default function Explore(): JSX.Element {
  const { content, isLoading } = useContent();
  const [query, setQuery] = useState<string>("");

  const words = useMemo(() => allUniqueWords(content), [content]);

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
      <PageHeading
        title="Explore Dari Vocabulary"
        subtitle="Search for words in English, Dari, or phonetic spelling."
      />

      <div className="site-container max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “water”, “salaam” or آب"
            aria-label="Search Dari vocabulary"
            className="h-14 w-full rounded-full border border-border bg-card pl-14 pr-12 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLoading && (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && isSearching && (
          <div className="mt-8">
            <p className="mb-3 text-sm text-muted-foreground">
              {results.length === 0
                ? "No matches"
                : `${results.length}${results.length === MAX_RESULTS ? "+" : ""} ${
                    results.length === 1 ? "result" : "results"
                  }`}
            </p>
            {results.length > 0 ? (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {results.map((word) => (
                  <WordRow key={word.id} word={word} />
                ))}
              </ul>
            ) : (
              <div className="app-card p-10 text-center">
                <p className="font-semibold text-foreground">
                  Don't see the word you're looking for?
                </p>
                <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                  We add words every week, and requests jump the queue.
                </p>
                <Link
                  to="/feedback"
                  className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
                >
                  Let us know
                </Link>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isSearching && content.popularWords.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Popular Words</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {content.popularWords.map((word) => (
                <WordRow key={word.id} word={word} />
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">
                Searching covers every word in the course —{" "}
                <span className="font-semibold text-foreground">{words.length}</span> and
                counting.
              </p>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
