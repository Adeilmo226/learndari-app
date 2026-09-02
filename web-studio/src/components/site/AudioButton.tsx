import { Loader2, Volume2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { JSX } from "react";

import { cn } from "@/lib/utils";
import { audioUrl } from "@/lib/publicApi";

interface AudioButtonProps {
  /** Key of the Studio recording. Absent = fall back to the browser voice. */
  audioKey?: string;
  /** Dari text, spoken by the browser when there is no recording. */
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<AudioButtonProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const iconClasses: Record<NonNullable<AudioButtonProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

/**
 * Plays the human recording for a word, falling back to speech synthesis so
 * nothing is ever silent — matching how the iOS app behaves.
 */
export function AudioButton({
  audioKey,
  text,
  size = "md",
  className,
}: AudioButtonProps): JSX.Element {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakFallback = useCallback((): void => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fa-IR";
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const play = useCallback(
    (event: React.MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      setIsPlaying(true);

      if (!audioKey) {
        speakFallback();
        return;
      }

      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = audioUrl(audioKey);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => speakFallback();

      void audio.play().catch(() => speakFallback());
    },
    [audioKey, speakFallback],
  );

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Hear ${text}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-all",
        "hover:border-primary/50 hover:bg-accent active:scale-95",
        isPlaying && "border-primary/60 bg-accent",
        sizeClasses[size],
        className,
      )}
    >
      {isPlaying ? (
        <Loader2 className={cn(iconClasses[size], "animate-spin")} />
      ) : (
        <Volume2 className={iconClasses[size]} />
      )}
    </button>
  );
}
