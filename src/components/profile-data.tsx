import { useState } from "react";
import {
  BookOpen,
  Star,
  Globe,
  Lock,
  Share2,
  Calendar,
  Loader2,
} from "lucide-react";
import { useFavoriteToggle, MAX_FAVORITES } from "@/hooks/use-favorite-toggle";
import { QueryProvider } from "./query-provider";
import { toast } from "@/hooks/use-toast";

interface QuoteBook {
  id?: string;
  title: string;
  authorName: string | null;
  coverUrl?: string | null;
}

interface QuoteData {
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

interface ProfileDataProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  initialQuoteCount: number;
  initialFavoriteQuotes: QuoteData[];
  initialRecentQuotes: QuoteData[];
  userId: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function QuoteCardViewOnly({
  quote,
  onToggleFavorite,
  isTogglingFavorite,
  canAddFavorite,
}: {
  quote: QuoteData;
  onToggleFavorite: (quoteId: string, isFavorite: boolean) => void;
  isTogglingFavorite: boolean;
  canAddFavorite: boolean;
}) {
  const isFavorite = quote.isFavorite;
  const isDisabled = !isFavorite && !canAddFavorite;

  return (
    <div
      className={`bg-background-elevated border rounded-xl p-5 hover:border-primary transition-colors ${
        isFavorite ? "border-l-[3px] border-l-warning" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Quote text */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-relaxed italic flex-1">
            &ldquo;{quote.text}&rdquo;
          </p>
          {isFavorite && (
            <Star
              size={16}
              fill="currentColor"
              className="text-warning flex-shrink-0 mt-0.5"
            />
          )}
        </div>

        {/* Book & author */}
        {quote.book && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground-muted truncate">
              {quote.book.title}
              {quote.chapter ? `, ${quote.chapter}` : ""}
            </span>
            {quote.book.authorName && (
              <span className="text-xs text-foreground-subtle truncate">
                by {quote.book.authorName}
              </span>
            )}
          </div>
        )}

        {/* Footer: date + visibility + actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-foreground-subtle">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(quote.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              {quote.isPublic ? (
                <Globe size={12} className="text-success" />
              ) : (
                <Lock size={12} className="text-foreground-subtle" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Favorite toggle - Star icon */}
            <button
              onClick={() => onToggleFavorite(quote.id, !isFavorite)}
              disabled={isTogglingFavorite || isDisabled}
              className={`p-1.5 rounded-md transition-colors ${
                isDisabled
                  ? "opacity-30 cursor-not-allowed"
                  : "text-foreground-muted hover:bg-background-muted hover:text-warning"
              }`}
              title={
                isFavorite
                  ? "Remove from favorites"
                  : isDisabled
                  ? "Maximum favorites reached"
                  : "Add to favorites"
              }
            >
              {isTogglingFavorite ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Star
                  size={14}
                  fill={isFavorite ? "currentColor" : "none"}
                  className={isFavorite ? "text-warning" : ""}
                />
              )}
            </button>
            {/* Share button */}
            <button
              className="p-1.5 rounded-md text-foreground-muted hover:bg-background-muted hover:text-primary transition-colors"
              title="Share"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileData({
  user,
  initialQuoteCount,
  initialFavoriteQuotes,
  initialRecentQuotes,
  userId,
}: ProfileDataProps) {
  const [quoteCount] = useState(initialQuoteCount);
  const [favoriteQuotes, setFavoriteQuotes] = useState<QuoteData[]>(initialFavoriteQuotes);
  const [recentQuotes, setRecentQuotes] = useState<QuoteData[]>(initialRecentQuotes);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null);

  const { mutate: toggleFavorite } = useFavoriteToggle({
    userId,
    onSuccess: (isFavorite) => {
      setPendingFavoriteId(null);
      
      if (isFavorite) {
        const quoteToMove = [...favoriteQuotes, ...recentQuotes].find(
          (q) => q.id === pendingFavoriteId
        );
        if (quoteToMove) {
          const updatedQuote = { ...quoteToMove, isFavorite: true };
          setFavoriteQuotes((prev) => [updatedQuote, ...prev]);
          setRecentQuotes((prev) => prev.filter((q) => q.id !== pendingFavoriteId));
        }
      } else {
        setFavoriteQuotes((prev) => prev.filter((q) => q.id !== pendingFavoriteId));
        const quoteToMove = initialFavoriteQuotes.find(q => q.id === pendingFavoriteId);
        if (quoteToMove) {
          const updatedQuote = { ...quoteToMove, isFavorite: false };
          setRecentQuotes((prev) => [updatedQuote, ...prev]);
        }
      }
    },
    onError: () => {
      setPendingFavoriteId(null);
    },
  });

  const handleToggleFavorite = (quoteId: string, newIsFavorite: boolean) => {
    if (newIsFavorite && favoriteQuotes.length >= MAX_FAVORITES) {
      toast({
        title: "Maximum favorites reached",
        description: `You can only have ${MAX_FAVORITES} favorite quotes. Remove one first.`,
        variant: "destructive",
      });
      return;
    }

    setPendingFavoriteId(quoteId);
    toggleFavorite({ quoteId, isFavorite: newIsFavorite });
  };

  const canAddFavorite = favoriteQuotes.length < MAX_FAVORITES;
  const currentFavoriteCount = favoriteQuotes.length;

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-background-elevated border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-5 p-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-3 border-primary flex-shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-bold text-2xl flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{user.name}</h1>
            <p className="text-sm text-foreground-muted truncate">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Stats - reactive */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-background-muted rounded-xl">
              <BookOpen size={24} className="text-primary" />
              <div className="text-center">
                <div className="text-2xl font-bold">{quoteCount}</div>
                <div className="text-xs text-foreground-subtle">Total Quotes</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-background-muted rounded-xl">
              <Star size={24} className="text-warning" />
              <div className="text-center">
                <div className="text-2xl font-bold">{currentFavoriteCount}</div>
                <div className="text-xs text-foreground-subtle">Favorites</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Quotes Section - always show */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star size={20} className="text-warning" />
          Favorite Quotes
        </h2>
        {favoriteQuotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteQuotes.map((quote) => (
              <QuoteCardViewOnly
                key={quote.id}
                quote={quote}
                onToggleFavorite={handleToggleFavorite}
                isTogglingFavorite={pendingFavoriteId === quote.id}
                canAddFavorite={canAddFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-background-elevated border border-border rounded-xl p-8 text-center">
            <Star size={32} className="mx-auto text-foreground-muted mb-3" />
            <p className="text-foreground-muted">
              You don&apos;t have any favorite quotes yet. Click the star on any quote to add it to your favorites!
            </p>
          </div>
        )}
      </div>

      {/* Recent Quotes Section */}
      {recentQuotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              Recent Quotes
            </h2>
            <a
              href="/quotes"
              className="text-sm text-primary hover:underline transition-colors"
            >
              View all &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentQuotes.map((quote) => (
              <QuoteCardViewOnly
                key={quote.id}
                quote={quote}
                onToggleFavorite={handleToggleFavorite}
                isTogglingFavorite={pendingFavoriteId === quote.id}
                canAddFavorite={canAddFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileDataComponent(props: ProfileDataProps) {
  return (
    <QueryProvider>
      <ProfileData {...props} />
    </QueryProvider>
  );
}
