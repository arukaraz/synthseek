import { RequestStatus, type TrackRequest, type TrackUpdatePayload } from "@api/__generated__/types";
import type { AppRouter } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

type ContentDetailOutputs = inferRouterOutputs<AppRouter>["contentDetail"];
type AlbumDetail = ContentDetailOutputs["albumDetail"];
type ArtistTopTracks = ContentDetailOutputs["artistTopTracks"];
type PlaylistDetail = ContentDetailOutputs["playlistDetail"];
type RequestDetail = inferRouterOutputs<AppRouter>["requests"]["getDetail"];
type AlbumDetailTrack = AlbumDetail["tracks"][number];
type ArtistTopTrack = ArtistTopTracks[number];

function matchesTrack(track: { id: string; slskd_request_id: string }, event: TrackUpdatePayload): boolean {
  return track.id === event.requestId || track.slskd_request_id === event.requestId;
}

function applyEventToTrack<T extends TrackRequest>(track: T, event: TrackUpdatePayload): T {
  return {
    ...track,
    status: event.status,
    progress: event.progress ?? track.progress,
    error: event.status === RequestStatus.enum.failed ? (event.error ?? null) : null,
    failure_reason: event.failureReason !== undefined ? event.failureReason : track.failure_reason,
    downloaded_file: event.downloadedFile !== undefined ? event.downloadedFile : track.downloaded_file,
    updated_at: new Date(),
  };
}

function applyEventToDetailRow<T extends { slskd_request_id: string | null; status: AlbumDetailTrack["status"] }>(
  row: T,
  event: TrackUpdatePayload
): T {
  if (row.slskd_request_id === null || row.slskd_request_id !== event.requestId) return row;
  return {
    ...row,
    status: event.status,
    failureReason: event.failureReason !== undefined ? event.failureReason : null,
  };
}

function patchAlbumDetailCaches(event: TrackUpdatePayload, queryClient: QueryClient): void {
  queryClient.setQueriesData<AlbumDetail>({ queryKey: getQueryKey(trpc.contentDetail.albumDetail) }, (old) => {
    if (!old) return old;
    let changed = false;
    const tracks = old.tracks.map((track) => {
      const next = applyEventToDetailRow(track, event);
      if (next !== track) changed = true;
      return next;
    });
    if (!changed) return old;
    return { ...old, tracks };
  });
}

function patchArtistTopTracksCaches(event: TrackUpdatePayload, queryClient: QueryClient): void {
  queryClient.setQueriesData<ArtistTopTracks>({ queryKey: getQueryKey(trpc.contentDetail.artistTopTracks) }, (old) => {
    if (!old) return old;
    let changed = false;
    const next = old.map((row: ArtistTopTrack) => {
      const updated = applyEventToDetailRow(row, event);
      if (updated !== row) changed = true;
      return updated;
    });
    if (!changed) return old;
    return next;
  });
}

function patchPlaylistDetailCaches(event: TrackUpdatePayload, queryClient: QueryClient): void {
  queryClient.setQueriesData<PlaylistDetail>({ queryKey: getQueryKey(trpc.contentDetail.playlistDetail) }, (old) => {
    if (!old) return old;
    let changed = false;
    const tracks = old.tracks.map((track) => {
      const next = applyEventToDetailRow(track, event);
      if (next !== track) changed = true;
      return next;
    });
    if (!changed) return old;
    return { ...old, tracks };
  });
}

function patchRequestDetailCaches(event: TrackUpdatePayload, queryClient: QueryClient): void {
  queryClient.setQueriesData<RequestDetail>({ queryKey: getQueryKey(trpc.requests.getDetail) }, (old) => {
    if (!old) return old;

    let updated = false;
    const tracks = old.tracks.map((track) => {
      if (!matchesTrack(track, event)) return track;
      updated = true;
      return applyEventToTrack(track, event);
    });

    if (!updated) return old;
    return { ...old, tracks, updated_at: new Date() };
  });
}

export function handleTrackUpdate(event: TrackUpdatePayload, utils: Utils, queryClient: QueryClient): void {
  patchRequestDetailCaches(event, queryClient);
  patchAlbumDetailCaches(event, queryClient);
  patchArtistTopTracksCaches(event, queryClient);
  patchPlaylistDetailCaches(event, queryClient);
}
