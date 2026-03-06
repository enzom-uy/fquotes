import {
  Calendar,
  Globe,
  Lock,
  BookOpen,
  User,
  Star,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { t, type Locale } from "@/i18n";
import type { QuoteData } from "@/components/quote-card";

interface QuoteAuthor {
  id: string;
  name: string;
  image: string | null;
}

interface QuoteDetailViewProps {
  quote: QuoteData;
  quoteAuthor: QuoteAuthor | null;
  locale: Locale;
  userIsOwner: boolean;
}

const formatDate = (dateString: string, locale: Locale) => {
  const date = new Date(dateString);
  const localeMap = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR",
  };
  return date.toLocaleDateString(localeMap[locale], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export function QuoteDetailView({
  quote,
  quoteAuthor,
  locale,
  userIsOwner,
}: QuoteDetailViewProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(locale, "quote.share"),
          text: `"${quote.text}" - ${quote.book?.title || "Unknown"}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share or browser doesn't support
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <a
          href={userIsOwner ? "/quotes" : "/"}
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>
            {userIsOwner
              ? t(locale, "quote.backToQuotes")
              : t(locale, "home.title")}
          </span>
        </a>

        {/* Quote card */}
        <div className="bg-background-elevated border border-border rounded-lg p-8 shadow-lg">
          {/* Author's Favorite badge */}
          {quote.isFavorite && !userIsOwner && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/30 rounded-full text-warning text-sm font-medium">
              <Star size={16} fill="currentColor" />
              <span>{t(locale, "quote.authorsFavorite")}</span>
            </div>
          )}

          {/* Quote text */}
          <blockquote className="text-xl leading-relaxed italic mb-6">
            &ldquo;{quote.text}&rdquo;
          </blockquote>

          {/* Book & Author Info */}
          {quote.book && (
            <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-border">
              <div className="flex items-start gap-3">
                <BookOpen
                  size={20}
                  className="text-primary flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold">
                    {quote.book.title}
                    {quote.chapter && (
                      <span className="text-foreground-muted font-normal">
                        , {quote.chapter}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {quote.book.authorName && (
                <div className="flex items-center gap-3">
                  <User size={20} className="text-accent flex-shrink-0" />
                  <p className="text-foreground-muted">
                    {t(locale, "quote.by")} {quote.book.authorName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {quote.tags && quote.tags.length > 0 && (
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex flex-wrap gap-2">
                {quote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm text-foreground-subtle bg-background-muted px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2 text-sm text-foreground-muted">
              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {t(locale, "quote.addedOn")}{" "}
                  {formatDate(quote.createdAt, locale)}
                </span>
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-2">
                {quote.isPublic ? (
                  <>
                    <Globe size={16} className="text-success" />
                    <span>{t(locale, "quote.public")}</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>{t(locale, "quote.private")}</span>
                  </>
                )}
              </div>

              {/* Favorite indicator (only for owner) */}
              {quote.isFavorite && userIsOwner && (
                <div className="flex items-center gap-2 text-warning">
                  <Star size={16} fill="currentColor" />
                  <span>{t(locale, "quote.favorite")}</span>
                </div>
              )}
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              <Share2 size={18} />
              <span>{t(locale, "quote.share")}</span>
            </button>
          </div>

          {/* Quote author section */}
          {quoteAuthor && (
            <div className="mt-6 pt-6 border-t border-border">
              <a
                href={`/profile/${quoteAuthor.id}`}
                className="inline-flex items-center gap-3 text-foreground-muted hover:text-primary transition-colors group"
              >
                {quoteAuthor.image ? (
                  <img
                    src={quoteAuthor.image}
                    alt={quoteAuthor.name}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-background-muted flex items-center justify-center border border-border">
                    <User size={20} className="text-foreground-muted" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-foreground-subtle">
                    {t(locale, "capture.author")}:
                  </span>
                  <span className="font-medium group-hover:underline">
                    {quoteAuthor.name}
                  </span>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
