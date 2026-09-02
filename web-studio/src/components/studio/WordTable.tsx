import type { JSX } from "react";
import { memo, useCallback, useState } from "react";
import { GripVertical, MessageSquareQuote, Plus, Trash2 } from "lucide-react";

import { AudioCell } from "@/components/studio/AudioCell";
import { BulkPasteDialog } from "@/components/studio/BulkPasteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { audioKeyFor, emptyWord, reorder, type StudioWord } from "@/lib/content";
import { cn } from "@/lib/utils";

interface WordTableProps {
  words: StudioWord[];
  onChange: (words: StudioWord[]) => void;
  idPrefix: string;
  /** Optional extra action rendered next to "Add word". */
  actions?: React.ReactNode;
  needsAudioOnly?: boolean;
  recordings: Set<string>;
}

/**
 * The editing grid used for vocab sets, lessons and word lists.
 * Rows are drag-reorderable and every row carries its own record button.
 */
function WordTableComponent({
  words,
  onChange,
  idPrefix,
  actions,
  needsAudioOnly = false,
  recordings,
}: WordTableProps): JSX.Element {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExample = useCallback((id: string): void => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const patch = useCallback(
    (index: number, field: keyof StudioWord, value: string): void => {
      const next = words.map((word, position) =>
        position === index ? { ...word, [field]: value } : word,
      );
      onChange(next);
    },
    [onChange, words],
  );

  const remove = useCallback(
    (index: number): void => {
      onChange(words.filter((_, position) => position !== index));
    },
    [onChange, words],
  );

  const add = useCallback((): void => {
    onChange([...words, emptyWord(idPrefix)]);
  }, [idPrefix, onChange, words]);

  const handleDrop = useCallback(
    (target: number): void => {
      if (dragIndex === null) return;
      onChange(reorder(words, dragIndex, target));
      setDragIndex(null);
      setOverIndex(null);
    },
    [dragIndex, onChange, words],
  );

  const visible = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => !needsAudioOnly || !(word.audioKey && recordings.has(word.audioKey)));

  return (
    <div className="space-y-3">
      <div className="hidden gap-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[24px_1fr_1fr_1fr_auto]">
        <span />
        <span>English</span>
        <span>Dari</span>
        <span>Phonetic</span>
        <span className="pr-2 text-right">Audio</span>
      </div>

      <div className="space-y-2">
        {visible.map(({ word, index }) => (
          <div
            key={word.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => {
              event.preventDefault();
              setOverIndex(index);
            }}
            onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              "space-y-2 rounded-lg border border-transparent bg-secondary/40 p-2",
              overIndex === index && dragIndex !== null && dragIndex !== index && "drag-over",
              dragIndex === index && "opacity-50",
            )}
          >
            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[24px_1fr_1fr_1fr_auto]">
              <GripVertical className="hidden h-4 w-4 cursor-grab text-muted-foreground sm:block" />

              <Input
                value={word.english}
                onChange={(event) => patch(index, "english", event.target.value)}
                placeholder="English"
                className="bg-background"
              />
              <Input
                value={word.dari}
                onChange={(event) => patch(index, "dari", event.target.value)}
                placeholder="دری"
                className="dari bg-background"
              />
              <Input
                value={word.phonetic}
                onChange={(event) => patch(index, "phonetic", event.target.value)}
                placeholder="phonetic"
                className="bg-background italic"
              />

              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleExample(word.id)}
                  className={cn(
                    "h-9 w-9",
                    word.exampleDari
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Example sentence"
                >
                  <MessageSquareQuote className="h-4 w-4" />
                </Button>
                <AudioCell
                  audioKey={word.audioKey ?? audioKeyFor(word.id)}
                  onRecorded={(key) => patch(index, "audioKey", key)}
                  onCleared={() => patch(index, "audioKey", "")}
                  compact
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  title="Delete word"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedIds.has(word.id) && (
              <div className="grid gap-2 border-t pt-2 sm:grid-cols-2 sm:pl-8">
                <Input
                  value={word.exampleDari ?? ""}
                  onChange={(event) => patch(index, "exampleDari", event.target.value)}
                  placeholder="Example sentence in Dari"
                  className="dari bg-background"
                />
                <Input
                  value={word.exampleEnglish ?? ""}
                  onChange={(event) => patch(index, "exampleEnglish", event.target.value)}
                  placeholder="Its English translation"
                  className="bg-background"
                />
              </div>
            )}
          </div>
        ))}

        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {needsAudioOnly ? "Every word here has a recording." : "No words yet."}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add word
        </Button>
        <BulkPasteDialog
          idPrefix={idPrefix}
          onImport={(imported) => onChange([...words, ...imported])}
        />
        {actions}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {words.length} {words.length === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}

export const WordTable = memo(WordTableComponent);
