import { useCallback } from "react";

import { trpc } from "@utils/trpc";

export function useInvalidateLibrarySources() {
  const utils = trpc.useUtils();
  return useCallback(() => {
    void utils.librarySource.provider.all.invalidate();
    void utils.librarySource.spotify.getConnectionStatus.invalidate();
  }, [utils]);
}
