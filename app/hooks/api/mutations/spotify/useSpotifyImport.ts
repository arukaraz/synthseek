import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useSpotifyImport() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.importSelection.useMutation({
    onSuccess: (report) => {
      const total = report.playlists.imported + report.likedSongs.imported + report.savedAlbums.imported;
      if (total > 0) {
        toast.success(`Imported ${total} item${total === 1 ? "" : "s"} from Spotify`);
      } else {
        toast.info("Nothing to import — items may already exist");
      }
      utils.requests.invalidate();
    },
    onError: (error) => toast.error(error.message || "Spotify import failed"),
  });
}

export function useSpotifyRunSyncNow() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.runSyncNow.useMutation({
    onSuccess: (summary) => {
      const total = summary.newPlaylists + summary.updatedPlaylists + summary.newLikedTracks + summary.newSavedAlbums;
      if (total > 0) {
        toast.success(`Sync complete: ${total} change${total === 1 ? "" : "s"}`, {
          description: [
            summary.newPlaylists && `${summary.newPlaylists} new playlist${summary.newPlaylists === 1 ? "" : "s"}`,
            summary.updatedPlaylists && `${summary.updatedPlaylists} updated`,
            summary.newLikedTracks && `${summary.newLikedTracks} liked song${summary.newLikedTracks === 1 ? "" : "s"}`,
            summary.newSavedAlbums && `${summary.newSavedAlbums} saved album${summary.newSavedAlbums === 1 ? "" : "s"}`,
          ]
            .filter(Boolean)
            .join(" · "),
        });
        utils.requests.invalidate();
      } else {
        toast.info("Library is up to date");
      }
    },
    onError: (error) => toast.error(error.message || "Sync failed"),
  });
}

export function useSpotifySyncPlaylistNow() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.syncPlaylistNow.useMutation({
    onSuccess: (result) => {
      if (result.status === "synced") {
        toast.success("Playlist sync queued new tracks");
        utils.requests.invalidate();
      } else if (result.status === "no_change") {
        toast.info("Playlist is already up to date");
      } else if (result.status === "not_synced_provider") {
        toast.error("Playlist isn't linked to a Spotify source");
      } else {
        toast.error("Playlist not found");
      }
    },
    onError: (error) => toast.error(error.message || "Sync failed"),
  });
}

export function useSpotifyProbeProfile() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.probeProfile.useMutation({
    onSuccess: (result) => {
      if (result.status === "ok") {
        toast.success("Spotify is ready", {
          description: `Connected as ${result.externalUsername ?? result.externalUserId ?? "Spotify user"}.`,
        });
      } else if (result.status === "still_restricted") {
        toast.warning("Spotify restricted", {
          description: "Try again in a few minutes.",
          duration: 8000,
        });
      } else {
        toast.error("No Spotify connection found");
      }
      utils.librarySource.spotify.getConnectionStatus.invalidate();
    },
  });
}
