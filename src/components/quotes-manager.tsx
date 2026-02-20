import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Search,
  RotateCcw,
  BookOpen,
  User,
  Calendar,
  Trash2,
  Loader2,
  AlertTriangle,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchQuotes } from "@/hooks/use-search-quotes";
import { useDeleteQuotes } from "@/hooks/use-delete-quotes";
import { QueryProvider } from "./query-provider";
import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";
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
import { toast } from "@/hooks/use-toast";

// ---------- Types ----------

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
  book: QuoteBook | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalQuotes: number;
  showingFrom: number;
  showingTo: number;
  pageNumbers: (number | "...")[];
}

interface QuotesManagerProps {
  userId: string;
  quotes: QuoteData[];
  pagination: PaginationInfo;
  fetchError: string;
}

// ---------- Helpers ----------

function highlightMatches(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-primary/25 text-foreground rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ---------- Components ----------

export const QuotesManager = (props: QuotesManagerProps) => (
  <QueryProvider>
    <QuotesManagerInner {...props} />
  </QueryProvider>
);

const QuotesManagerInner = ({
  userId,
  quotes: initialQuotes,
  pagination,
  fetchError,
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
  // Keep a snapshot of deleteTarget so the dialog content doesn't flash
  // "undefined" while the close animation plays out.
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

  // --- Local quotes state (to remove deleted quotes from view without full reload) ---
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const quotes = initialQuotes.filter((q) => !deletedIds.has(q.id));

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
          toast({
            title: idsToDelete.length === 1
              ? "Quote deleted"
              : `${idsToDelete.length} quotes deleted`,
          });
          // If we're in search mode, the search cache is now stale.
          // A simple approach: if search is active, re-trigger it.
          if (isSearchActive) {
            // Force refetch by briefly clearing and restoring
            const q = activeQuery;
            setActiveQuery("");
            setTimeout(() => setActiveQuery(q), 0);
          }
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete quotes. Please try again.",
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

  // --- Determine which quotes to show ---
  const displayQuotes: QuoteData[] = isSearchActive
    ? (searchResults ?? []).filter((q) => !deletedIds.has(q.id))
    : quotes;

  const highlightQuery = isSearchActive ? activeQuery : "";

  const adjustedTotal = pagination.totalQuotes - deletedIds.size;

  return (
    <div className="flex flex-col gap-4">
      {/* Collection count */}
      <p className="text-foreground-muted -mt-2">
        {adjustedTotal} quote{adjustedTotal !== 1 ? "s" : ""} in your
        collection
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
            placeholder="Search quotes, books, or authors..."
            className="w-full pl-10 pr-10 py-3 bg-background-elevated border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <Loader2
            size={18}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted animate-spin transition-opacity ${
              isFetching ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        {isSearchActive && (
          <button
            onClick={handleReset}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-background-elevated text-foreground-muted hover:bg-background-muted hover:text-foreground hover:border-primary transition-all"
            title="Clear search and show all quotes"
          >
            <RotateCcw size={18} />
          </button>
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-background-elevated text-foreground-muted hover:bg-background-muted hover:text-foreground hover:border-primary transition-all"
              title="Actions"
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
              {bulkMode ? "Cancel bulk delete" : "Delete multiple"}
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
                ? "Select quotes to delete"
                : `${selectedIds.size} quote${selectedIds.size !== 1 ? "s" : ""} selected`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDeleteConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-1.5 text-sm font-medium bg-danger text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Delete selected
            </button>
            <button
              onClick={toggleBulkMode}
              className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg transition-colors"
              title="Cancel"
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
          <span>
            Showing the maximum of 50 results. Try refining your search for
            more specific results.
          </span>
        </div>
      )}

      {/* Search result count */}
      {isSearchActive && !isFetching && searchResults && searchResults.length > 0 && (
        <p className="text-sm text-foreground-muted">
          Found{" "}
          <span className="font-medium text-foreground">
            {searchResults.filter((q) => !deletedIds.has(q.id)).length}
          </span>{" "}
          result
          {searchResults.filter((q) => !deletedIds.has(q.id)).length !== 1
            ? "s"
            : ""}{" "}
          for &ldquo;{activeQuery}&rdquo;
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
          <div className="bg-background-elevated border border-background-muted rounded-lg p-12 text-center">
            <Search
              size={48}
              className="mx-auto text-foreground-muted mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-foreground-muted">
              No quotes match &ldquo;{activeQuery}&rdquo;. Try a different
              search term.
            </p>
          </div>
        )}

      {!isSearchActive && !fetchError && quotes.length === 0 && (
        <div className="bg-background-elevated border border-background-muted rounded-lg p-12 text-center">
          <BookOpen
            size={48}
            className="mx-auto text-foreground-muted mb-4"
          />
          <h2 className="text-xl font-semibold mb-2">No quotes yet</h2>
          <p className="text-foreground-muted mb-6">
            Start capturing quotes from your favorite books!
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Capture a Quote
          </a>
        </div>
      )}

      {/* Skeleton loaders while searching */}
      {isSearchActive && isFetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-elevated border border-background-muted rounded-lg p-6 flex flex-col gap-4"
            >
              {/* Quote text skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[75%]" />
              </div>

              {/* Book & author skeleton */}
              <div className="flex flex-col gap-2 border-t border-background-muted pt-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3.5 w-[60%]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3.5 w-[40%]" />
                </div>
              </div>

              {/* Footer skeleton */}
              <div className="flex items-center justify-between border-t border-background-muted pt-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quotes Grid */}
      {!(isSearchActive && isFetching) && displayQuotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayQuotes.map((quote) => (
            <div
              key={quote.id}
              onClick={
                bulkMode ? () => toggleSelection(quote.id) : undefined
              }
              className={`bg-background-elevated border rounded-lg p-6 transition-colors flex flex-col gap-4 ${
                bulkMode
                  ? "cursor-pointer"
                  : ""
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
                      onCheckedChange={() => toggleSelection(quote.id)}
                    />
                  </div>
                )}
                <blockquote className="text-foreground leading-relaxed flex-1">
                  &ldquo;{highlightMatches(quote.text, highlightQuery)}&rdquo;
                </blockquote>
              </div>

              {/* Book & Author Info */}
              <div className="flex flex-col gap-2 text-sm text-foreground-muted border-t border-background-muted pt-4">
                {quote.book && (
                  <>
                    <div className="flex items-center gap-2">
                      <BookOpen
                        size={16}
                        className="text-primary flex-shrink-0"
                      />
                      <span className="truncate">
                        {highlightMatches(
                          quote.book.title,
                          highlightQuery,
                        )}
                        {quote.chapter ? (
                          <>
                            ,{" "}
                            {highlightMatches(
                              quote.chapter,
                              highlightQuery,
                            )}
                          </>
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                    {quote.book.authorName && (
                      <div className="flex items-center gap-2">
                        <User
                          size={16}
                          className="text-accent flex-shrink-0"
                        />
                        <span className="truncate">
                          {highlightMatches(
                            quote.book.authorName,
                            highlightQuery,
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer with Date and Actions */}
              <div className="flex items-center justify-between mt-auto border-t border-background-muted pt-4">
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <Calendar size={14} />
                  <span>{formatDate(quote.createdAt)}</span>
                </div>

                {!bulkMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteSingle(quote.id)}
                      className="p-2 text-danger hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Delete quote"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              {quote.tags && quote.tags.length > 0 && (
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
          ))}
        </div>
      )}

      {/* Pagination (static quotes only) */}
      {!isSearchActive && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-background-muted pt-6">
          <div className="text-sm text-foreground-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {pagination.showingFrom}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {pagination.showingTo}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {pagination.totalQuotes}
            </span>{" "}
            quotes
          </div>

          <div className="flex items-center gap-2">
            {pagination.currentPage > 1 ? (
              <a
                href={`/quotes?page=${pagination.currentPage - 1}`}
                className="p-2 rounded-lg border border-border bg-background-elevated text-foreground hover:bg-background-muted hover:border-primary transition-all"
                title="Previous page"
              >
                <ChevronLeft size={20} />
              </a>
            ) : (
              <span className="p-2 rounded-lg border border-border bg-background-elevated text-foreground opacity-50 cursor-not-allowed">
                <ChevronLeft size={20} />
              </span>
            )}

            <div className="flex items-center gap-1">
              {pagination.pageNumbers.map((page, i) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="min-w-10 h-10 px-3 flex items-center justify-center text-foreground-muted"
                  >
                    &hellip;
                  </span>
                ) : page === pagination.currentPage ? (
                  <span
                    key={page}
                    className="min-w-10 h-10 px-3 rounded-lg border bg-primary text-background border-primary font-semibold flex items-center justify-center"
                  >
                    {page}
                  </span>
                ) : (
                  <a
                    key={page}
                    href={`/quotes?page=${page}`}
                    className="min-w-10 h-10 px-3 rounded-lg border bg-background-elevated border-border text-foreground hover:bg-background-muted hover:border-primary transition-all flex items-center justify-center"
                  >
                    {page}
                  </a>
                ),
              )}
            </div>

            {pagination.currentPage < pagination.totalPages ? (
              <a
                href={`/quotes?page=${pagination.currentPage + 1}`}
                className="p-2 rounded-lg border border-border bg-background-elevated text-foreground hover:bg-background-muted hover:border-primary transition-all"
                title="Next page"
              >
                <ChevronRight size={20} />
              </a>
            ) : (
              <span className="p-2 rounded-lg border border-border bg-background-elevated text-foreground opacity-50 cursor-not-allowed">
                <ChevronRight size={20} />
              </span>
            )}
          </div>
        </div>
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
                ? "Delete quote?"
                : `Delete ${dialogCount} quotes?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The{" "}
              {dialogCount === 1 ? "quote" : "selected quotes"} will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
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
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
