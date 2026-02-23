import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { handleApiError } from "./use-api-error";

interface DeleteQuotesParams {
  userId: string;
  quotesIds: string[];
}

async function deleteQuotes({ userId, quotesIds }: DeleteQuotesParams) {
  return api.delete(`/quotes/${userId}`, { quotesIds });
}

export function useDeleteQuotes() {
  return useMutation({
    mutationFn: deleteQuotes,
    onError: (error) => {
      handleApiError(error, "Failed to delete quotes");
    },
  });
}
