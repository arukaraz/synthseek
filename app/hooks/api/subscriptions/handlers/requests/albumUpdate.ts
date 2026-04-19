import { ContentType, type AlbumUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handleAlbumUpdate(event: AlbumUpdatePayload, utils: Utils): void {
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;
    return old.map((item) => {
      if (item.contentType !== ContentType.enum.album || item.id !== event.albumId) return item;
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
