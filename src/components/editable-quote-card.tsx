import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { TagsInput } from "./tags-input";
import { Globe, Lock, BookOpen, User } from "lucide-react";
import type { BookResult } from "./book-search";

export interface QuoteMetadata {
  text: string;
  chapter: string;
  isPublic: boolean;
  tags: string[];
}

interface EditableQuoteCardProps {
  metadata: QuoteMetadata;
  index: number;
  onUpdate: (index: number, metadata: QuoteMetadata) => void;
  selectedBook?: BookResult | null;
}

export const EditableQuoteCard = ({
  metadata,
  index,
  onUpdate,
  selectedBook,
}: EditableQuoteCardProps) => {
  const updateField = <K extends keyof QuoteMetadata>(
    field: K,
    value: QuoteMetadata[K],
  ) => {
    onUpdate(index, { ...metadata, [field]: value });
  };

  return (
    <div className="bg-background-elevated border border-background-muted rounded-xl p-5 hover:border-primary transition-colors flex flex-col gap-3">
      {/* Quote text — editable textarea styled to look like the final blockquote */}
      <Textarea
        value={metadata.text}
        onChange={(e) => updateField("text", e.target.value)}
        className="min-h-[100px] focus:min-h-[250px] transition-all duration-300 resize-none text-sm italic leading-relaxed bg-transparent border-none shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:not-italic"
        placeholder="Quote text..."
      />

      {/* Book & Chapter info — mirrors the final card layout */}
      <div className="flex flex-col gap-2 text-sm text-foreground-muted border-t border-background-muted pt-3">
        {selectedBook ? (
          <>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary flex-shrink-0" />
              <span className="truncate">
                {selectedBook.title}
                {metadata.chapter ? `, ${metadata.chapter}` : ""}
              </span>
            </div>
            {selectedBook.authorName && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-accent flex-shrink-0" />
                <span className="truncate">{selectedBook.authorName}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-foreground-subtle">
            <BookOpen size={16} className="flex-shrink-0" />
            <span className="text-xs italic">No book selected</span>
          </div>
        )}
      </div>

      {/* Editable metadata fields */}
      <div className="border-t border-background-muted pt-3 space-y-3">
        {/* Chapter */}
        <div className="space-y-1">
          <Label
            htmlFor={`chapter-${index}`}
            className="text-xs text-foreground-subtle"
          >
            Chapter / Page
          </Label>
          <Input
            id={`chapter-${index}`}
            value={metadata.chapter}
            onChange={(e) => updateField("chapter", e.target.value)}
            placeholder="e.g. Chapter 3, p. 42"
            className="h-8 text-sm bg-background-muted border-background-muted"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <Label className="text-xs text-foreground-subtle">Tags</Label>
          <TagsInput
            value={metadata.tags}
            onChange={(tags) => updateField("tags", tags)}
            placeholder="Add tags, separated by comma..."
          />
        </div>

        {/* Visibility toggle — styled like the final card footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Switch
              id={`public-${index}`}
              checked={metadata.isPublic}
              onCheckedChange={(checked) => updateField("isPublic", checked)}
            />
            <Label
              htmlFor={`public-${index}`}
              className="text-xs text-foreground-subtle flex items-center gap-1.5 cursor-pointer"
            >
              {metadata.isPublic ? (
                <>
                  <Globe size={14} className="text-success" />
                  Public
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Private
                </>
              )}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
