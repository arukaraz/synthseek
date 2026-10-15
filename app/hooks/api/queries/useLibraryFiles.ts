import { skipToken } from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";
import { useCallback } from "react";

import type { AppRouter } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

const WATCH_REFETCH_MS = 8000;

type MovePreviewInput = inferRouterInputs<AppRouter>["library"]["files"]["previewMove"];

export function useLibraryMovePreview(input: MovePreviewInput | null) {
  return trpc.library.files.previewMove.useQuery(input ?? skipToken, { staleTime: 0 });
}

export function useLibraryFilesStatus(enabled: boolean, watching: boolean) {
  return trpc.library.files.status.useQuery(undefined, {
    enabled,
    staleTime: 0,
    refetchInterval: (query) => (watching || query.state.data?.running ? WATCH_REFETCH_MS : false),
  });
}

export function useRefreshLibraryAfterFileJob() {
  const utils = trpc.useUtils();
  return useCallback(() => {
    void utils.library.getTracks.invalidate();
    void utils.library.getAlbums.invalidate();
    void utils.library.getArtists.invalidate();
    void utils.library.getPlaylists.invalidate();
    void utils.library.getCounts.invalidate();
    void utils.library.paths.list.invalidate();
  }, [utils]);
}
