import type { Locale } from "@/i18n";

export interface QuoteBook {
  id?: string;
  title: string;
  authorName: string | null;
  coverUrl?: string | null;
}

export interface QuoteData {
  id: string;
  text: string;
  chapter: string | null;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[] | null;
  createdAt: string;
  bookId: string;
  userId: string;
  book: QuoteBook | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalQuotes: number;
  showingFrom: number;
  showingTo: number;
  pageNumbers: (number | "...")[];
}

export interface QuotesManagerProps {
  userId: string;
  quotes: QuoteData[];
  pagination: PaginationInfo;
  fetchError: string;
  locale?: Locale;
}
