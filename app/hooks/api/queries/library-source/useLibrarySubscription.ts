import { trpc } from "@utils/trpc";

import type { LibrarySourceProvider } from "./types";

export function useLibrarySubscription(provider: LibrarySourceProvider) {
  return trpc.librarySource.subscription.get.useQuery(
    { provider },
    {
      staleTime: 30 * 1000,
    }
  );
}
