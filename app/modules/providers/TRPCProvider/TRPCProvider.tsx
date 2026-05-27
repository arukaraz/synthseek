"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { trpc, getTRPCClientConfig } from "@utils/trpc";
import { useClientSessionId } from "@modules/providers/ClientSessionIdProvider";
import type { TRPCProviderProps } from "./types";

export function TRPCProvider({ children }: TRPCProviderProps) {
  const clientSessionId = useClientSessionId();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() => trpc.createClient(getTRPCClientConfig(clientSessionId)));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
