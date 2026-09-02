import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fetchHistory, rollback } from "@/lib/api";
import type { HistoryEntry } from "@/lib/content";
import { useStudio } from "@/hooks/useStudio";

/** Every published version, with one-click restore. */
export function HistoryPanel(): JSX.Element {
  const { version, setDocument, lastSavedAt } = useStudio();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const result = await fetchHistory();
      setEntries(result.versions);
    } catch {
      toast.error("Could not load the version history");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, lastSavedAt]);

  const restore = async (target: number): Promise<void> => {
    setIsBusy(true);
    try {
      const envelope = await rollback(target);
      setDocument(envelope.content, envelope.version);
      toast.success(`Restored version ${target}`);
      await load();
    } catch {
      toast.error("Could not restore that version");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <History className="h-4 w-4" />
        Every save is kept. Restoring publishes that version again as a new save, so nothing is lost.
      </div>

      <div className="overflow-hidden rounded-xl border">
        <ul className="divide-y">
          {entries.map((entry) => (
            <li key={entry.version} className="flex items-center gap-4 px-5 py-3">
              <span className="w-16 text-sm font-semibold tabular-nums">v{entry.version}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{entry.note || "Saved"}</span>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
              {entry.version === version ? (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  Live
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => void restore(entry.version)}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
              )}
            </li>
          ))}

          {entries.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">No saves yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
