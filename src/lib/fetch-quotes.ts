import type { QuoteData } from "@/components/quotes-manager";

export interface FetchQuotesOptions {
  userId: string;
  perPage?: number;
  page?: number;
  cookieHeader: string;
}

export interface PaginatedQuotesResponse {
  data: QuoteData[];
  count: number;
  page: number;
  perPage: number;
}

export interface FetchQuotesResult {
  quotes: QuoteData[];
  totalQuotes: number;
  error: string;
}

const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE = 0;

/**
 * Fetches paginated quotes for a specific user from the backend
 * 
 * @param options - Configuration options for fetching quotes
 * @param options.userId - The ID of the user whose quotes to fetch
 * @param options.perPage - Number of quotes per page (default: 10)
 * @param options.page - Page number (0-indexed, default: 0)
 * @param options.cookieHeader - Cookie header string for authentication
 * 
 * @returns Object containing quotes array, total count, and any error message
 * 
 * @example
 * ```ts
 * // Basic usage with defaults (10 per page, page 0)
 * const result = await fetchUserQuotes({
 *   userId: user.id,
 *   cookieHeader: Astro.request.headers.get('cookie') || '',
 * });
 * 
 * // Custom pagination
 * const result = await fetchUserQuotes({
 *   userId: user.id,
 *   perPage: 20,
 *   page: 2, // Third page (0-indexed)
 *   cookieHeader: Astro.request.headers.get('cookie') || '',
 * });
 * 
 * // Destructure result
 * const { quotes, totalQuotes, error } = await fetchUserQuotes({
 *   userId: user.id,
 *   cookieHeader: cookieHeader,
 * });
 * ```
 */
export async function fetchUserQuotes(
  options: FetchQuotesOptions
): Promise<FetchQuotesResult> {
  const {
    userId,
    perPage = DEFAULT_PER_PAGE,
    page = DEFAULT_PAGE,
    cookieHeader,
  } = options;

  try {
    const response = await fetch(
      `${BACKEND_URL}/quotes/user/${userId}?perPage=${perPage}&page=${page}`,
      {
        headers: {
          cookie: cookieHeader,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const result: PaginatedQuotesResponse = await response.json();
    
    return {
      quotes: result.data,
      totalQuotes: result.count,
      error: '',
    };
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return {
      quotes: [],
      totalQuotes: 0,
      error: 'Failed to load quotes. Please try again later.',
    };
  }
}

/**
 * Calculates pagination metadata
 * 
 * @param totalQuotes - Total number of quotes
 * @param currentPage - Current page number (1-indexed)
 * @param perPage - Number of quotes per page (default: 10)
 * 
 * @returns Object containing pagination information
 * 
 * @example
 * ```ts
 * const pagination = calculatePagination(45, 2, 10);
 * // Returns:
 * // {
 * //   totalPages: 5,
 * //   showingFrom: 11,
 * //   showingTo: 20,
 * //   pageNumbers: [1, 2, 3, '...', 5]
 * // }
 * ```
 */
export function calculatePagination(
  totalQuotes: number,
  currentPage: number,
  perPage: number = DEFAULT_PER_PAGE
) {
  const totalPages = Math.max(1, Math.ceil(totalQuotes / perPage));
  const showingFrom = totalQuotes === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingTo = Math.min(currentPage * perPage, totalQuotes);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];

    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');

    pages.push(totalPages);
    return pages;
  };

  return {
    totalPages,
    showingFrom,
    showingTo,
    pageNumbers: getPageNumbers(),
  };
}
