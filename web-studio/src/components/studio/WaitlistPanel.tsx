import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { Download, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fetchWaitlist, removeFromWaitlist, type WaitlistEntry } from "@/lib/api";

/** Human label for where a signup came from. */
const SOURCE_LABELS: Record<string, string> = {
  "home-hero": "Homepage hero",
  "home-footer": "Homepage footer",
  "lesson-complete": "After a lesson",
  about: "About page",
};

function formatSource(source: string): string {
  return SOURCE_LABELS[source] ?? source ?? "Unknown";
}

/** Everyone waiting for the iPhone launch, with a CSV export. */
export function WaitlistPanel(): JSX.Element {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setEntries(await fetchWaitlist());
    } catch {
      setError("Couldn't load the waitlist. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(
    async (email: string): Promise<void> => {
      try {
        await removeFromWaitlist(email);
        setEntries((current) => current.filter((entry) => entry.email !== email));
        toast.success("Removed from the waitlist");
      } catch {
        toast.error("Couldn't remove that address");
      }
    },
    [],
  );

  const exportCsv = useCallback((): void => {
    const rows = [
      ["email", "source", "signed_up"],
      ...entries.map((entry) => [
        entry.email,
        entry.source,
        new Date(entry.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `learndari-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const bySource = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      counts.set(entry.source, (counts.get(entry.source) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">App waitlist</h1>
          <p className="mt-1 text-muted-foreground">
            Everyone who asked to hear when the iPhone app launches.
          </p>
        </div>

        <Button onClick={exportCsv} disabled={entries.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total signups</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{entries.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 sm:col-span-2">
          <p className="text-sm text-muted-foreground">Where they came from</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {bySource.length === 0 ? (
              <span className="text-sm text-muted-foreground">Nothing yet</span>
            ) : (
              bySource.map(([source, count]) => (
                <span
                  key={source}
                  className="rounded-full bg-secondary px-3 py-1 text-sm"
                >
                  {formatSource(source)} · {count}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading signups…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No signups yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            They'll appear here as people join from the website.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Source</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Signed up</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((entry) => (
                <tr key={entry.email} className="bg-card">
                  <td className="px-4 py-3 font-medium">{entry.email}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatSource(entry.source)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => void remove(entry.email)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
