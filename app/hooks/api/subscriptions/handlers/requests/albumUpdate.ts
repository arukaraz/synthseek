import { ContentType, type AlbumUpdatePayload } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import type { trpc } from "@utils/trpc";
import { findCachedRequestListItem, patchRequestListItems } from "../../../queries/requests/requestListCache";
import { invalidateRequestList } from "../../shared/requestListInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

export function handleAlbumUpdate(event: AlbumUpdatePayload, utils: Utils, queryClient: QueryClient): void {
  const isEventAlbum = (item: { contentType: ContentType; id: string }) =>
    item.contentType === ContentType.enum.album && item.id === event.albumId;
  const cached = findCachedRequestListItem(queryClient, isEventAlbum);
  if (!cached || cached.status !== event.status) invalidateRequestList({ utils, queryClient });
  if (!cached) return;
  patchRequestListItems(queryClient, (item) =>
    isEventAlbum(item)
      ? {
          ...item,
          status: event.status,
          completed_tracks: event.completedTracks,
          total_tracks: event.totalTracks,
          updated_at: new Date(),
        }
      : item
  );
}
