import type { JSX } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Mic, Play, Square, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { recordingUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useStudio } from "@/hooks/useStudio";

interface AudioCellProps {
  /** Stable key for the recording — usually `rec-<item id>`. */
  audioKey: string;
  /** Called once the first recording lands, so the item can store its key. */
  onRecorded?: (key: string) => void;
  onCleared?: () => void;
  compact?: boolean;
}

type Phase = "idle" | "recording" | "uploading";

/**
 * Record / play / delete control shown beside every Dari item.
 * Uses the browser's MediaRecorder; nothing is installed and nothing leaves
 * the page until the recording stops.
 */
function AudioCellComponent({ audioKey, onRecorded, onCleared, compact }: AudioCellProps): JSX.Element {
  const { recordings, legacyRecordings, audioVersion, saveRecording, removeRecording } = useStudio();
  const [phase, setPhase] = useState<Phase>("idle");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasRecording = recordings.has(audioKey);
  const needsReRecord = legacyRecordings.has(audioKey);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopRecording = useCallback((): void => {
    recorderRef.current?.stop();
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("This browser can't record audio", {
        description: "Try Chrome, Edge or Safari on a device with a microphone.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (tickRef.current) clearInterval(tickRef.current);
        const durationMs = Date.now() - startedAtRef.current;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setPhase("uploading");

        void saveRecording(audioKey, blob, durationMs)
          .then(() => {
            onRecorded?.(audioKey);
            setPhase("idle");
          })
          .catch(() => {
            setPhase("idle");
            toast.error("That recording didn't save. Try again.");
          });
      };

      recorder.start();
      setPhase("recording");
      setElapsed(0);
      tickRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startedAtRef.current) / 100) / 10);
      }, 100);
    } catch {
      toast.error("Microphone access was blocked", {
        description: "Allow the microphone for this site, then try again.",
      });
    }
  }, [audioKey, onRecorded, saveRecording]);

  const play = useCallback((): void => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(recordingUrl(audioKey, audioVersion));
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    void audio.play().then(() => setIsPlaying(true));
  }, [audioKey, audioVersion, isPlaying]);

  const clear = useCallback((): void => {
    void removeRecording(audioKey)
      .then(() => onCleared?.())
      .catch(() => toast.error("Could not delete that recording"));
  }, [audioKey, onCleared, removeRecording]);

  if (phase === "uploading") {
    return (
      <div className="flex h-9 w-9 items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={stopRecording}
        className="gap-1.5 tabular-nums"
      >
        <Square className="h-3.5 w-3.5 fill-current" />
        {elapsed.toFixed(1)}s
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {hasRecording ? (
        <>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={play}
            className="h-9 w-9 text-[hsl(var(--brand-green))]"
            title="Play recording"
          >
            {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => void startRecording()}
            className="h-9 w-9 text-muted-foreground"
            title="Record again"
          >
            <Mic className="h-4 w-4" />
          </Button>
          {!compact && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={clear}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              title="Delete recording"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => void startRecording()}
          className={cn(
            "h-9 w-9",
            needsReRecord
              ? "text-[hsl(var(--brand-amber))] hover:text-primary"
              : "text-muted-foreground hover:text-primary",
          )}
          title={
            needsReRecord
              ? "This recording was saved in a format the app can't play — record it again"
              : "Record audio"
          }
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export const AudioCell = memo(AudioCellComponent);
