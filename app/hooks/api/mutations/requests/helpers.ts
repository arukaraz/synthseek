import type { RequestListItem, RequestWithTracks, TrackRequest } from "@api/__generated__/types";
import { RequestStatus } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

type TrackPatch = (track: TrackRequest) => TrackRequest;

type CachedDetail = RequestWithTracks | null;

function detailQueryFilter() {
  return { queryKey: getQueryKey(trpc.requests.getDetail) };
}

export function patchCachedDetailTracks(queryClient: QueryClient, patch: TrackPatch, containerId?: string): void {
  queryClient.setQueriesData<CachedDetail>(detailQueryFilter(), (old) => {
    if (!old) return old;
    if (containerId !== undefined && old.id !== containerId) return old;
    return { ...old, tracks: old.tracks.map(patch) };
  });
}

function applyApproval(detail: RequestWithTracks, ids: Set<string>, nextStatus: RequestStatus) {
  const tracks = detail.tracks.map((track) =>
    ids.has(track.id) && track.status === RequestStatus.enum.pending_approval ? { ...track, status: nextStatus } : track
  );
  const stillPending = tracks.some((track) => track.status === RequestStatus.enum.pending_approval);
  const settled = detail.status === RequestStatus.enum.pending_approval && !stillPending;

  return { patched: { ...detail, tracks, status: settled ? nextStatus : detail.status }, settled };
}

export function patchCachedApprovalDecision(
  queryClient: QueryClient,
  utils: Utils,
  trackIds: string[],
  nextStatus: RequestStatus
): void {
  const ids = new Set(trackIds);
  const settledContainerIds = new Set<string>();

  for (const [, cached] of queryClient.getQueriesData<CachedDetail>(detailQueryFilter())) {
    if (!cached) continue;
    if (applyApproval(cached, ids, nextStatus).settled) settledContainerIds.add(cached.id);
  }

  queryClient.setQueriesData<CachedDetail>(detailQueryFilter(), (old) =>
    old ? applyApproval(old, ids, nextStatus).patched : old
  );

  if (settledContainerIds.size === 0) return;

  utils.requests.getAll.setData(undefined, (old?: RequestListItem[]) =>
    old?.map((item) => (settledContainerIds.has(item.id) ? { ...item, status: nextStatus } : item))
  );
}
