import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Search,
  RotateCcw,
  Trash2,
  Loader2,
  AlertTriangle,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useSearchQuotes } from "@/hooks/use-search-quotes";
import { useDeleteQuotes } from "@/hooks/use-delete-quotes";
import {
  useUpdateQuote,
  type UpdateQuotePayload,
} from "@/hooks/use-update-quote";
import { useFavoriteToggle, MAX_FAVORITES } from "@/hooks/use-favorite-toggle";
import { QueryProvider } from "./query-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { dispatchToastEvent } from "@/components/global-toast-manager";
import {
  type QuotesManagerProps,
  type QuoteData,
  type PaginationInfo,
  type QuoteBook,
} from "./quotes-manager/types";
import { QuoteCard } from "./quote-card";
import { QuoteCardSkeleton } from "./quotes-manager/quote-card-skeleton";
import { EmptyState } from "./quotes-manager/empty-state";
import { QuotesPagination } from "./quotes-manager/quotes-pagination";
import type { BookResult } from "./capture/book-search";
import { t, type Locale } from "@/i18n";

export const QuotesManager = (props: QuotesManagerProps) => (
  <QueryProvider>
    <QuotesManagerInner {...props} />
  </QueryProvider>
);

const QuotesManagerInner = ({
  userId,
  userName,
  userImage,
  quotes: initialQuotes,
  pagination,
  fetchError,
  locale = "en",
}: QuotesManagerProps) => {
  // --- Search state ---
  const [inputValue, setInputValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    data: searchResults,
    isFetching,
    hitLimit,
  } = useSearchQuotes(userId, activeQuery);
  const isSearchActive = activeQuery.length > 0;

  // --- Delete state ---
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const deleteTargetSnapshot = useRef<string[]>([]);
  if (deleteTarget !== null) {
    deleteTargetSnapshot.current = deleteTarget;
  }
  const dialogCount = deleteTargetSnapshot.current.length;
  const [bulkMode, setBulkMode] = useState(() => {
    try {
      return sessionStorage.getItem("bulk-delete-active") === "true";
    } catch {
      return false;
    }
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem("bulk-delete-ids");
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const deleteMutation = useDeleteQuotes();

  // --- Edit state ---
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<{
    text: string;
    chapter: string;
    isPublic: boolean;
    tags: string[];
    selectedBook: BookResult | null;
  } | null>(null);
  const updateMutation = useUpdateQuote();

  // Persist bulk-delete state to sessionStorage
  useEffect(() => {
    try {
      if (bulkMode) {
        sessionStorage.setItem("bulk-delete-active", "true");
        sessionStorage.setItem(
          "bulk-delete-ids",
          JSON.stringify(Array.from(selectedIds)),
        );
      } else {
        sessionStorage.removeItem("bulk-delete-active");
        sessionStorage.removeItem("bulk-delete-ids");
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [bulkMode, selectedIds]);

  // --- Local quotes state ---
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [quotes, setQuotes] = useState(initialQuotes);

  useEffect(() => {
    setQuotes(initialQuotes);
  }, [initialQuotes]);

  // --- Favorite toggle state ---
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(
    null,
  );
  const favoriteCount = quotes.filter((q) => q.isFavorite).length;
  const canAddFavorite = favoriteCount < MAX_FAVORITES;

  const { mutate: toggleFavorite } = useFavoriteToggle({
    userId,
    onSuccess: (isFavorite, quoteId) => {
      setPendingFavoriteId(null);
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, isFavorite } : q)),
      );
    },
    onError: () => {
      setPendingFavoriteId(null);
    },
  });

  const handleToggleFavorite = (quoteId: string, newIsFavorite: boolean) => {
    if (newIsFavorite && !canAddFavorite) {
      dispatchToastEvent({
        titleKey: "quotesManager.maxFavoritesReached",
        descriptionKey: "quotesManager.maxFavoritesDescription",
        variant: "destructive",
        interpolations: { max: MAX_FAVORITES.toString() },
      });
      return;
    }
    setPendingFavoriteId(quoteId);
    toggleFavorite({ quoteId, isFavorite: newIsFavorite });
  };

  // --- Search handlers ---
  const handleSearch = () => setActiveQuery(inputValue.trim());
  const handleReset = () => {
    setInputValue("");
    setActiveQuery("");
    inputRef.current?.focus();
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // --- Delete handlers ---
  const handleDeleteSingle = (quoteId: string) => {
    setDeleteTarget([quoteId]);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || deleteTarget.length === 0) return;
    const idsToDelete = deleteTarget;
    deleteMutation.mutate(
      { userId, quotesIds: idsToDelete },
      {
        onSuccess: () => {
          setDeletedIds((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.add(id));
            return next;
          });
          setSelectedIds((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.delete(id));
            return next;
          });
          setDeleteTarget(null);
          if (bulkMode && idsToDelete.length > 0) {
            setBulkMode(false);
          }
          dispatchToastEvent({
            titleKey: idsToDelete.length === 1
              ? "quotesManager.quoteDeleted"
              : "quotesManager.quotesDeletedCount",
            interpolations: { count: idsToDelete.length.toString() },
          });
          if (isSearchActive) {
            const q = activeQuery;
            setActiveQuery("");
            setTimeout(() => setActiveQuery(q), 0);
          }
        },
        onError: () => {
          dispatchToastEvent({
            titleKey: "common.error",
            descriptionKey: "quotesManager.deleteError",
            variant: "destructive",
          });
          setDeleteTarget(null);
        },
      },
    );
  };

  // --- Bulk-delete handlers ---
  const toggleBulkMode = () => {
    if (bulkMode) {
      setBulkMode(false);
      setSelectedIds(new Set());
    } else {
      setBulkMode(true);
      setSelectedIds(new Set());
    }
  };

  const toggleSelection = (quoteId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(quoteId)) {
        next.delete(quoteId);
      } else {
        next.add(quoteId);
      }
      return next;
    });
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedIds.size === 0) return;
    setDeleteTarget(Array.from(selectedIds));
  };

  // --- Edit handlers ---
  const handleStartEdit = (quote: any) => {
    setEditingQuoteId(quote.id);
    setEditedFields({
      text: quote.text,
      chapter: quote.chapter || "",
      isPublic: quote.isPublic,
      tags: quote.tags || [],
      selectedBook: quote.book
        ? {
            title: quote.book.title,
            authorName: quote.book.authorName || "",
            coverUrl: quote.book.coverUrl || undefined,
            bookId: quote.book.id,
            openlibraryId: undefined,
          }
        : null,
    });
  };

  const handleCancelEdit = () => {
    setEditingQuoteId(null);
    setEditedFields(null);
  };

  const handleSaveEdit = () => {
    if (!editingQuoteId || !editedFields) return;

    const originalQuote = displayQuotes.find((q) => q.id === editingQuoteId);
    if (!originalQuote) return;

    const payload: UpdateQuotePayload = {};

    if (editedFields.text !== originalQuote.text) {
      payload.text = editedFields.text;
    }
    if (editedFields.chapter !== (originalQuote.chapter || "")) {
      payload.chapter = editedFields.chapter || null;
    }
    if (editedFields.isPublic !== originalQuote.isPublic) {
      payload.isPublic = editedFields.isPublic;
    }
    const originalTags = originalQuote.tags || [];
    if (JSON.stringify(editedFields.tags) !== JSON.stringify(originalTags)) {
      payload.tags = editedFields.tags.length > 0 ? editedFields.tags : null;
    }

    if (editedFields.selectedBook) {
      const newBookId = editedFields.selectedBook.bookId;
      const newOpenlibraryId = editedFields.selectedBook.openlibraryId;
      const newCoverUrl = editedFields.selectedBook.coverUrl;

      if (newBookId) {
        payload.bookId = newBookId;
      } else if (newOpenlibraryId) {
        payload.openlibraryId = newOpenlibraryId;
        if (newCoverUrl) {
          payload.coverUrl = newCoverUrl;
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      handleCancelEdit();
      return;
    }

    updateMutation.mutate(
      { userId, quoteId: editingQuoteId, payload },
      {
        onSuccess: () => {
          setQuotes((prev) =>
            prev.map((q) => {
              if (q.id !== editingQuoteId) return q;

              const updatedQuote = { ...q };

              if (editedFields) {
                updatedQuote.text = editedFields.text;
                updatedQuote.chapter = editedFields.chapter || null;
                updatedQuote.isPublic = editedFields.isPublic;
                updatedQuote.tags = editedFields.tags;

                if (editedFields.selectedBook) {
                  updatedQuote.book = {
                    title: editedFields.selectedBook.title,
                    authorName: editedFields.selectedBook.authorName || null,
                    coverUrl: editedFields.selectedBook.coverUrl,
                    id: editedFields.selectedBook.bookId,
                  };
                  updatedQuote.bookId = editedFields.selectedBook.bookId || "";
                }
              }

              return updatedQuote;
            }),
          );

          setEditingQuoteId(null);
          setEditedFields(null);
          dispatchToastEvent({ titleKey: "quotesManager.quoteUpdated" });
        },
        onError: () => {
          dispatchToastEvent({
            titleKey: "common.error",
            descriptionKey: "quotesManager.updateError",
            variant: "destructive",
          });
        },
      },
    );
  };

  // --- Determine which quotes to show ---
  const displayQuotes = isSearchActive
    ? (searchResults ?? []).filter((q) => !deletedIds.has(q.id))
    : quotes.filter((q) => !deletedIds.has(q.id));

  const highlightQuery = isSearchActive ? activeQuery : "";
  const adjustedTotal = pagination.totalQuotes - deletedIds.size;

  return (
    <div className="flex flex-col gap-4">
      {/* Collection count */}
      <p className="text-foreground-muted -mt-2">
        {adjustedTotal}{" "}
        {adjustedTotal !== 1
          ? t(locale, "quotesManager.collectionCountPlural")
          : t(locale, "quotesManager.collectionCount")}{" "}
        {t(locale, "quotesManager.inYourCollection")}
      </p>

      {/* Search + Actions bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(locale, "quotesManager.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-3 bg-background-elevated border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        {isSearchActive && (
          <button
            onClick={handleReset}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-background-elevated text-foreground-muted hover:bg-background-muted hover:text-foreground hover:border-primary transition-all"
            title={t(locale, "quotesManager.clearSearch")}
          >
            <RotateCcw size={18} />
          </button>
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-background-elevated text-foreground-muted hover:bg-background-muted hover:text-foreground hover:border-primary transition-all"
              title={t(locale, "quotesManager.actions")}
            >
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={toggleBulkMode}
              className="text-danger focus:text-danger"
            >
              <Trash2 size={16} />
              {bulkMode
                ? t(locale, "quotesManager.cancelBulkDelete")
                : t(locale, "quotesManager.deleteMultiple")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk-delete bar */}
      {bulkMode && (
        <div className="flex items-center justify-between bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-danger">
            <Trash2 size={16} className="flex-shrink-0" />
            <span>
              {selectedIds.size === 0
                ? t(locale, "quotesManager.selectQuotesToDelete")
                : `${selectedIds.size} ${selectedIds.size !== 1 ? t(locale, "quotesManager.collectionCountPlural") : t(locale, "quotesManager.collectionCount")} ${t(locale, "quotesManager.quotesSelected")}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDeleteConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-1.5 text-sm font-medium bg-danger text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t(locale, "quotesManager.deleteSelected")}
            </button>
            <button
              onClick={toggleBulkMode}
              className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg transition-colors"
              title={t(locale, "common.cancel")}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Limit Warning (search) */}
      {hitLimit && (
        <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{t(locale, "quotesManager.limitWarning")}</span>
        </div>
      )}

      {/* Search result count */}
      {isSearchActive &&
        !isFetching &&
        searchResults &&
        searchResults.length > 0 && (
          <p className="text-sm text-foreground-muted">
            {t(locale, "quotesManager.found")}{" "}
            <span className="font-medium text-foreground">
              {searchResults.filter((q) => !deletedIds.has(q.id)).length}
            </span>{" "}
            {searchResults.filter((q) => !deletedIds.has(q.id)).length !== 1
              ? t(locale, "quotesManager.results")
              : t(locale, "quotesManager.result")}{" "}
            {t(locale, "quotesManager.for")} &ldquo;{activeQuery}&rdquo;
          </p>
        )}

      {/* Error state (static only) */}
      {!isSearchActive && fetchError && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
          <p className="text-danger font-medium">{fetchError}</p>
        </div>
      )}

      {/* Empty states */}
      {isSearchActive &&
        !isFetching &&
        searchResults &&
        searchResults.length === 0 && (
          <EmptyState type="no-results" query={activeQuery} locale={locale} />
        )}

      {!isSearchActive && !fetchError && quotes.length === 0 && (
        <EmptyState type="no-quotes" locale={locale} />
      )}

      {/* Skeleton loaders while searching */}
      {isSearchActive && isFetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <QuoteCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Quotes Grid */}
      {!(isSearchActive && isFetching) && displayQuotes.length > 0 && (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {displayQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              editable={true}
              highlightQuery={highlightQuery}
              bulkMode={bulkMode}
              selectedIds={selectedIds}
              editingQuoteId={editingQuoteId}
              editedFields={editedFields}
              isUpdatePending={updateMutation.isPending}
              onToggleSelection={toggleSelection}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onSetEditedFields={setEditedFields}
              onDeleteSingle={handleDeleteSingle}
              onToggleFavorite={handleToggleFavorite}
              isTogglingFavorite={pendingFavoriteId === quote.id}
              canAddFavorite={canAddFavorite}
              userName={userName}
              userImage={userImage}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Pagination (static quotes only) */}
      {!isSearchActive && pagination.totalPages > 1 && (
        <QuotesPagination pagination={pagination} locale={locale} />
      )}

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent
          onOverlayClick={() => {
            if (!deleteMutation.isPending) setDeleteTarget(null);
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogCount === 1
                ? t(locale, "quotesManager.deleteQuote")
                : t(locale, "quotesManager.deleteQuotes", {
                    count: dialogCount.toString(),
                  })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogCount === 1
                ? t(locale, "quotesManager.deleteConfirmation")
                : t(locale, "quotesManager.deleteConfirmationPlural")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t(locale, "common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteMutation.isPending}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {t(locale, "quotesManager.deleting")}
                </>
              ) : (
                t(locale, "common.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export type { QuoteData, PaginationInfo, QuoteBook };
