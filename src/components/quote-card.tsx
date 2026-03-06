import {
  Trash2,
  Pencil,
  Loader2,
  Globe,
  Lock,
  BookOpen,
  User,
  Calendar,
  Star,
  Share2,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookSearch, type BookResult } from "@/components/capture/book-search";
import { TagsInput } from "@/components/tags-input";
import { t, type Locale } from "@/i18n";

interface QuoteBook {
  id?: string;
  title: string;
  authorName: string | null;
  coverUrl?: string | null;
}

export interface QuoteData {
  id: string;
  text: string;
  chapter: string | null;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[] | null;
  createdAt: string;
  bookId: string;
  userId: string;
  book: QuoteBook | null;
}

interface QuoteCardProps {
  quote: QuoteData;
  editable?: boolean;
  bulkMode?: boolean;
  highlightQuery?: string;
  selectedIds?: Set<string>;
  editingQuoteId?: string | null;
  editedFields?: {
    text: string;
    chapter: string;
    isPublic: boolean;
    tags: string[];
    selectedBook: BookResult | null;
  } | null;
  isUpdatePending?: boolean;
  onToggleSelection?: (quoteId: string) => void;
  onStartEdit?: (quote: QuoteData) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onSetEditedFields?: React.Dispatch<
    React.SetStateAction<{
      text: string;
      chapter: string;
      isPublic: boolean;
      tags: string[];
      selectedBook: BookResult | null;
    } | null>
  >;
  onDeleteSingle?: (quoteId: string) => void;
  onToggleFavorite?: (quoteId: string, isFavorite: boolean) => void;
  isTogglingFavorite?: boolean;
  canAddFavorite?: boolean;
  locale?: Locale;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="bg-primary/30">$1</mark>');
}

export function QuoteCard({
  quote,
  editable = false,
  bulkMode = false,
  highlightQuery = "",
  selectedIds = new Set(),
  editingQuoteId = null,
  editedFields = null,
  isUpdatePending = false,
  onToggleSelection,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSetEditedFields,
  onDeleteSingle,
  onToggleFavorite,
  isTogglingFavorite = false,
  canAddFavorite = true,
  locale = "en",
}: QuoteCardProps) {
  const isEditing = editingQuoteId === quote.id;
  const isFavorite = quote.isFavorite;
  const isFavoriteDisabled = !isFavorite && !canAddFavorite;
  const [showAllTags, setShowAllTags] = useState(false);

  const MAX_TAGS_DISPLAY = 6;
  const hasTags = quote.tags && quote.tags.length > 0;
  const hasMoreTags = hasTags && quote.tags!.length > MAX_TAGS_DISPLAY;
  const displayedTags = hasTags
    ? showAllTags
      ? quote.tags!
      : quote.tags!.slice(0, MAX_TAGS_DISPLAY)
    : [];

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/quotes/${quote.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(locale, "quote.share"),
          text: `"${quote.text}" - ${quote.book?.title || "Unknown"}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div
      onClick={bulkMode ? () => onToggleSelection?.(quote.id) : undefined}
      className={`bg-background-elevated border rounded-lg p-5 transition-colors flex flex-col gap-3 break-inside-avoid ${
        bulkMode ? "cursor-pointer" : ""
      } ${
        bulkMode && selectedIds.has(quote.id)
          ? "border-danger bg-danger/5"
          : isFavorite
            ? "border-l-[3px] border-l-warning"
            : "border-border hover:border-primary"
      }`}
    >
      {/* Bulk-mode checkbox + Quote Text */}
      <div className="flex gap-3">
        {bulkMode && (
          <div className="flex-shrink-0 pt-1">
            <Checkbox
              checked={selectedIds.has(quote.id)}
              onCheckedChange={() => onToggleSelection?.(quote.id)}
            />
          </div>
        )}

        {isEditing && editedFields ? (
          <div className="flex-1 space-y-4">
            <Textarea
              value={editedFields.text}
              onChange={(e) =>
                onSetEditedFields?.({ ...editedFields, text: e.target.value })
              }
              className="min-h-[100px] focus:min-h-[250px] transition-all duration-300 resize-none text-sm italic leading-relaxed bg-transparent border border-border rounded-lg p-3 focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Quote text..."
            />

            <div className="space-y-2">
              <Label className="text-xs text-foreground-subtle">Book</Label>
              <BookSearch
                selectedBook={editedFields.selectedBook}
                onSelect={(book) =>
                  onSetEditedFields?.({ ...editedFields, selectedBook: book })
                }
                onClear={() =>
                  onSetEditedFields?.({ ...editedFields, selectedBook: null })
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
                  onSetEditedFields?.({
                    ...editedFields,
                    chapter: e.target.value,
                  })
                }
                placeholder="e.g. Chapter 3, p. 42"
                className="h-8 text-sm bg-background-muted border-background-muted"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-foreground-subtle">Tags</Label>
                <span className="text-xs text-foreground-muted">
                  {editedFields.tags.length}/10
                </span>
              </div>
              <TagsInput
                value={editedFields.tags}
                onChange={(tags) =>
                  onSetEditedFields?.({ ...editedFields, tags })
                }
                placeholder="Add tags, separated by comma..."
                maxTags={10}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editedFields.isPublic}
                onCheckedChange={(checked) =>
                  onSetEditedFields?.({ ...editedFields, isPublic: checked })
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
          <div className="flex-1 max-h-[200px] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <blockquote
                className="text-sm leading-relaxed italic flex-1"
                dangerouslySetInnerHTML={{
                  __html: `&ldquo;${highlightMatches(
                    quote.text,
                    highlightQuery,
                  )}&rdquo;`,
                }}
              />
              {isFavorite && (
                <Star
                  size={16}
                  fill="currentColor"
                  className="text-warning flex-shrink-0 mt-0.5"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Book & Author Info - hidden when editing */}
      {!isEditing && quote.book && (
        <div className="flex flex-col gap-1.5 text-sm text-foreground-muted border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary flex-shrink-0" />
            <span
              className="truncate"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(
                  `${quote.book.title}${quote.chapter ? `, ${quote.chapter}` : ""}`,
                  highlightQuery,
                ),
              }}
            />
          </div>
          {quote.book.authorName && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-accent flex-shrink-0" />
              <span
                className="truncate"
                dangerouslySetInnerHTML={{
                  __html: highlightMatches(
                    quote.book.authorName,
                    highlightQuery,
                  ),
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer with Date and Actions */}
      {isEditing && editedFields ? (
        <div className="flex items-center justify-end gap-2 mt-auto border-t border-border pt-3">
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
            className="px-4 py-1.5 text-sm font-semibold bg-accent text-background rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isUpdatePending ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-auto border-t border-border pt-3">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Calendar size={14} />
            <span>{formatDate(quote.createdAt)}</span>
            {quote.isPublic ? (
              <Globe size={14} className="text-success ml-1" />
            ) : (
              <Lock size={14} className="ml-1" />
            )}
          </div>

          {!bulkMode && (
            <div className="flex items-center gap-1">
              {/* Favorite toggle */}
              {onToggleFavorite && (
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
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>

              {/* Edit button - only if editable */}
              {editable && onStartEdit && (
                <button
                  onClick={() => onStartEdit(quote)}
                  className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Edit quote"
                >
                  <Pencil size={16} />
                </button>
              )}

              {/* Delete button - only if editable */}
              {editable && onDeleteSingle && (
                <button
                  onClick={() => onDeleteSingle(quote.id)}
                  className="p-2 text-danger hover:text-danger hover:bg-primary/10 rounded-lg transition-colors"
                  title="Delete quote"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {/* View quote button */}
              <a
                href={`/quotes/${quote.id}`}
                className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center justify-center"
                title={t(locale, "quote.viewQuote")}
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowUpRight size={18} strokeWidth={2} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Tags - hidden when editing */}
      {!isEditing && hasTags && (
        <div className="border-t border-border pt-3">
          <div
            className="flex flex-wrap gap-1.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (hasMoreTags) {
                setShowAllTags(!showAllTags);
              }
            }}
          >
            {displayedTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-foreground-subtle bg-background-muted px-2 py-0.5 rounded-full"
                dangerouslySetInnerHTML={{
                  __html: `#${highlightMatches(tag, highlightQuery)}`,
                }}
              />
            ))}
          </div>
          {hasMoreTags && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllTags(!showAllTags);
              }}
              className="text-[10px] text-foreground-muted hover:text-primary transition-colors mt-2"
            >
              {showAllTags
                ? t(locale, "quote.showLess")
                : t(locale, "quote.showMore")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
