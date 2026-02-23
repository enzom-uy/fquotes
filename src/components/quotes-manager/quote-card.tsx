import {
  Trash2,
  Pencil,
  Loader2,
  Check,
  Globe,
  Lock,
  BookOpen,
  User,
  Calendar,
  Star,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookSearch, type BookResult } from "@/components/capture/book-search";
import { TagsInput } from "@/components/tags-input";
import { type QuoteData } from "./types";
import { highlightMatches, formatDate } from "./utils";

interface QuoteCardProps {
  quote: QuoteData;
  highlightQuery: string;
  bulkMode: boolean;
  selectedIds: Set<string>;
  editingQuoteId: string | null;
  editedFields: {
    text: string;
    chapter: string;
    isPublic: boolean;
    tags: string[];
    selectedBook: BookResult | null;
  } | null;
  isUpdatePending: boolean;
  onToggleSelection: (quoteId: string) => void;
  onStartEdit: (quote: QuoteData) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onSetEditedFields: React.Dispatch<
    React.SetStateAction<{
      text: string;
      chapter: string;
      isPublic: boolean;
      tags: string[];
      selectedBook: BookResult | null;
    } | null>
  >;
  onDeleteSingle: (quoteId: string) => void;
  onToggleFavorite: (quoteId: string, isFavorite: boolean) => void;
  isTogglingFavorite: boolean;
  canAddFavorite: boolean;
}

export function QuoteCard({
  quote,
  highlightQuery,
  bulkMode,
  selectedIds,
  editingQuoteId,
  editedFields,
  isUpdatePending,
  onToggleSelection,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSetEditedFields,
  onDeleteSingle,
  onToggleFavorite,
  isTogglingFavorite,
  canAddFavorite,
}: QuoteCardProps) {
  const isEditing = editingQuoteId === quote.id;
  const isFavorite = quote.isFavorite;
  const isFavoriteDisabled = !isFavorite && !canAddFavorite;

  return (
    <div
      onClick={bulkMode ? () => onToggleSelection(quote.id) : undefined}
      className={`bg-background-elevated border rounded-lg p-6 transition-colors flex flex-col gap-4 ${
        bulkMode ? "cursor-pointer" : ""
      } ${
        bulkMode && selectedIds.has(quote.id)
          ? "border-danger bg-danger/5"
          : "border-background-muted hover:border-primary"
      }`}
    >
      {/* Bulk-mode checkbox + Quote Text */}
      <div className="flex gap-3">
        {bulkMode && (
          <div className="flex-shrink-0 pt-1">
            <Checkbox
              checked={selectedIds.has(quote.id)}
              onCheckedChange={() => onToggleSelection(quote.id)}
            />
          </div>
        )}

        {isEditing && editedFields ? (
          <div className="flex-1 space-y-4">
            <Textarea
              value={editedFields.text}
              onChange={(e) =>
                onSetEditedFields({ ...editedFields, text: e.target.value })
              }
              className="min-h-[100px] focus:min-h-[250px] transition-all duration-300 resize-none text-sm italic leading-relaxed bg-transparent border border-border rounded-lg p-3 focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Quote text..."
            />

            <div className="space-y-2">
              <Label className="text-xs text-foreground-subtle">Book</Label>
              <BookSearch
                selectedBook={editedFields.selectedBook}
                onSelect={(book) =>
                  onSetEditedFields({ ...editedFields, selectedBook: book })
                }
                onClear={() =>
                  onSetEditedFields({ ...editedFields, selectedBook: null })
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-foreground-subtle">
                Chapter / Page
              </Label>
              <Input
                value={editedFields.chapter}
                onChange={(e) =>
                  onSetEditedFields({
                    ...editedFields,
                    chapter: e.target.value,
                  })
                }
                placeholder="e.g. Chapter 3, p. 42"
                className="h-8 text-sm bg-background-muted border-background-muted"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-foreground-subtle">Tags</Label>
              <TagsInput
                value={editedFields.tags}
                onChange={(tags) =>
                  onSetEditedFields({ ...editedFields, tags })
                }
                placeholder="Add tags, separated by comma..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editedFields.isPublic}
                onCheckedChange={(checked) =>
                  onSetEditedFields({ ...editedFields, isPublic: checked })
                }
              />
              <Label className="text-xs text-foreground-subtle flex items-center gap-1.5 cursor-pointer">
                {editedFields.isPublic ? (
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
        ) : (
          <blockquote className="text-foreground leading-relaxed flex-1">
            &ldquo;{highlightMatches(quote.text, highlightQuery)}&rdquo;
          </blockquote>
        )}
      </div>

      {/* Book & Author Info - hidden when editing */}
      {!isEditing && quote.book && (
        <div className="flex flex-col gap-2 text-sm text-foreground-muted border-t border-background-muted pt-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary flex-shrink-0" />
            <span className="truncate">
              {highlightMatches(quote.book.title, highlightQuery)}
              {quote.chapter ? (
                <>, {highlightMatches(quote.chapter, highlightQuery)}</>
              ) : (
                ""
              )}
            </span>
          </div>
          {quote.book.authorName && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-accent flex-shrink-0" />
              <span className="truncate">
                {highlightMatches(quote.book.authorName, highlightQuery)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer with Date and Actions */}
      {isEditing && editedFields ? (
        <div className="flex items-center justify-end gap-2 mt-auto border-t border-background-muted pt-4">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1.5 text-sm text-foreground-muted hover:text-foreground rounded-lg transition-colors"
            disabled={isUpdatePending}
          >
            Cancel
          </button>
          <button
            onClick={onSaveEdit}
            disabled={isUpdatePending}
            className="px-3 py-1.5 text-sm font-medium bg-primary text-background rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {isUpdatePending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={14} />
                Save
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-auto border-t border-background-muted pt-4">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Calendar size={14} />
            <span>{formatDate(quote.createdAt)}</span>
          </div>

          {!bulkMode && (
            <div className="flex items-center gap-2">
              {/* Favorite toggle - Star icon */}
              <button
                onClick={() => onToggleFavorite(quote.id, !isFavorite)}
                disabled={isTogglingFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavoriteDisabled
                    ? "opacity-30 cursor-not-allowed"
                    : "text-foreground-muted hover:text-warning hover:bg-warning/10"
                }`}
                title={
                  isFavorite
                    ? "Remove from favorites"
                    : isFavoriteDisabled
                    ? "Maximum favorites reached"
                    : "Add to favorites"
                }
              >
                {isTogglingFavorite ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Star
                    size={16}
                    fill={isFavorite ? "currentColor" : "none"}
                    className={isFavorite ? "text-warning" : ""}
                  />
                )}
              </button>
              <button
                onClick={() => onStartEdit(quote)}
                className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Edit quote"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDeleteSingle(quote.id)}
                className="p-2 text-danger hover:text-danger hover:bg-primary/10 rounded-lg transition-colors"
                title="Delete quote"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags - hidden when editing */}
      {!isEditing && quote.tags && quote.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-background-muted pt-3">
          {quote.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-foreground-subtle bg-background-muted px-2 py-0.5 rounded-full"
            >
              #{highlightMatches(tag, highlightQuery)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
