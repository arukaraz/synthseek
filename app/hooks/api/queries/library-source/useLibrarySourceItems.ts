import { trpc } from "@utils/trpc";

import type { LibrarySourceProvider } from "./types";

export function useLibrarySourceItems(provider: LibrarySourceProvider, enabled = true) {
  return trpc.librarySource.provider.items.useQuery(
    { provider },
    {
      enabled,
      staleTime: 30 * 1000,
    }
  );
}
