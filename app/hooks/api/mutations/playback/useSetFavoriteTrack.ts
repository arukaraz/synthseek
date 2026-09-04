import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetFavoriteTrack() {
  const utils = trpc.useUtils();

  return trpc.playback.setFavoriteTrack.useMutation({
    onError: (error) => errorToast(error, "playback.favoriteFailed"),
    onSettled: () => {
      void utils.playback.favoriteTrackIds.invalidate();
    },
  });
}
