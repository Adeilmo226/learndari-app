import type { JSX } from "react";
import { WordTable } from "@/components/studio/WordTable";
import { useStudio } from "@/hooks/useStudio";
import type { StudioWord } from "@/lib/content";

interface ExplorePanelProps {
  needsAudioOnly: boolean;
}

/** The Explore tab's curated lists: popular words and searchable phrases. */
export function ExplorePanel({ needsAudioOnly }: ExplorePanelProps): JSX.Element {
  const { document, update, recordings } = useStudio();

  if (!document) return <></>;

  const setPopular = (popularWords: StudioWord[]): void => {
    update((draft) => ({ ...draft, popularWords }), "Edited popular words");
  };

  const setPhrases = (phrases: StudioWord[]): void => {
    update((draft) => ({ ...draft, phrases }), "Edited phrases");
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl border p-5">
        <div>
          <h2 className="text-base font-semibold">Popular words</h2>
          <p className="text-sm text-muted-foreground">
            The short list shown on the Explore tab before anyone searches.
          </p>
        </div>
        <WordTable
          words={document.popularWords}
          onChange={setPopular}
          idPrefix="pop"
          recordings={recordings}
          needsAudioOnly={needsAudioOnly}
        />
      </section>

      <section className="space-y-3 rounded-xl border p-5">
        <div>
          <h2 className="text-base font-semibold">Phrases</h2>
          <p className="text-sm text-muted-foreground">
            Full sentences people search for. These make Explore feel like a translator rather than
            a word list.
          </p>
        </div>
        <WordTable
          words={document.phrases}
          onChange={setPhrases}
          idPrefix="ph"
          recordings={recordings}
          needsAudioOnly={needsAudioOnly}
        />
      </section>
    </div>
  );
}
