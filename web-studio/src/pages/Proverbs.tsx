import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { AudioButton } from "@/components/site/AudioButton";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useContent } from "@/hooks/useContent";
import type { StudioProverb } from "@/lib/content";

const ALL = "All";

export default function Proverbs(): JSX.Element {
  const { content, isLoading } = useContent();
  const [category, setCategory] = useState<string>(ALL);
  const [search, setSearch] = useState<string>("");

  const categories = useMemo<string[]>(() => {
    const found = new Set(content.proverbs.map((proverb) => proverb.category).filter(Boolean));
    return [ALL, ...[...found].sort()];
  }, [content.proverbs]);

  const proverbs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return content.proverbs.filter((proverb) => {
      const matchesCategory = category === ALL || proverb.category === category;
      const matchesSearch =
        !term ||
        proverb.english.toLowerCase().includes(term) ||
        proverb.meaning.toLowerCase().includes(term) ||
        proverb.dari.includes(search.trim());
      return matchesCategory && matchesSearch;
    });
  }, [content.proverbs, category, search]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/culture"
          className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Discover
        </Link>

        <div className="mb-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Dari Proverbs</h1>
          <p className="text-xl text-gray-600">
            Explore traditional Afghan wisdom and sayings
          </p>
        </div>

        {/* Search + category filter */}
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proverbs..."
              className="w-full rounded-xl border-2 border-gray-300 py-3 pl-12 pr-4 transition-colors focus:border-pink-600 focus:outline-none"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    category === option
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            <p className="mb-6 text-gray-600">
              Showing {proverbs.length} of {content.proverbs.length} proverbs
            </p>

            {proverbs.length > 0 ? (
              <div className="space-y-6">
                {proverbs.map((proverb) => (
                  <ProverbCard key={proverb.id} proverb={proverb} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">No proverbs found</h3>
                <p className="text-gray-600">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function ProverbCard({ proverb }: { proverb: StudioProverb }): JSX.Element {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md transition-all hover:border-pink-600 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        {proverb.category ? (
          <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
            {proverb.category}
          </span>
        ) : (
          <span />
        )}
        <AudioButton
          audioKey={proverb.audioKey}
          text={proverb.dari}
          size="sm"
          className="border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white"
        />
      </div>

      <div className="mb-4">
        <p className="mb-2 text-right text-3xl font-bold text-gray-900" dir="rtl">
          {proverb.dari}
        </p>
        <p className="text-right text-lg italic text-gray-600">{proverb.phonetic}</p>
      </div>

      <p className="mb-4 text-xl font-semibold text-gray-900">
        &ldquo;{proverb.english}&rdquo;
      </p>

      {proverb.meaning && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-gray-700">
            <strong className="text-gray-900">Meaning:</strong> {proverb.meaning}
          </p>
        </div>
      )}
    </div>
  );
}
