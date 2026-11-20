import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { useCallback } from "react";

import type { RenamePlaylistInput } from "./types";

export function useSavePlaylistName() {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.playlists.rename.useMutation({
    onError: (error) => errorToast(error, "playlists.renameFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      return utils.contentDetail.playlistDetail.invalidate();
    },
  });

  return useCallback(
    (input: RenamePlaylistInput): Promise<void> => mutateAsync(input).then(() => undefined),
    [mutateAsync]
  );
}
