import { BookOpen, Headphones } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useContent } from "@/hooks/useContent";
import type { StudioVocabSet } from "@/lib/content";

export default function Vocab(): JSX.Element {
  const { content, isLoading, isError } = useContent();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Vocabulary Sets</h1>
          <p className="text-xl text-gray-600">Choose a vocabulary set to start learning</p>
          <p className="mt-2 text-sm text-gray-400">More vocab sets coming soon.</p>
        </div>

        {isError && (
          <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-center text-gray-600">
            We couldn&apos;t load the word sets just now. Please refresh to try again.
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.vocabSets.map((set) => (
              <VocabSetCard key={set.id} set={set} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function VocabSetCard({ set }: { set: StudioVocabSet }): JSX.Element {
  return (
    <Link
      to={`/vocab/${set.id}`}
      className="group rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-red-600 hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="text-5xl transition-transform group-hover:scale-110">
          {set.emoji}
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <Headphones className="h-4 w-4" />
          <span className="text-sm font-medium">Audio</span>
        </div>
      </div>
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{set.name}</h3>
      <p className="mb-4 text-gray-600">{set.summary}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm">
            {set.words.length} {set.words.length === 1 ? "word" : "words"}
          </span>
        </div>
        <span className="font-medium text-red-600 transition-transform group-hover:translate-x-1">
          Start →
        </span>
      </div>
    </Link>
  );
}
