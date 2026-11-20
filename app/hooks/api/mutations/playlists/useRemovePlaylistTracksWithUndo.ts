import { useCallback } from "react";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { removedTracksMessage } from "./helpers";
import type { RemovePlaylistTracksInput, RemovedPlaylistTrack } from "./types";

export function useRemovePlaylistTracksWithUndo() {
  const utils = trpc.useUtils();
  const refresh = useCallback(() => {
    void utils.library.getPlaylists.invalidate();
    void utils.library.getTracks.invalidate();
    return utils.contentDetail.playlistDetail.invalidate();
  }, [utils]);
  const { mutateAsync, isPending } = trpc.playlists.removeTracks.useMutation({ onSettled: refresh });

  const restore = useCallback(
    (playlistId: string, removed: readonly RemovedPlaylistTrack[]) => {
      utils.client.playlists.restoreTracks
        .mutate({
          playlistId,
          placements: removed.map(({ trackId, position }) => ({ trackId, position })),
        })
        .catch((error: unknown) => errorToast(error, "playlists.tracksRestoreFailed"))
        .finally(refresh);
    },
    [utils, refresh]
  );

  const remove = useCallback(
    async ({ playlistId, removed, skipped }: RemovePlaylistTracksInput): Promise<boolean> => {
      if (removed.length === 0) return false;
      try {
        await mutateAsync({ playlistId, trackIds: removed.map((track) => track.trackId) });
      } catch (error) {
        errorToast(error, "playlists.tracksRemovedFailed");
        return false;
      }
      toast.success(removedTracksMessage(removed, skipped), {
        duration: TOAST_ACTION_DURATION_MS,
        action: { label: i18n.t("mutations:playlists.undo"), onClick: () => restore(playlistId, removed) },
      });
      return true;
    },
    [mutateAsync, restore]
  );

  return { remove, isPending };
}
