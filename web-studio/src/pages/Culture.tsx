import { CalendarDays, Quote, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { JSX } from "react";

import { AudioButton } from "@/components/site/AudioButton";
import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";
import type { StudioProverb, StudioWord } from "@/lib/content";

const ALL = "All";

/**
 * Picks the Word of the Day: the scheduled entry for today when the Studio has
 * one, otherwise a stable pick that changes daily rather than on every render.
 */
function wordOfTheDay(scheduled: { date: string; word: StudioWord }[], pool: StudioWord[]): StudioWord | null {
  const today = new Date().toISOString().slice(0, 10);
  const planned = scheduled.find((entry) => entry.date === today);
  if (planned) return planned.word;
  if (pool.length === 0) return null;

  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  return pool[daysSinceEpoch % pool.length];
}

function ProverbCard({ proverb }: { proverb: StudioProverb }): JSX.Element {
  return (
    <article className="app-card p-7">
      <div className="flex items-start justify-between gap-4">
        <Quote className="h-6 w-6 shrink-0 text-primary/40" />
        <AudioButton audioKey={proverb.audioKey} text={proverb.dari} size="sm" />
      </div>

      <p className="dari-display mt-4 text-2xl leading-relaxed text-foreground">
        {proverb.dari}
      </p>
      <p className="mt-3 text-sm italic text-muted-foreground">{proverb.phonetic}</p>

      <p className="mt-5 text-lg font-semibold text-foreground">“{proverb.english}”</p>
      <p className="mt-2 leading-relaxed text-muted-foreground">{proverb.meaning}</p>

      {proverb.category && (
        <span className="mt-5 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          {proverb.category}
        </span>
      )}
    </article>
  );
}

export default function Culture(): JSX.Element {
  const { content, isLoading } = useContent();
  const [category, setCategory] = useState<string>(ALL);

  const pool = useMemo(() => allUniqueWords(content), [content]);
  const daily = useMemo(
    () => wordOfTheDay(content.wordOfTheDaySchedule, pool),
    [content.wordOfTheDaySchedule, pool],
  );

  const categories = useMemo<string[]>(() => {
    const found = new Set(content.proverbs.map((proverb) => proverb.category).filter(Boolean));
    return [ALL, ...[...found].sort()];
  }, [content.proverbs]);

  const proverbs = useMemo(
    () =>
      category === ALL
        ? content.proverbs
        : content.proverbs.filter((proverb) => proverb.category === category),
    [content.proverbs, category],
  );

  return (
    <SiteLayout>
      <PageHeading
        title="Culture & Traditions"
        subtitle="Explore Afghan culture, wisdom, and the language behind it."
      />

      <div className="site-container max-w-4xl">
        {isLoading && <Skeleton className="h-60 rounded-2xl" />}

        {/* Word of the Day */}
        {!isLoading && daily && (
          <section id="word-of-the-day" className="scroll-mt-24">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Word of the Day</h2>
            </div>

            <div className="app-card hero-wash p-8 text-center sm:p-10">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="dari-display mt-5 text-6xl font-semibold text-foreground">
                {daily.dari}
              </p>
              <p className="mt-4 text-lg italic text-muted-foreground">{daily.phonetic}</p>
              <div className="mx-auto my-5 h-px w-24 bg-border" />
              <p className="text-2xl font-bold text-foreground">{daily.english}</p>

              <div className="mt-6 flex justify-center">
                <AudioButton audioKey={daily.audioKey} text={daily.dari} size="lg" />
              </div>

              {daily.exampleDari && (
                <div className="mx-auto mt-8 max-w-md rounded-2xl bg-card/70 p-5">
                  <p className="dari-display text-lg text-foreground">{daily.exampleDari}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{daily.exampleEnglish}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Proverbs */}
        {!isLoading && content.proverbs.length > 0 && (
          <section id="proverbs" className="mt-16 scroll-mt-24">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Dari Proverbs</h2>
            </div>
            <p className="mb-6 text-muted-foreground">
              Traditional Afghan wisdom — the kind of thing you'll hear from a grandparent.
            </p>

            {categories.length > 2 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      category === option
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {proverbs.map((proverb) => (
                <ProverbCard key={proverb.id} proverb={proverb} />
              ))}
            </div>
          </section>
        )}

        {/* Everyday phrases */}
        {!isLoading && content.phrases.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold tracking-tight">Everyday phrases</h2>
            <p className="mb-6 mt-1 text-muted-foreground">
              The expressions that come up constantly in Afghan homes and conversation.
            </p>

            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {content.phrases.map((phrase) => (
                <li key={phrase.id} className="flex items-center gap-4 bg-card px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{phrase.english}</p>
                    <p className="text-sm italic text-muted-foreground">{phrase.phonetic}</p>
                  </div>
                  <p className="dari-display shrink-0 text-2xl text-foreground">
                    {phrase.dari}
                  </p>
                  <AudioButton audioKey={phrase.audioKey} text={phrase.dari} size="sm" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
