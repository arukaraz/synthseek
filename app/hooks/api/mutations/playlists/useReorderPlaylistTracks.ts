import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { useCallback } from "react";

import type { ReorderPlaylistTracksInput } from "./types";

export function useReorderPlaylistTracks() {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.playlists.reorderTracks.useMutation({
    onError: (error) => errorToast(error, "playlists.reorderFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      return utils.contentDetail.playlistDetail.invalidate();
    },
  });

  return useCallback(
    (input: ReorderPlaylistTracksInput): Promise<void> =>
      mutateAsync(input).then(
        () => undefined,
        () => undefined
      ),
    [mutateAsync]
  );
}
