import type { JSX } from "react";
import { useMemo } from "react";
import { BookOpen, Layers, Mic, MicOff, Quote, Route, Type } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useStudio } from "@/hooks/useStudio";
import { contentStats } from "@/lib/content";

const LESSON_GOAL = 100;
const SET_GOAL = 30;

/** At-a-glance progress toward the launch content targets. */
export function DashboardPanel(): JSX.Element {
  const { document, recordings } = useStudio();

  const stats = useMemo(
    () => (document ? contentStats(document, recordings) : null),
    [document, recordings],
  );

  if (!stats) return <></>;

  const tiles = [
    { label: "Lessons", value: stats.lessons, icon: Route },
    { label: "Units", value: stats.units, icon: Layers },
    { label: "Vocab sets", value: stats.vocabSets, icon: BookOpen },
    { label: "Words", value: stats.words, icon: Type },
    { label: "Proverbs", value: stats.proverbs, icon: Quote },
    { label: "Recorded", value: stats.recorded, icon: Mic },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border p-4">
            <tile.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-3xl font-bold tabular-nums">{tile.value}</p>
            <p className="text-sm text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Launch targets
          </h2>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span>Lessons</span>
              <span className="text-muted-foreground tabular-nums">
                {stats.lessons} / {LESSON_GOAL}
              </span>
            </div>
            <Progress value={Math.min(100, (stats.lessons / LESSON_GOAL) * 100)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span>Vocab sets</span>
              <span className="text-muted-foreground tabular-nums">
                {stats.vocabSets} / {SET_GOAL}
              </span>
            </div>
            <Progress value={Math.min(100, (stats.vocabSets / SET_GOAL) * 100)} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your voice
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              {stats.missingAudio > 0 ? (
                <MicOff className="h-6 w-6 text-primary" />
              ) : (
                <Mic className="h-6 w-6 text-[hsl(var(--brand-green))]" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.missingAudio}</p>
              <p className="text-sm text-muted-foreground">
                {stats.missingAudio === 1 ? "item still needs" : "items still need"} a recording
              </p>
            </div>
          </div>

          <Progress
            value={
              stats.recorded + stats.missingAudio > 0
                ? (stats.recorded / (stats.recorded + stats.missingAudio)) * 100
                : 0
            }
          />

          <p className="text-sm text-muted-foreground">
            Turn on <span className="font-medium text-foreground">Needs audio</span> in the header to
            hide everything you have already recorded, then work down the list.
          </p>
        </section>
      </div>
    </div>
  );
}
