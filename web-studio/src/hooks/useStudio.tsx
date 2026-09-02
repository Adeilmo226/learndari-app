import type { JSX } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import {
  ApiError,
  fetchContent,
  fetchRecordingIndex,
  saveContent,
  deleteRecording as deleteRecordingRequest,
  uploadRecording,
} from "@/lib/api";
import { toWavBlob } from "@/lib/audio";
import { attachRecordedAudioKeys, type ContentDocument } from "@/lib/content";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface StudioContextValue {
  document: ContentDocument | null;
  version: number;
  isLoading: boolean;
  loadError: string | null;
  saveState: SaveState;
  saveProblems: string[];
  lastSavedAt: number | null;
  /** Recording keys that already have audio the app can play. */
  recordings: Set<string>;
  /** Recordings saved in an old format the app cannot play — re-record these. */
  legacyRecordings: Set<string>;
  /** Bumped after every upload so <audio> elements refetch. */
  audioVersion: number;
  update: (recipe: (draft: ContentDocument) => ContentDocument, note?: string) => void;
  saveNow: () => Promise<void>;
  reload: () => Promise<void>;
  setDocument: (doc: ContentDocument, version: number) => void;
  saveRecording: (key: string, blob: Blob, durationMs: number) => Promise<void>;
  removeRecording: (key: string) => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

const AUTOSAVE_DELAY_MS = 1200;

export function StudioProvider({ children }: { children: ReactNode }): JSX.Element {
  const [document, setDocumentState] = useState<ContentDocument | null>(null);
  const [version, setVersion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveProblems, setSaveProblems] = useState<string[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Set<string>>(new Set());
  const [legacyRecordings, setLegacyRecordings] = useState<Set<string>>(new Set());
  const [audioVersion, setAudioVersion] = useState<number>(0);
  const hasHealedRef = useRef<boolean>(false);

  const pendingRef = useRef<{ doc: ContentDocument; note: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [envelope, index] = await Promise.all([fetchContent(), fetchRecordingIndex()]);
      setDocumentState(envelope.content);
      setVersion(envelope.version);
      setRecordings(index.playable);
      setLegacyRecordings(index.legacy);
      setLastSavedAt(envelope.updatedAt);
      setSaveState("idle");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load content";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flush = useCallback(async (): Promise<void> => {
    const pending = pendingRef.current;
    if (!pending || savingRef.current) return;

    savingRef.current = true;
    pendingRef.current = null;
    setSaveState("saving");

    try {
      const envelope = await saveContent(pending.doc, pending.note);
      setVersion(envelope.version);
      setLastSavedAt(envelope.updatedAt);
      setSaveProblems([]);
      setSaveState(pendingRef.current ? "dirty" : "saved");
    } catch (error) {
      if (error instanceof ApiError) {
        setSaveProblems(error.problems);
        setSaveState("error");
        toast.error(error.message, {
          description: error.problems[0] ?? "Fix the highlighted content and it will publish again.",
        });
      } else {
        setSaveState("error");
        toast.error("Could not publish that change");
      }
      // Keep the edit queued so the next save attempt retries it.
      pendingRef.current = pending;
    } finally {
      savingRef.current = false;
      if (pendingRef.current && saveState !== "error") {
        void flush();
      }
    }
    // `saveState` is intentionally read as a snapshot for the retry guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleSave = useCallback(
    (doc: ContentDocument, note: string): void => {
      pendingRef.current = { doc, note };
      setSaveState("dirty");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void flush();
      }, AUTOSAVE_DELAY_MS);
    },
    [flush],
  );

  const update = useCallback(
    (recipe: (draft: ContentDocument) => ContentDocument, note = "Saved from Studio"): void => {
      setDocumentState((current) => {
        if (!current) return current;
        const next = recipe(current);
        scheduleSave(next, note);
        return next;
      });
    },
    [scheduleSave],
  );

  const saveNow = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await flush();
  }, [flush]);

  const setDocument = useCallback((doc: ContentDocument, nextVersion: number): void => {
    setDocumentState(doc);
    setVersion(nextVersion);
    setSaveState("saved");
    setLastSavedAt(Date.now());
  }, []);

  const saveRecording = useCallback(
    async (key: string, blob: Blob, durationMs: number): Promise<void> => {
      // Browsers record WebM/Opus, which iOS cannot decode — always send WAV.
      const wav = await toWavBlob(blob);
      await uploadRecording(key, wav, durationMs);
      setRecordings((current) => new Set(current).add(key));
      setLegacyRecordings((current) => {
        if (!current.has(key)) return current;
        const next = new Set(current);
        next.delete(key);
        return next;
      });
      setAudioVersion((current) => current + 1);
    },
    [],
  );

  const removeRecording = useCallback(async (key: string): Promise<void> => {
    await deleteRecordingRequest(key);
    setRecordings((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    setLegacyRecordings((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    setAudioVersion((current) => current + 1);
  }, []);

  // A recording whose item lost its audio key would be silently ignored by the
  // app. Re-link them once, right after the first load.
  useEffect(() => {
    if (hasHealedRef.current || isLoading || !document) return;
    hasHealedRef.current = true;

    const healed = attachRecordedAudioKeys(document, recordings);
    if (healed !== document) {
      setDocumentState(healed);
      scheduleSave(healed, "Reconnected recordings");
    }
  }, [document, isLoading, recordings, scheduleSave]);

  // Warn before losing an edit that hasn't reached the backend yet.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent): void => {
      if (pendingRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({
      document,
      version,
      isLoading,
      loadError,
      saveState,
      saveProblems,
      lastSavedAt,
      recordings,
      legacyRecordings,
      audioVersion,
      update,
      saveNow,
      reload: load,
      setDocument,
      saveRecording,
      removeRecording,
    }),
    [
      document,
      version,
      isLoading,
      loadError,
      saveState,
      saveProblems,
      lastSavedAt,
      recordings,
      legacyRecordings,
      audioVersion,
      update,
      saveNow,
      load,
      setDocument,
      saveRecording,
      removeRecording,
    ],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside a StudioProvider");
  return context;
}
