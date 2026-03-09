import { useState } from "react";
import { BookOpen, Star, Frown } from "lucide-react";
import { useFavoriteToggle, MAX_FAVORITES } from "@/hooks/use-favorite-toggle";
import { QueryProvider } from "../query-provider";
import { dispatchToastEvent } from "@/components/global-toast-manager";
import { QuoteCard, type QuoteData } from "../quote-card";
import { t, type Locale, getLocalizedPath } from "@/i18n";

export interface ProfileDataProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  initialQuoteCount: number | undefined;
  initialFavoriteQuotes: QuoteData[] | undefined;
  initialRecentQuotes: QuoteData[] | undefined;
  userId: string;
  currentUserName?: string | null;
  currentUserImage?: string | null;
  error: boolean;
  locale?: Locale;
}

function ProfileData({
  user,
  initialQuoteCount,
  initialFavoriteQuotes,
  initialRecentQuotes,
  userId,
  currentUserName,
  currentUserImage,
  error,
  locale = "en",
}: ProfileDataProps) {
  const [quoteCount] = useState(initialQuoteCount ?? 0);
  const [favoriteQuotes, setFavoriteQuotes] = useState<QuoteData[]>(
    initialFavoriteQuotes ?? [],
  );
  const [recentQuotes, setRecentQuotes] = useState<QuoteData[]>(
    initialRecentQuotes ?? [],
  );
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(
    null,
  );

  const currentFavoriteCount = error ? undefined : favoriteQuotes.length;

  const { mutate: toggleFavorite } = useFavoriteToggle({
    userId,
    onSuccess: (isFavorite, quoteId) => {
      setPendingFavoriteId(null);

      if (isFavorite) {
        const quoteToMove = [...favoriteQuotes, ...recentQuotes].find(
          (q) => q.id === quoteId,
        );
        if (quoteToMove) {
          const updatedQuote = { ...quoteToMove, isFavorite: true };
          setFavoriteQuotes((prev) => [updatedQuote, ...prev]);
          setRecentQuotes((prev) => prev.filter((q) => q.id !== quoteId));
        }
      } else {
        setFavoriteQuotes((prev) => prev.filter((q) => q.id !== quoteId));
        const quoteToMove = initialFavoriteQuotes?.find(
          (q) => q.id === quoteId,
        );
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

  const canAddFavorite = favoriteQuotes.length < MAX_FAVORITES;

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
            <p className="text-sm text-foreground-muted truncate">
              {user.email}
            </p>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Stats - reactive */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-background-muted rounded-xl">
              {quoteCount !== undefined ? (
                <>
                  <BookOpen size={24} className="text-primary" />
                  <div className="text-center">
                    <div className="text-2xl font-bold">{quoteCount}</div>
                    <div className="text-xs text-foreground-subtle">
                      {t(locale, "profilePage.totalQuotes")}
                    </div>
                  </div>
                </>
              ) : (
                <StatNotFound
                  icon={<Frown />}
                  text={t(locale, "errors.notFound")}
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-background-muted rounded-xl">
              {currentFavoriteCount !== undefined ? (
                <>
                  <Star size={24} className="text-warning" />
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {currentFavoriteCount}
                    </div>
                    <div className="text-xs text-foreground-subtle">
                      {t(locale, "profilePage.favoriteQuotes")}
                    </div>
                  </div>{" "}
                </>
              ) : (
                <StatNotFound
                  icon={<Frown />}
                  text={t(locale, "errors.notFound")}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Quotes Section - always show */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star size={20} className="text-warning" />
          {t(locale, "profilePage.favoritesSection")}
        </h2>
        {favoriteQuotes.length > 0 ? (
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {favoriteQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onToggleFavorite={handleToggleFavorite}
                isTogglingFavorite={pendingFavoriteId === quote.id}
                canAddFavorite={canAddFavorite}
                userName={currentUserName}
                userImage={currentUserImage}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="bg-background-elevated border border-border rounded-xl p-8 text-center">
            <Star size={32} className="mx-auto text-foreground-muted mb-3" />
            <p className="text-foreground-muted">
              {t(locale, "profilePage.noFavoritesDescription")}
            </p>
          </div>
        )}
      </div>

      {/* Recent Quotes Section */}
      {error ? (
        <div className="bg-background-elevated border border-border rounded-xl p-8 text-center">
          <BookOpen size={32} className="mx-auto text-danger mb-3" />
          <p className="text-foreground-muted">
            {t(locale, "profilePage.loadError")}
          </p>
        </div>
      ) : recentQuotes && recentQuotes.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              {t(locale, "profilePage.recentSection")}
            </h2>
            <a
              href={getLocalizedPath('/quotes', locale)}
              className="text-sm text-primary hover:underline transition-colors"
            >
              View all &rarr;
            </a>
          </div>
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {recentQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onToggleFavorite={handleToggleFavorite}
                isTogglingFavorite={pendingFavoriteId === quote.id}
                canAddFavorite={canAddFavorite}
                userName={currentUserName}
                userImage={currentUserImage}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-background-elevated border border-border rounded-xl p-8 text-center">
          <BookOpen size={32} className="mx-auto text-foreground-muted mb-3" />
          <p className="text-foreground-muted">
            {t(locale, "profilePage.noQuotesDescription")}
          </p>
        </div>
      )}
    </div>
  );
}

export function ProfileDataComponent(props: ProfileDataProps) {
  const { error } = props;

  if (error) {
    dispatchToastEvent({
      titleKey: "errors.generic",
      descriptionKey: "errors.serverError",
      variant: "destructive",
    });
  }
  return (
    <QueryProvider>
      <ProfileData {...props} />
    </QueryProvider>
  );
}

export function StatNotFound({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="text-center flex flex-col items-center gap-2">
      {icon}
      <p>{text}</p>
    </div>
  );
}
