import { ArrowRight } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { PageHeading, SiteLayout } from "@/components/site/SiteLayout";
import { useContent } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";

export default function Vocab(): JSX.Element {
  const { content, isLoading, isError } = useContent();

  return (
    <SiteLayout>
      <PageHeading
        title="Vocabulary"
        subtitle="Choose a vocabulary set to start learning. Every word has audio recorded by a native speaker."
      />

      <div className="site-container">
        {isError && (
          <div className="app-card p-8 text-center text-muted-foreground">
            We couldn't load the word sets just now. Please refresh to try again.
          </div>
        )}

        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.vocabSets.map((set) => (
              <Link
                key={set.id}
                to={`/vocab/${set.id}`}
                className="app-card-interactive group flex flex-col p-6"
              >
                <span className="text-4xl" aria-hidden>
                  {set.emoji}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-foreground">{set.name}</h2>
                <p className="mt-1.5 flex-1 leading-relaxed text-muted-foreground">
                  {set.summary}
                </p>
                <span className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {set.words.length} {set.words.length === 1 ? "word" : "words"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Study
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
