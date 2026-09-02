import type { JSX } from "react";

import { AudioButton } from "@/components/site/AudioButton";
import { cn } from "@/lib/utils";
import type { StudioWord } from "@/lib/content";

interface FlashcardProps {
  word: StudioWord;
  isFlipped: boolean;
  onFlip: () => void;
}

/**
 * A card that flips between the Dari word and its meaning.
 *
 * The flip is a real 3D rotation with both faces rendered, so it reads as one
 * object turning over rather than two views swapping.
 */
export function Flashcard({ word, isFlipped, onFlip }: FlashcardProps): JSX.Element {
  return (
    <div className="[perspective:1600px]">
      <button
        type="button"
        onClick={onFlip}
        aria-label={isFlipped ? "Show the Dari side" : "Show the meaning"}
        className={cn(
          "relative block h-72 w-full transition-transform duration-500 [transform-style:preserve-3d] sm:h-80",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Dari side */}
        <span className="app-card absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 [backface-visibility:hidden] shadow-[0_18px_50px_-32px_hsl(var(--foreground)/0.4)]">
          <span className="dari-display text-6xl font-semibold text-foreground sm:text-7xl">
            {word.dari}
          </span>
          <span className="text-lg italic text-muted-foreground">{word.phonetic}</span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tap to reveal
          </span>
        </span>

        {/* Meaning side */}
        <span className="app-card absolute inset-0 flex flex-col items-center justify-center gap-4 bg-accent p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_18px_50px_-32px_hsl(var(--foreground)/0.4)]">
          <span className="text-4xl font-bold text-foreground sm:text-5xl">
            {word.english}
          </span>
          <span className="dari-display text-2xl text-primary">{word.dari}</span>
          {word.exampleDari && (
            <span className="mt-2 max-w-sm text-center">
              <span className="dari-display block text-base text-foreground">
                {word.exampleDari}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {word.exampleEnglish}
              </span>
            </span>
          )}
        </span>
      </button>

      <div className="mt-5 flex justify-center">
        <AudioButton audioKey={word.audioKey} text={word.dari} size="lg" />
      </div>
    </div>
  );
}
