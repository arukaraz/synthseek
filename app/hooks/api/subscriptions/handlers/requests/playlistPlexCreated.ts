import { ContentType, type PlaylistPlexCreatedPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handlePlaylistPlexCreated(event: PlaylistPlexCreatedPayload, utils: Utils): void {
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;
    return old.map((item) => {
      if (item.contentType !== ContentType.enum.playlist || item.id !== event.playlistId) return item;
      return { ...item, plex_playlist_id: event.plexPlaylistId };
    });
  });
}
