import { useEffect, useRef } from "react";

import { getAccessToken, useAuth } from "@/hooks/useAuth";
import {
  emptyProgress,
  useProgress,
  type ProgressState,
  type VocabProgress,
} from "@/hooks/useProgress";
import { fetchAccountProgress, saveAccountProgress } from "@/lib/publicApi";

const PUSH_DEBOUNCE_MS = 1500;

/**
 * Merges two progress records without losing anything.
 *
 * Someone may have practised on their phone and in a browser since the last
 * sync, so this takes the best of both rather than picking a winner: lessons
 * are unioned, counters take the higher value, and each word keeps whichever
 * record was touched most recently.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const vocab: Record<string, VocabProgress> = { ...a.vocab };
  for (const [wordId, record] of Object.entries(b.vocab)) {
    const existing = vocab[wordId];
    if (!existing || record.lastSeenAt > existing.lastSeenAt) {
      vocab[wordId] = record;
    }
  }

  return {
    completedLessonIds: [...new Set([...a.completedLessonIds, ...b.completedLessonIds])],
    xp: Math.max(a.xp, b.xp),
    streak: Math.max(a.streak, b.streak),
    lastActiveDate: a.lastActiveDate > b.lastActiveDate ? a.lastActiveDate : b.lastActiveDate,
    vocab,
  };
}

function hasAnyProgress(state: ProgressState): boolean {
  return (
    state.xp > 0 ||
    state.completedLessonIds.length > 0 ||
    Object.keys(state.vocab).length > 0
  );
}

/**
 * Keeps browser progress and account progress in step.
 *
 * On sign-in it folds whatever was done as a guest into the account, so trying
 * the site before making an account never costs the learner their work.
 */
export function useProgressSync(): void {
  const { user } = useAuth();
  const progress = useProgress();

  const hasPulledFor = useRef<string | null>(null);
  const pushTimer = useRef<number | null>(null);
  const lastPushed = useRef<string>("");

  // Pull once per signed-in user, merging in anything done as a guest.
  useEffect(() => {
    if (!user) {
      hasPulledFor.current = null;
      return;
    }
    if (hasPulledFor.current === user.id) return;
    hasPulledFor.current = user.id;

    const token = getAccessToken();
    if (!token) return;

    const pull = async (): Promise<void> => {
      try {
        const remote = await fetchAccountProgress<ProgressState>(token);
        const local = progress.state;
        const merged = remote ? mergeProgress(local, { ...emptyProgress, ...remote }) : local;

        progress.replace(merged);
        lastPushed.current = JSON.stringify(merged);

        // Push straight back when the guest session added anything new.
        if (!remote || JSON.stringify(remote) !== lastPushed.current) {
          if (hasAnyProgress(merged)) await saveAccountProgress(token, merged);
        }
      } catch {
        // Offline or a transient failure: local progress still works, and the
        // next change will try again.
      }
    };

    void pull();
  }, [user, progress]);

  // Push changes, debounced so a burst of answers is one request.
  useEffect(() => {
    if (!user || hasPulledFor.current !== user.id) return;

    const token = getAccessToken();
    if (!token) return;

    const serialised = JSON.stringify(progress.state);
    if (serialised === lastPushed.current) return;

    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      lastPushed.current = serialised;
      void saveAccountProgress(token, progress.state).catch(() => {
        // Let the next change retry rather than surfacing a sync error.
        lastPushed.current = "";
      });
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [user, progress.state]);
}
