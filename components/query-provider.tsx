"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

function makeQueryClient() {
    const queryClient: QueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                // Only a failed first load reaches the error boundary; a failed background refetch keeps showing cached data
                throwOnError: (_error, query) => query.state.data === undefined,
            },
        },
        mutationCache: new MutationCache({
            // Writes often touch several screens (an invoice changes client totals and the dashboard), so refresh everything.
            // Returning the promise keeps the mutation pending until fresh data is in.
            onSettled: () => queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== "user" }),
        }),
    });
    return queryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // One cache per mount of the signed-in area, so signing out and back in never shows the previous user's data
    const [queryClient] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools buttonPosition="bottom-left" />
        </QueryClientProvider>
    );
}
