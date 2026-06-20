"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { trpc, getTRPCClientConfig } from "@utils/trpc";
import { ErrorBoundaryProvider } from "@modules/errors";
import { useClientSessionId } from "@modules/providers/ClientSessionIdProvider";
import { retryUnlessClientError } from "./helpers";
import { createQueryPersister, shouldDehydrateQuery } from "./persistence";
import { PERSIST_MAX_AGE, PERSIST_BUSTER } from "./constants";
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
            retry: retryUnlessClientError,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
          },
          mutations: {
            retry: retryUnlessClientError,
          },
        },
      })
  );

  const [trpcClient] = useState(() => trpc.createClient(getTRPCClientConfig(clientSessionId)));

  const [persister] = useState(() => createQueryPersister());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: PERSIST_MAX_AGE,
          buster: PERSIST_BUSTER,
          dehydrateOptions: { shouldDehydrateQuery },
        }}
      >
        <ErrorBoundaryProvider queryClient={queryClient}>{children}</ErrorBoundaryProvider>
      </PersistQueryClientProvider>
    </trpc.Provider>
  );
}
