import { ContentType, type PlaylistPlexCreatedPayload } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import { patchRequestListItems } from "../../../queries/requests/requestListCache";

export function handlePlaylistPlexCreated(event: PlaylistPlexCreatedPayload, queryClient: QueryClient): void {
  patchRequestListItems(queryClient, (item) =>
    item.contentType === ContentType.enum.playlist && item.id === event.playlistId
      ? { ...item, plex_playlist_id: event.plexPlaylistId }
      : item
  );
}
