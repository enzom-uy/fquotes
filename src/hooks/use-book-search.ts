import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { handleApiError } from "./use-api-error";

export interface BookResult {
  title: string;
  authorName: string;
  bookId?: string;
  openlibraryId?: string;
  coverUrl?: string;
}

export const bookKeys = {
  all: ["books"] as const,
  search: (query: string) => [...bookKeys.all, "search", query] as const,
};

async function searchBooks(query: string): Promise<BookResult[]> {
  try {
    return await api.get<BookResult[]>(
      `/book/search?query=${encodeURIComponent(query)}`,
    );
  } catch (error) {
    handleApiError(error, "Failed to search books");
    throw error;
  }
}

/**
 * Hook to search for books with automatic debouncing via `enabled`.
 * The parent component handles debouncing the query string;
 * this hook fires when `debouncedQuery` changes and has >= 2 chars.
 */
export function useBookSearch(debouncedQuery: string) {
  return useQuery({
    queryKey: bookKeys.search(debouncedQuery),
    queryFn: () => searchBooks(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // cache book search results for 5 minutes
    placeholderData: (previousData) => previousData, // keep previous results while fetching new ones
  });
}
