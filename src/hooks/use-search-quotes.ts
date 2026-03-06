import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { handleApiError } from "./use-api-error";

export interface QuoteBookInfo {
  title: string;
  authorName: string | null;
  coverUrl?: string | null;
}

export interface QuoteSearchResult {
  id: string;
  text: string;
  chapter: string | null;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[] | null;
  createdAt: string;
  bookId: string;
  userId: string;
  book: QuoteBookInfo | null;
}

export const quoteKeys = {
  all: ["quotes"] as const,
  search: (userId: string, query: string) =>
    [...quoteKeys.all, "search", userId, query] as const,
};

const MAX_SEARCH_RESULTS = 50;

async function searchQuotes(
  userId: string,
  query: string,
): Promise<QuoteSearchResult[]> {
  try {
    return await api.get<QuoteSearchResult[]>(
      `/quotes/user/${userId}/search?query=${encodeURIComponent(query)}`,
    );
  } catch (error) {
    handleApiError(error, "Failed to search quotes");
    throw error;
  }
}

/**
 * Hook to search quotes. Only fires when `query` is non-empty.
 * Returns up to 50 results from the backend.
 */
export function useSearchQuotes(userId: string, query: string) {
  const result = useQuery({
    queryKey: quoteKeys.search(userId, query),
    queryFn: () => searchQuotes(userId, query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // cache for 2 minutes
  });

  return {
    ...result,
    hitLimit: (result.data?.length ?? 0) >= MAX_SEARCH_RESULTS,
  };
}
