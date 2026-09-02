import type { JSX } from "react";
import { useMemo, useState } from "react";
import { ClipboardPaste } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { parseBulkWords, type StudioWord } from "@/lib/content";

interface BulkPasteDialogProps {
  idPrefix: string;
  onImport: (words: StudioWord[]) => void;
}

const EXAMPLE = `Hello / سلام / salaam
Thank you / تشکر / tashakor
Water / آب / aab`;

/** Fast entry: paste many rows at once instead of filling one form per word. */
export function BulkPasteDialog({ idPrefix, onImport }: BulkPasteDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const parsed = useMemo(() => parseBulkWords(text, idPrefix), [text, idPrefix]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <ClipboardPaste className="h-4 w-4" />
          Paste many
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paste a batch of words</DialogTitle>
          <DialogDescription>
            One word per line: English, then Dari, then the phonetic spelling. Separate them with a
            slash, comma or tab. Rows without Dari are skipped.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={EXAMPLE}
          rows={10}
          className="font-mono text-sm"
        />

        {parsed.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
              <tbody>
                {parsed.slice(0, 25).map((word) => (
                  <tr key={word.id} className="border-b last:border-0">
                    <td className="px-3 py-1.5">{word.english}</td>
                    <td className="dari px-3 py-1.5">{word.dari}</td>
                    <td className="px-3 py-1.5 italic text-muted-foreground">{word.phonetic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {parsed.length} {parsed.length === 1 ? "word" : "words"} ready
          </span>
          <Button
            type="button"
            disabled={parsed.length === 0}
            onClick={() => {
              onImport(parsed);
              setText("");
              setIsOpen(false);
            }}
          >
            Add {parsed.length > 0 ? parsed.length : ""} words
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
