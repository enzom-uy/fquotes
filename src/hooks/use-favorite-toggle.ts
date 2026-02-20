import { useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const MAX_FAVORITES = 5;

interface UseFavoriteToggleOptions {
  userId: string;
  onSuccess?: (isFavorite: boolean) => void;
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
      return api.patch(`/quotes/${userId}?quoteId=${quoteId}`, { isFavorite });
    },
    onMutate: ({ quoteId }) => {
      setPendingId(quoteId);
    },
    onSuccess: (_, { isFavorite }) => {
      setPendingId(null);
      onSuccess?.(isFavorite);
      toast({
        title: isFavorite ? "Added to favorites" : "Removed from favorites",
      });
    },
    onError: () => {
      setPendingId(null);
      onError?.();
      toast({
        title: "Error",
        description: "Failed to update favorite. Please try again.",
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
