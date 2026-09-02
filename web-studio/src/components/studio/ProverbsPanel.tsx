import type { JSX } from "react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AudioCell } from "@/components/studio/AudioCell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudio } from "@/hooks/useStudio";
import { audioKeyFor, newId, reorder, type StudioProverb } from "@/lib/content";
import { cn } from "@/lib/utils";

interface ProverbsPanelProps {
  needsAudioOnly: boolean;
}

/** Afghan proverbs — one card per proverb, each with its own recording. */
export function ProverbsPanel({ needsAudioOnly }: ProverbsPanelProps): JSX.Element {
  const { document, update, recordings } = useStudio();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!document) return <></>;

  const patch = (id: string, changes: Partial<StudioProverb>): void => {
    update(
      (draft) => ({
        ...draft,
        proverbs: draft.proverbs.map((proverb) =>
          proverb.id === id ? { ...proverb, ...changes } : proverb,
        ),
      }),
      "Edited a proverb",
    );
  };

  const add = (): void => {
    const proverb: StudioProverb = {
      id: newId("p"),
      english: "",
      dari: "",
      phonetic: "",
      meaning: "",
      category: "Wisdom",
    };
    update((draft) => ({ ...draft, proverbs: [proverb, ...draft.proverbs] }), "Added a proverb");
  };

  const remove = (id: string): void => {
    update(
      (draft) => ({ ...draft, proverbs: draft.proverbs.filter((proverb) => proverb.id !== id) }),
      "Deleted a proverb",
    );
  };

  const visible = document.proverbs
    .map((proverb, index) => ({ proverb, index }))
    .filter(
      ({ proverb }) => !needsAudioOnly || !(proverb.audioKey && recordings.has(proverb.audioKey)),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tabular-nums">
          {document.proverbs.length} proverbs
        </p>
        <Button size="sm" onClick={add} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New proverb
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visible.map(({ proverb, index }) => (
          <article
            key={proverb.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null) return;
              update(
                (draft) => ({ ...draft, proverbs: reorder(draft.proverbs, dragIndex, index) }),
                "Reordered proverbs",
              );
              setDragIndex(null);
            }}
            className={cn("space-y-3 rounded-xl border p-4", dragIndex === index && "opacity-50")}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>Dari</Label>
                <Input
                  value={proverb.dari}
                  onChange={(event) => patch(proverb.id, { dari: event.target.value })}
                  className="dari"
                  placeholder="نیکی کن و در دریا انداز"
                />
              </div>
              <div className="pt-7">
                <AudioCell
                  audioKey={proverb.audioKey ?? audioKeyFor(proverb.id)}
                  onRecorded={(key) => patch(proverb.id, { audioKey: key })}
                  onCleared={() => patch(proverb.id, { audioKey: undefined })}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Phonetic</Label>
                <Input
                  value={proverb.phonetic}
                  onChange={(event) => patch(proverb.id, { phonetic: event.target.value })}
                  className="italic"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={proverb.category}
                  onChange={(event) => patch(proverb.id, { category: event.target.value })}
                  placeholder="Kindness"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Translation</Label>
              <Input
                value={proverb.english}
                onChange={(event) => patch(proverb.id, { english: event.target.value })}
                placeholder="Do good and throw it into the river"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Meaning</Label>
              <Textarea
                value={proverb.meaning}
                onChange={(event) => patch(proverb.id, { meaning: event.target.value })}
                rows={2}
                placeholder="What it teaches, in plain English"
              />
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={() => remove(proverb.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {needsAudioOnly ? "Every proverb has a recording." : "No proverbs yet."}
        </p>
      )}
    </div>
  );
}
