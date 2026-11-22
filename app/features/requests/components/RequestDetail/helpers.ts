import {
  ContentType,
  RequestStatus,
  type ActiveRelease,
  type RequestContainerType,
  type RequestListItem,
  type TrackRequest,
} from "@api/__generated__/types";
import { albumTarget, playlistLibraryTarget, type DetailTarget } from "@features/content-detail";
import { titleCase } from "@utils/formatters";
import { isCancellableStatus, isReimportableFailure } from "@utils/status-helpers";

import { compareByStatus } from "../../helpers";
import {
  BULK_ACTION_ORDER,
  TRACK_ACTION_META,
  TRACK_GROUP_BY_STATUS,
  TRACK_GROUP_ORDER,
  TRACK_SORT_KEYS,
} from "./consts";
import type {
  BulkActionCounts,
  ReleaseFigureFormat,
  TrackAction,
  TrackActionId,
  TrackActionPermissions,
  TrackGroup,
  TrackGroupCounts,
  TrackProvenance,
  TrackSort,
  TrackSortKey,
} from "./types";

export function trackGroupOf(track: TrackRequest): TrackGroup {
  return TRACK_GROUP_BY_STATUS[track.status];
}

export function countTrackGroups(tracks: TrackRequest[]): TrackGroupCounts {
  const counts: TrackGroupCounts = { done: 0, active: 0, review: 0, failed: 0, cancelled: 0 };
  for (const track of tracks) counts[trackGroupOf(track)] += 1;
  return counts;
}

export function presentTrackGroups(counts: TrackGroupCounts): TrackGroup[] {
  return TRACK_GROUP_ORDER.filter((group) => counts[group] > 0);
}

export function toTrackSortKey(field: string): TrackSortKey | null {
  return TRACK_SORT_KEYS.find((key) => key === field) ?? null;
}

export function nextTrackSort(current: TrackSort | null, key: TrackSortKey): TrackSort | null {
  if (current === null || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

export function hasMultipleDiscs(tracks: TrackRequest[]): boolean {
  return new Set(tracks.map((track) => track.disc_number)).size > 1;
}

export function trackNumberLabel(track: TrackRequest, position: number, isAlbum: boolean, discPrefix: boolean): string {
  if (!isAlbum) return String(position);
  return discPrefix ? `${track.disc_number}.${track.track_number}` : String(track.track_number);
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function nextRetryTime(track: TrackRequest): number {
  return track.next_retry_at ? new Date(track.next_retry_at).getTime() : Number.MAX_SAFE_INTEGER;
}

function sortValueMissing(track: TrackRequest, key: TrackSortKey): boolean {
  if (key === "source") return track.acquisition_source === null;
  if (key === "completed") return track.completed_at === null;
  return false;
}

function compareTracksBy(a: TrackRequest, b: TrackRequest, key: TrackSortKey, positions: Map<string, number>): number {
  switch (key) {
    case "number":
      return (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0);
    case "title":
      return compareText(a.title, b.title);
    case "artist":
      return compareText(a.credited_artist, b.credited_artist);
    case "status":
      return (
        compareByStatus(a.status, b.status) ||
        compareText(a.failure_reason ?? "", b.failure_reason ?? "") ||
        nextRetryTime(a) - nextRetryTime(b)
      );
    case "source":
      return compareText(a.acquisition_source ?? "", b.acquisition_source ?? "");
    case "completed":
      return new Date(a.completed_at ?? 0).getTime() - new Date(b.completed_at ?? 0).getTime();
  }
}

export function canonicalPositions(tracks: TrackRequest[]): Map<string, number> {
  return new Map(tracks.map((track, index) => [track.id, index + 1]));
}

export function orderTracks(
  tracks: TrackRequest[],
  filter: ReadonlySet<TrackGroup>,
  sort: TrackSort | null
): TrackRequest[] {
  const positions = canonicalPositions(tracks);
  const filtered = filter.size === 0 ? [...tracks] : tracks.filter((track) => filter.has(trackGroupOf(track)));
  if (sort === null) return filtered;
  const direction = sort.direction === "asc" ? 1 : -1;
  return filtered.sort((a, b) => {
    const missingA = sortValueMissing(a, sort.key);
    const missingB = sortValueMissing(b, sort.key);
    if (missingA !== missingB) return missingA ? 1 : -1;
    return (
      compareTracksBy(a, b, sort.key, positions) * direction || (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0)
    );
  });
}

function lockFor(id: TrackActionId, permissions: TrackActionPermissions): TrackAction {
  if (id === "approve" || id === "reject") return { id, lock: permissions.isAdmin ? null : "adminOnly" };
  return { id, lock: permissions.canManage ? null : "ownerOrAdmin" };
}

export function trackActionsFor(track: TrackRequest, permissions: TrackActionPermissions): TrackAction[] {
  const ids: TrackActionId[] = [];
  const isFailed = track.status === RequestStatus.enum.failed;
  if (track.status === RequestStatus.enum.pending_approval) ids.push("approve", "reject");
  if (isFailed) ids.push(isReimportableFailure(track.failure_reason, track.downloaded_file) ? "reimport" : "retry");
  if (track.status === RequestStatus.enum.cancelled) ids.push("requeue");
  if (track.status === RequestStatus.enum.queued && track.priority === 0) ids.push("prioritize");
  if (track.status === RequestStatus.enum.complete) ids.push("upgrade");
  if (isFailed) ids.push(track.watch_enabled ? "stopWatch" : "resumeWatch");
  if (isCancellableStatus(track.status)) ids.push("cancel");
  return ids.map((id) => lockFor(id, permissions));
}

export function bulkActionTargets(selected: TrackRequest[], permissions: TrackActionPermissions): BulkActionCounts {
  const targets: BulkActionCounts = {
    retry: [],
    requeue: [],
    prioritize: [],
    upgrade: [],
    approve: [],
    reject: [],
    cancel: [],
  };
  for (const track of selected) {
    for (const action of trackActionsFor(track, permissions)) {
      const bulk = TRACK_ACTION_META[action.id].bulk;
      if (bulk !== null && action.lock === null) targets[bulk].push(track);
    }
  }
  return targets;
}

export function availableBulkActions(targets: BulkActionCounts) {
  return BULK_ACTION_ORDER.filter((id) => targets[id].length > 0);
}

export function idsOfStatus(tracks: TrackRequest[], status: RequestStatus): string[] {
  return tracks.filter((track) => track.status === status).map((track) => track.id);
}

export function trackProvenance(track: TrackRequest, release: ActiveRelease | null): TrackProvenance | null {
  if (track.status === RequestStatus.enum.complete) {
    return track.acquisition_source === null
      ? null
      : { source: track.acquisition_source, ref: track.acquisition_ref, license: track.acquisition_license };
  }
  if (release === null || track.status === RequestStatus.enum.failed) return null;
  return { source: release.source, ref: release.title, license: null };
}

export function releaseFigures(release: ActiveRelease, format: ReleaseFigureFormat): string[] {
  const figures: string[] = [];
  if (release.totalBytes > 0) figures.push(format.size(release.doneBytes, release.totalBytes));
  if (release.etaMinutes !== null) figures.push(format.eta(release.etaMinutes));
  return figures;
}

export function formatDelegatedTo(delegatedTo: string | null): string | null {
  const trimmed = delegatedTo?.trim();
  if (!trimmed) return null;
  return titleCase(trimmed);
}

const DETAIL_TARGET_BY_CONTENT_TYPE: Record<RequestContainerType, (request: RequestListItem) => DetailTarget | null> = {
  [ContentType.enum.album]: (request) =>
    albumTarget({
      id: request.external_id,
      name: request.name,
      artistName: request.credited_artist,
      cover: request.album_art,
    }),
  [ContentType.enum.playlist]: (request) =>
    playlistLibraryTarget({
      id: request.id,
      name: request.name,
      cover: request.album_art,
    }),
};

export function requestDetailTarget(request: RequestListItem): DetailTarget | null {
  return DETAIL_TARGET_BY_CONTENT_TYPE[request.contentType](request);
}
