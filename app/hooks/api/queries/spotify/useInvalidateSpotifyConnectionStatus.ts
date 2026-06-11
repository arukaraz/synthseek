import { useCallback } from "react";

import { trpc } from "@utils/trpc";

export function useInvalidateSpotifyConnectionStatus() {
  const utils = trpc.useUtils();
  return useCallback(() => {
    void utils.librarySource.spotify.getConnectionStatus.invalidate();
  }, [utils]);
}
