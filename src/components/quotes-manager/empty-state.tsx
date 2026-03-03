import { Search, BookOpen } from "lucide-react";
import { t, getLocalizedPath, type Locale } from "@/i18n";

interface EmptyStateProps {
  type: "no-results" | "no-quotes";
  query?: string;
  locale?: Locale;
}

export function EmptyState({ type, query, locale = "en" }: EmptyStateProps) {
  if (type === "no-results" && query) {
    return (
      <div className="bg-background-elevated border border-background-muted rounded-lg p-12 text-center">
        <Search size={48} className="mx-auto text-foreground-muted mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t(locale, "quotesManager.noResults")}</h2>
        <p className="text-foreground-muted">
          {t(locale, "quotesManager.noResultsDescription")} &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated border border-background-muted rounded-lg p-12 text-center">
      <BookOpen size={48} className="mx-auto text-foreground-muted mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t(locale, "quotesManager.noQuotes")}</h2>
      <p className="text-foreground-muted mb-6">
        {t(locale, "quotesManager.noQuotesDescription")}
      </p>
      <a
        href={getLocalizedPath("/", locale)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {t(locale, "quotes.captureQuote")}
      </a>
    </div>
  );
}
