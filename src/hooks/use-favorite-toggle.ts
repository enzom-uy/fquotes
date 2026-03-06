import { useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "./use-api-error";

export const MAX_FAVORITES = 5;

interface UseFavoriteToggleOptions {
  userId: string;
  onSuccess?: (isFavorite: boolean, quoteId: string) => void;
  onError?: () => void;
}

interface ToggleResult {
  mutate: (variables: { quoteId: string; isFavorite: boolean }) => void;
  isPending: boolean;
}

export function useFavoriteToggle({
  userId,
  onSuccess,
  onError,
}: UseFavoriteToggleOptions): ToggleResult {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ quoteId, isFavorite }: { quoteId: string; isFavorite: boolean }) => {
      return api.patch(`/quotes/user/${userId}?quoteId=${quoteId}`, { isFavorite });
    },
    onMutate: ({ quoteId }) => {
      setPendingId(quoteId);
    },
    onSuccess: (_, { quoteId, isFavorite }) => {
      setPendingId(null);
      onSuccess?.(isFavorite, quoteId);
      toast({
        title: isFavorite ? "Added to favorites" : "Removed from favorites",
      });
    },
    onError: (error) => {
      setPendingId(null);
      onError?.();
      const message = handleApiError(error, "Failed to update favorite. Please try again.");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: pendingId !== null,
  };
}

export function useIsFavoritePending(quoteId: string, pendingId: string | null): boolean {
  return pendingId === quoteId;
}
