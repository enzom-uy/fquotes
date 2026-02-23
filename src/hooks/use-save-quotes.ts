import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BookResult } from "./use-book-search";
import { handleApiError } from "./use-api-error";

interface QuotePayload {
  text: string;
  chapter?: string;
  isPublic: boolean;
  isFavorite: boolean;
  tags?: string[];
}

interface CreateQuotesPayload {
  userId: string;
  bookId?: string;
  openlibraryId?: string;
  quotes: QuotePayload[];
}

/**
 * Mutation hook to save quotes grouped by book.
 * Accepts an array of payloads (one per book group) and sends them in parallel.
 */
export function useSaveQuotes() {
  return useMutation({
    mutationFn: async (payloads: CreateQuotesPayload[]) => {
      const responses = await Promise.all(
        payloads.map((payload) => api.post("/quotes", payload)),
      );
      return responses;
    },
    onError: (error) => {
      handleApiError(error, "Failed to save quotes");
    },
  });
}

/**
 * Helper to group quotes metadata by their selected book into CreateQuotesPayload[].
 */
export function buildQuotePayloads(
  quotesMetadata: {
    text: string;
    chapter: string;
    isPublic: boolean;
    tags: string[];
  }[],
  selectedBooks: (BookResult | null)[],
  userId: string,
): CreateQuotesPayload[] {
  const bookGroups = new Map<
    string,
    { book: BookResult; indices: number[] }
  >();

  quotesMetadata.forEach((_, index) => {
    const book = selectedBooks[index]!;
    const key = `${book.bookId ?? ""}-${book.openlibraryId ?? ""}-${book.title}`;

    if (!bookGroups.has(key)) {
      bookGroups.set(key, { book, indices: [] });
    }
    bookGroups.get(key)!.indices.push(index);
  });

  return Array.from(bookGroups.values()).map(({ book, indices }) => ({
    userId,
    ...(book.bookId && { bookId: book.bookId }),
    ...(book.openlibraryId && { openlibraryId: book.openlibraryId }),
    quotes: indices.map((i) => {
      const q = quotesMetadata[i];
      return {
        text: q.text.trim(),
        ...(q.chapter && { chapter: q.chapter }),
        isPublic: q.isPublic,
        isFavorite: false,
        ...(q.tags.length > 0 && { tags: q.tags }),
      };
    }),
  }));
}
