import type { JSX } from "react";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, Plus, Trash2 } from "lucide-react";

import { WordTable } from "@/components/studio/WordTable";
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
import { newId, reorder, type StudioLesson, type StudioUnit, type StudioWord } from "@/lib/content";
import { cn } from "@/lib/utils";

interface LessonsPanelProps {
  needsAudioOnly: boolean;
}

/** The Learn path: units on the left, the selected lesson on the right. */
export function LessonsPanel({ needsAudioOnly }: LessonsPanelProps): JSX.Element {
  const { document, update, recordings } = useStudio();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragUnit, setDragUnit] = useState<number | null>(null);
  const [dragLesson, setDragLesson] = useState<{ unitId: string; index: number } | null>(null);

  const units = document?.units ?? [];

  const selected = useMemo(() => {
    for (const unit of units) {
      const lesson = unit.lessons.find((candidate) => candidate.id === selectedLessonId);
      if (lesson) return { unit, lesson };
    }
    const firstUnit = units[0];
    return firstUnit?.lessons[0] ? { unit: firstUnit, lesson: firstUnit.lessons[0] } : null;
  }, [selectedLessonId, units]);

  if (!document) return <></>;

  const patchUnit = (unitId: string, changes: Partial<StudioUnit>): void => {
    update(
      (draft) => ({
        ...draft,
        units: draft.units.map((unit) => (unit.id === unitId ? { ...unit, ...changes } : unit)),
      }),
      "Edited a unit",
    );
  };

  const patchLesson = (unitId: string, lessonId: string, changes: Partial<StudioLesson>): void => {
    update(
      (draft) => ({
        ...draft,
        units: draft.units.map((unit) =>
          unit.id === unitId
            ? {
                ...unit,
                lessons: unit.lessons.map((lesson) =>
                  lesson.id === lessonId ? { ...lesson, ...changes } : lesson,
                ),
              }
            : unit,
        ),
      }),
      "Edited a lesson",
    );
  };

  const addUnit = (): void => {
    const unit: StudioUnit = {
      id: newId("u"),
      index: units.length + 1,
      title: `Unit ${units.length + 1}`,
      lessons: [
        {
          id: newId("l"),
          title: "New lesson",
          subtitle: "",
          words: [{ id: newId("w"), english: "", dari: "", phonetic: "" }],
        },
      ],
    };
    update((draft) => ({ ...draft, units: [...draft.units, unit] }), "Added a unit");
    setSelectedLessonId(unit.lessons[0].id);
  };

  const addLesson = (unitId: string): void => {
    const lesson: StudioLesson = {
      id: newId("l"),
      title: "New lesson",
      subtitle: "",
      words: [{ id: newId("w"), english: "", dari: "", phonetic: "" }],
    };
    update(
      (draft) => ({
        ...draft,
        units: draft.units.map((unit) =>
          unit.id === unitId ? { ...unit, lessons: [...unit.lessons, lesson] } : unit,
        ),
      }),
      "Added a lesson",
    );
    setSelectedLessonId(lesson.id);
  };

  const deleteLesson = (unitId: string, lessonId: string): void => {
    update(
      (draft) => ({
        ...draft,
        units: draft.units.map((unit) =>
          unit.id === unitId
            ? { ...unit, lessons: unit.lessons.filter((lesson) => lesson.id !== lessonId) }
            : unit,
        ),
      }),
      "Deleted a lesson",
    );
    setSelectedLessonId(null);
  };

  const deleteUnit = (unitId: string): void => {
    update(
      (draft) => ({
        ...draft,
        units: draft.units
          .filter((unit) => unit.id !== unitId)
          .map((unit, position) => ({ ...unit, index: position + 1 })),
      }),
      "Deleted a unit",
    );
    setSelectedLessonId(null);
  };

  /** Copies a vocab set's words into the lesson, with fresh ids. */
  const importSet = (unitId: string, lessonId: string, setId: string): void => {
    const source = document.vocabSets.find((set) => set.id === setId);
    if (!source) return;
    const lesson = units.find((unit) => unit.id === unitId)?.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    const imported: StudioWord[] = source.words.map((word) => ({
      ...word,
      id: newId("w"),
      audioKey: word.audioKey,
    }));
    patchLesson(unitId, lessonId, { words: [...lesson.words, ...imported] });
  };

  const toggleCollapsed = (unitId: string): void => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Learn path
          </h2>
          <Button size="sm" variant="outline" onClick={addUnit} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Unit
          </Button>
        </div>

        <div className="space-y-2">
          {units.map((unit, unitIndex) => (
            <div
              key={unit.id}
              draggable
              onDragStart={() => setDragUnit(unitIndex)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragUnit === null) return;
                update(
                  (draft) => ({
                    ...draft,
                    units: reorder(draft.units, dragUnit, unitIndex).map((item, position) => ({
                      ...item,
                      index: position + 1,
                    })),
                  }),
                  "Reordered units",
                );
                setDragUnit(null);
              }}
              className="rounded-lg border bg-secondary/40"
            >
              <div className="flex items-center gap-1 px-2 py-2">
                <button
                  type="button"
                  onClick={() => toggleCollapsed(unit.id)}
                  className="text-muted-foreground"
                  title="Collapse unit"
                >
                  {collapsed.has(unit.id) ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <Input
                  value={unit.title}
                  onChange={(event) => patchUnit(unit.id, { title: event.target.value })}
                  className="h-8 border-transparent bg-transparent px-1 text-sm font-semibold focus-visible:bg-background"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteUnit(unit.id)}
                  title="Delete unit"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {!collapsed.has(unit.id) && (
                <div className="space-y-1 px-2 pb-2">
                  {unit.lessons.map((lesson, lessonIndex) => (
                    <button
                      key={lesson.id}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.stopPropagation();
                        setDragLesson({ unitId: unit.id, index: lessonIndex });
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.stopPropagation();
                        if (!dragLesson || dragLesson.unitId !== unit.id) return;
                        patchUnit(unit.id, {
                          lessons: reorder(unit.lessons, dragLesson.index, lessonIndex),
                        });
                        setDragLesson(null);
                      }}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
                        selected?.lesson.id === lesson.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-background",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {lesson.words.length}
                      </span>
                    </button>
                  ))}

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start gap-1.5 text-muted-foreground"
                    onClick={() => addLesson(unit.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add lesson
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {selected ? (
        <section className="space-y-5 rounded-xl border p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">Lesson title</Label>
              <Input
                id="lesson-title"
                value={selected.lesson.title}
                onChange={(event) =>
                  patchLesson(selected.unit.id, selected.lesson.id, { title: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-subtitle">Subtitle</Label>
              <Input
                id="lesson-subtitle"
                value={selected.lesson.subtitle}
                onChange={(event) =>
                  patchLesson(selected.unit.id, selected.lesson.id, { subtitle: event.target.value })
                }
                placeholder="Shown under the title in the app"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select onValueChange={(setId) => importSet(selected.unit.id, selected.lesson.id, setId)}>
              <SelectTrigger className="h-9 w-full sm:w-64">
                <span className="flex items-center gap-1.5 text-sm">
                  <Download className="h-4 w-4" />
                  <SelectValue placeholder="Pull words from a vocab set" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {document.vocabSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.emoji} {set.name} · {set.words.length}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <WordTable
            words={selected.lesson.words}
            onChange={(words) => patchLesson(selected.unit.id, selected.lesson.id, { words })}
            idPrefix={selected.lesson.id}
            recordings={recordings}
            needsAudioOnly={needsAudioOnly}
            actions={
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={() => deleteLesson(selected.unit.id, selected.lesson.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete lesson
              </Button>
            }
          />
        </section>
      ) : (
        <section className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Add a unit to start building the Learn path.
        </section>
      )}
    </div>
  );
}
