import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BookResult } from "@/components/book-search";

export interface UpdateQuotePayload {
  text?: string;
  chapter?: string | null;
  isPublic?: boolean;
  tags?: string[] | null;
  bookId?: string;
  openlibraryId?: string;
}

async function updateQuote(userId: string, quoteId: string, payload: UpdateQuotePayload) {
  return api.patch(`/quotes/${userId}?quoteId=${quoteId}`, payload);
}

export function useUpdateQuote() {
  return useMutation({
    mutationFn: ({ userId, quoteId, payload }: { userId: string; quoteId: string; payload: UpdateQuotePayload }) =>
      updateQuote(userId, quoteId, payload),
  });
}
