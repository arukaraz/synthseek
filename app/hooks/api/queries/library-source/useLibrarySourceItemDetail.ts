import { skipToken } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import type { LibrarySourceItemType, LibrarySourceProvider } from "./types";

export function useLibrarySourceItemDetail(
  provider: LibrarySourceProvider,
  id: string | null,
  type: LibrarySourceItemType | null,
  enabled = true
) {
  return trpc.librarySource.provider.itemDetail.useQuery(
    enabled && id !== null && type !== null ? { provider, id, type } : skipToken,
    { staleTime: 30 * 1000 }
  );
}
