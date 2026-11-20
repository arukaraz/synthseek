import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useRequest } from "../requests/useRequest";
import { suggestedTrackRequest } from "./helpers";
import type { SuggestedTrackToAdd } from "./types";

export function useAddSuggestedTrack(playlistId: string) {
  const utils = trpc.useUtils();
  const request = useRequest();
  const link = trpc.playlists.addTracks.useMutation({
    onError: (error) => errorToast(error, "playlists.tracksAddedFailed"),
  });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { mutateAsync: requestTrack } = request;
  const { mutateAsync: linkTracks } = link;

  const add = useCallback(
    async (track: SuggestedTrackToAdd): Promise<boolean> => {
      setPendingId(track.externalId);
      try {
        const requestId = track.requestId ?? (await requestTrack(suggestedTrackRequest(track))).requestDbId;
        await linkTracks({ playlistId, trackIds: [requestId] });
        toast.success(i18n.t("mutations:playlists.suggestionAdded", { title: track.title }));
        return true;
      } catch {
        return false;
      } finally {
        setPendingId(null);
        void utils.contentDetail.playlistDetail.invalidate();
        void utils.library.getPlaylists.invalidate();
      }
    },
    [linkTracks, playlistId, requestTrack, utils]
  );

  return { add, pendingId };
}
