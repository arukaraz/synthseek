import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSpotifyRunSyncNow() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.runSyncNow.useMutation({
    onSuccess: (summary) => {
      const total = summary.newPlaylists + summary.updatedPlaylists + summary.newSavedAlbums;
      if (total > 0) {
        const description = [
          summary.newPlaylists && i18n.t("mutations:spotify.syncNewPlaylists", { count: summary.newPlaylists }),
          summary.updatedPlaylists &&
            i18n.t("mutations:spotify.syncUpdatedPlaylists", { count: summary.updatedPlaylists }),
          summary.newSavedAlbums && i18n.t("mutations:spotify.syncSavedAlbums", { count: summary.newSavedAlbums }),
        ]
          .filter(Boolean)
          .join(" · ");
        toast.success(i18n.t("mutations:spotify.syncComplete", { count: total }), { description });
        utils.requests.invalidate();
      } else {
        toast.info(i18n.t("mutations:spotify.libraryUpToDate"));
      }
    },
    onError: (error) => errorToast(error, "spotify.syncFailed"),
  });
}

export function useSpotifySyncPlaylistNow() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.syncPlaylistNow.useMutation({
    onSuccess: (result) => {
      if (result.status === "synced") {
        toast.success(i18n.t("mutations:spotify.playlistSyncQueued"));
        utils.requests.invalidate();
      } else if (result.status === "no_change") {
        toast.info(i18n.t("mutations:spotify.playlistUpToDate"));
      } else if (result.status === "not_synced_provider") {
        toast.error(i18n.t("mutations:spotify.playlistNotLinked"));
      } else {
        toast.error(i18n.t("mutations:spotify.playlistNotFound"));
      }
    },
    onError: (error) => errorToast(error, "spotify.syncFailed"),
  });
}

export function useSpotifyProbeProfile() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.probeProfile.useMutation({
    onSuccess: (result) => {
      if (result.status === "ok") {
        const username =
          result.externalUsername ?? result.externalUserId ?? i18n.t("mutations:spotify.readyFallbackUser");
        toast.success(i18n.t("mutations:spotify.ready"), {
          description: i18n.t("mutations:spotify.readyDescription", { username }),
        });
      } else if (result.status === "still_restricted") {
        toast.warning(i18n.t("mutations:spotify.restricted"), {
          description: i18n.t("mutations:spotify.restrictedDescription"),
          duration: 8000,
        });
      } else {
        toast.error(i18n.t("mutations:spotify.noConnection"));
      }
      utils.librarySource.spotify.getConnectionStatus.invalidate();
    },
  });
}
