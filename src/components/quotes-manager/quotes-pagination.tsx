import { ChevronLeft, ChevronRight } from "lucide-react";
import { type PaginationInfo } from "./types";
import { getLocalizedPath, type Locale } from "@/i18n";

interface QuotesPaginationProps {
  pagination: PaginationInfo;
  locale?: Locale;
}

export function QuotesPagination({ pagination, locale = "en" }: QuotesPaginationProps) {
  return (
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
            href={`${getLocalizedPath('/quotes', locale)}?page=${pagination.currentPage - 1}`}
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
                href={`${getLocalizedPath('/quotes', locale)}?page=${page}`}
                className="min-w-10 h-10 px-3 rounded-lg border bg-background-elevated border-border text-foreground hover:bg-background-muted hover:border-primary transition-all flex items-center justify-center"
              >
                {page}
              </a>
            ),
          )}
        </div>

        {pagination.currentPage < pagination.totalPages ? (
          <a
            href={`${getLocalizedPath('/quotes', locale)}?page=${pagination.currentPage + 1}`}
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
  );
}
