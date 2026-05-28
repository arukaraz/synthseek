import { ContentType, type PlaylistUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handlePlaylistUpdate(event: PlaylistUpdatePayload, utils: Utils): void {
  const current = utils.requests.getAll.getData();
  const exists = current?.some(
    (item) => item.contentType === ContentType.enum.playlist && item.id === event.playlistId
  );
  if (!exists) {
    void utils.requests.getAll.invalidate();
    return;
  }
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;
    return old.map((item) => {
      if (item.contentType !== ContentType.enum.playlist || item.id !== event.playlistId) return item;
      return {
        ...item,
        status: event.status,
        completed_tracks: event.completedTracks,
        total_tracks: event.totalTracks,
        updated_at: new Date(),
      };
    });
  });
}
