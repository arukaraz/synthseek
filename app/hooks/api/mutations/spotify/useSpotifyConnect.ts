import { toast } from "sonner";

import i18n from "@locale";
import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const SPOTIFY_META: ErrorMutationMeta = { errorCategory: "spotify" };

export function useSpotifyConnect() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.getAuthUrl.useMutation({
    meta: SPOTIFY_META,
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
    onSettled: () => {
      utils.librarySource.spotify.getConnectionStatus.invalidate();
    },
  });
}

export function useSpotifyDisconnect() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.disconnect.useMutation({
    meta: SPOTIFY_META,
    onSuccess: () => {
      toast.success(i18n.t("mutations:spotify.disconnected"));
      utils.librarySource.spotify.getConnectionStatus.invalidate();
      utils.librarySource.spotify.listPlaylists.invalidate();
      utils.librarySource.spotify.listSavedAlbums.invalidate();
    },
  });
}
