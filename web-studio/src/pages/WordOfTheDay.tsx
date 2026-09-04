import { ArrowLeft, Calendar, Star } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { allUniqueWords, useContent } from "@/hooks/useContent";
import type { StudioWord } from "@/lib/content";

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

export default function WordOfTheDay(): JSX.Element {
  const { content, isLoading } = useContent();
  const pool = useMemo(() => allUniqueWords(content), [content]);
  const word = useMemo(
    () =>
      pickWordOfTheDay(
        content.wordOfTheDaySchedule,
        content.popularWords.length ? content.popularWords : pool,
      ),
    [content.wordOfTheDaySchedule, content.popularWords, pool],
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/culture"
          className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Discover
        </Link>

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-600">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">{today}</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Word of the Day</h1>
          <p className="text-gray-600">Learn a new Dari word every day</p>
        </div>

        {isLoading && <Skeleton className="h-56 rounded-2xl" />}

        {!isLoading && word && (
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-red-500 to-green-600 p-6 text-white shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Word of the Day</h2>
            </div>
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
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
