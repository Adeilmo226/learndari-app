import type { JSX } from "react";
import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";

import { WordTable } from "@/components/studio/WordTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/hooks/useStudio";
import { newId, reorder, type StudioVocabSet, type StudioWord } from "@/lib/content";
import { cn } from "@/lib/utils";

interface VocabPanelProps {
  needsAudioOnly: boolean;
}

/** Vocab sets: pick one on the left, edit it on the right. */
export function VocabPanel({ needsAudioOnly }: VocabPanelProps): JSX.Element {
  const { document, update, recordings } = useStudio();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!document) return <></>;

  const sets = document.vocabSets;
  const selected = sets.find((set) => set.id === selectedId) ?? sets[0] ?? null;

  const patchSet = (id: string, changes: Partial<StudioVocabSet>): void => {
    update(
      (draft) => ({
        ...draft,
        vocabSets: draft.vocabSets.map((set) => (set.id === id ? { ...set, ...changes } : set)),
      }),
      `Edited set ${changes.name ?? id}`,
    );
  };

  const addSet = (): void => {
    const set: StudioVocabSet = {
      id: newId("set"),
      emoji: "📘",
      name: "New set",
      summary: "",
      words: [{ id: newId("w"), english: "", dari: "", phonetic: "" }],
    };
    update((draft) => ({ ...draft, vocabSets: [...draft.vocabSets, set] }), "Added a vocab set");
    setSelectedId(set.id);
  };

  const duplicateSet = (source: StudioVocabSet): void => {
    const copy: StudioVocabSet = {
      ...source,
      id: newId("set"),
      name: `${source.name} copy`,
      // New ids so the copy gets its own recordings rather than sharing them.
      words: source.words.map((word) => ({ ...word, id: newId("w"), audioKey: undefined })),
    };
    update((draft) => ({ ...draft, vocabSets: [...draft.vocabSets, copy] }), "Duplicated a set");
    setSelectedId(copy.id);
  };

  const deleteSet = (id: string): void => {
    update(
      (draft) => ({ ...draft, vocabSets: draft.vocabSets.filter((set) => set.id !== id) }),
      "Deleted a vocab set",
    );
    setSelectedId(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sets
          </h2>
          <Button size="sm" variant="outline" onClick={addSet} className="gap-1.5">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        <div className="space-y-1">
          {sets.map((set, index) => (
            <button
              key={set.id}
              type="button"
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex === null) return;
                update(
                  (draft) => ({ ...draft, vocabSets: reorder(draft.vocabSets, dragIndex, index) }),
                  "Reordered vocab sets",
                );
                setDragIndex(null);
              }}
              onClick={() => setSelectedId(set.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition",
                selected?.id === set.id
                  ? "border-primary/40 bg-accent"
                  : "border-transparent bg-secondary/50 hover:bg-secondary",
              )}
            >
              <span className="text-xl">{set.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{set.name}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {set.words.length} words
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {selected ? (
        <section className="space-y-5 rounded-xl border p-5">
          <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="set-emoji">Emoji</Label>
              <Input
                id="set-emoji"
                value={selected.emoji}
                onChange={(event) => patchSet(selected.id, { emoji: event.target.value })}
                className="text-center text-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="set-name">Name</Label>
              <Input
                id="set-name"
                value={selected.name}
                onChange={(event) => patchSet(selected.id, { name: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="set-summary">Summary</Label>
            <Input
              id="set-summary"
              value={selected.summary}
              onChange={(event) => patchSet(selected.id, { summary: event.target.value })}
              placeholder="One line shown under the set name"
            />
          </div>

          <WordTable
            words={selected.words}
            onChange={(words: StudioWord[]) => patchSet(selected.id, { words })}
            idPrefix={selected.id}
            recordings={recordings}
            needsAudioOnly={needsAudioOnly}
            actions={
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => duplicateSet(selected)}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate set
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteSet(selected.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete set
                </Button>
              </>
            }
          />
        </section>
      ) : (
        <section className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Create your first vocab set to get started.
        </section>
      )}
    </div>
  );
}
