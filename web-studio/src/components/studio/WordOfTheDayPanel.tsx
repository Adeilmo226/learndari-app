import type { JSX } from "react";
import { useMemo, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudio } from "@/hooks/useStudio";
import { allWords, todayISO, type StudioWord } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Schedules which word appears on which day. Unscheduled days rotate automatically. */
export function WordOfTheDayPanel(): JSX.Element {
  const { document, update } = useStudio();
  const [date, setDate] = useState<string>(todayISO());
  const [wordId, setWordId] = useState<string>("");

  const words = useMemo(() => (document ? allWords(document) : []), [document]);

  const schedule = useMemo(() => {
    const entries = document?.wordOfTheDaySchedule ?? [];
    return [...entries].sort((a, b) => a.date.localeCompare(b.date));
  }, [document]);

  if (!document) return <></>;

  const pin = (): void => {
    const word = words.find((candidate) => candidate.id === wordId);
    if (!word || !date) return;
    update(
      (draft) => ({
        ...draft,
        wordOfTheDaySchedule: [
          ...draft.wordOfTheDaySchedule.filter((entry) => entry.date !== date),
          { date, word },
        ],
      }),
      `Scheduled Word of the Day for ${date}`,
    );
    setWordId("");
  };

  const unpin = (target: string): void => {
    update(
      (draft) => ({
        ...draft,
        wordOfTheDaySchedule: draft.wordOfTheDaySchedule.filter((entry) => entry.date !== target),
      }),
      "Unscheduled a Word of the Day",
    );
  };

  const today = todayISO();
  const todaysEntry = schedule.find((entry) => entry.date === today);

  const label = (word: StudioWord): string =>
    `${word.english} · ${word.dari}${word.phonetic ? ` · ${word.phonetic}` : ""}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="rounded-xl border p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Schedule a word
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="wotd-date">Date</Label>
              <Input
                id="wotd-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Word</Label>
              <Select value={wordId} onValueChange={setWordId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick any word in your library" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {words.map((word) => (
                    <SelectItem key={word.id} value={word.id}>
                      {label(word)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={pin} disabled={!wordId || !date}>
              Pin to date
            </Button>
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-5 py-3 text-sm font-semibold">
            Scheduled days
            <span className="ml-2 text-muted-foreground tabular-nums">{schedule.length}</span>
          </div>

          {schedule.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Nothing scheduled. The app rotates through your vocabulary automatically.
            </p>
          ) : (
            <ul className="divide-y">
              {schedule.map((entry) => (
                <li
                  key={entry.date}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3",
                    entry.date === today && "bg-accent/60",
                    entry.date < today && "opacity-60",
                  )}
                >
                  <span className="w-28 text-sm font-medium tabular-nums">{entry.date}</span>
                  <span className="flex-1 text-sm">{entry.word.english}</span>
                  <span className="dari flex-1 text-sm">{entry.word.dari}</span>
                  <span className="hidden flex-1 text-sm italic text-muted-foreground sm:block">
                    {entry.word.phonetic}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => unpin(entry.date)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Today in the app
        </h2>
        <div className="brand-gradient rounded-2xl p-5 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-90">
            Word of the day
          </p>
          <div className="mt-4 space-y-2 rounded-xl bg-white/15 p-4">
            <p className="text-2xl font-bold">{todaysEntry?.word.english ?? "Automatic pick"}</p>
            <p className="dari text-xl">{todaysEntry?.word.dari ?? "—"}</p>
            <p className="text-sm italic opacity-90">{todaysEntry?.word.phonetic ?? ""}</p>
          </div>
          <p className="mt-3 text-xs opacity-90">
            {todaysEntry
              ? "Pinned by you."
              : "No word pinned for today — the app rotates through your vocabulary."}
          </p>
        </div>
      </aside>
    </div>
  );
}
