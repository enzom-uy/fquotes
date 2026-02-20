import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

// Singleton QueryClient shared across all Astro islands.
// This enables cache sharing between independent React trees.
let queryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60, // 1 minute
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
