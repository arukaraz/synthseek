import { trpc } from "@utils/trpc";
import { useCallback } from "react";

import type { LibraryTracksInput } from "./types";

export function useLibraryTracksPrefetch() {
  const utils = trpc.useUtils();

  const prefetchNextPage = useCallback(
    (input: LibraryTracksInput, nextOffset: number) => {
      void utils.library.getTracks.prefetch({ ...input, offset: nextOffset });
    },
    [utils]
  );

  return { prefetchNextPage };
}
