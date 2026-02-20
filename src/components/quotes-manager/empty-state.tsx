import { Search, BookOpen } from "lucide-react";

interface EmptyStateProps {
  type: "no-results" | "no-quotes";
  query?: string;
}

export function EmptyState({ type, query }: EmptyStateProps) {
  if (type === "no-results" && query) {
    return (
      <div className="bg-background-elevated border border-background-muted rounded-lg p-12 text-center">
        <Search size={48} className="mx-auto text-foreground-muted mb-4" />
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-foreground-muted">
          No quotes match &ldquo;{query}&rdquo;. Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated border border-background-muted rounded-lg p-12 text-center">
      <BookOpen size={48} className="mx-auto text-foreground-muted mb-4" />
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
  );
}
