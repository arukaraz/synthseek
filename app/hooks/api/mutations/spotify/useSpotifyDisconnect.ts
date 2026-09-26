import { toast } from "sonner";

import i18n from "@locale";
import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const SPOTIFY_META: ErrorMutationMeta = { errorCategory: "spotify" };

export function useSpotifyDisconnect() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.disconnect.useMutation({
    meta: SPOTIFY_META,
    onSuccess: () => {
      toast.success(i18n.t("mutations:spotify.disconnected"));
      utils.librarySource.spotify.getConnectionStatus.invalidate();
      utils.librarySource.provider.all.invalidate();
      utils.librarySource.spotify.listPlaylists.invalidate();
      utils.librarySource.spotify.listSavedAlbums.invalidate();
    },
  });
}
