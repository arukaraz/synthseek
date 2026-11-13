import { SubscriptionEventType, type SubscriptionEvent } from "@api/__generated__/types";

const DEDUP_WINDOW_MS = 1000;
const DEDUP_MAX_ENTRIES = 100;

type StateCarryingEvent = Extract<
  SubscriptionEvent,
  {
    eventType:
      | SubscriptionEventType.UserActivity
      | SubscriptionEventType.ListeningNowUpdate
      | SubscriptionEventType.DropImportUpdate;
  }
>;

function eventKey(event: Exclude<SubscriptionEvent, StateCarryingEvent>): string {
  switch (event.eventType) {
    case SubscriptionEventType.MaintenanceUpdate:
      return `${event.eventType}:${event.surface}`;
    case SubscriptionEventType.TrackUpdate:
      return `${event.eventType}:${event.requestId}:${event.status}:${event.progress ?? ""}`;
    case SubscriptionEventType.AlbumUpdate:
      return `${event.eventType}:${event.albumId}:${event.status}:${event.completedTracks}`;
    case SubscriptionEventType.PlaylistUpdate:
      return `${event.eventType}:${event.playlistId}:${event.status}:${event.completedTracks}:${event.populatePhase ?? ""}`;
    case SubscriptionEventType.PlaylistPlexCreated:
      return `${event.eventType}:${event.playlistId}:${event.plexPlaylistId}`;
    case SubscriptionEventType.PlaylistSyncAllProgress:
      return `${event.eventType}:${event.server}:${event.phase}:${event.synced}`;
    case SubscriptionEventType.VersionUpdate:
      return `${event.eventType}:${event.latestVersion}`;
    case SubscriptionEventType.SettingsUpdate:
      return `${event.eventType}:${event.changedKey}`;
    case SubscriptionEventType.PortabilityProgress:
      return `${event.eventType}:${event.jobId}:${event.processed}`;
    case SubscriptionEventType.LibraryImportProgress:
      return `${event.eventType}:${event.jobId}:${event.item?.key ?? event.phase}:${event.item?.state ?? ""}`;
    case SubscriptionEventType.PlayerCommand:
      return `${event.eventType}:${event.deviceId}:${event.issuedAt}:${event.command}`;
    case SubscriptionEventType.PlaybackState:
      return `${event.eventType}:${event.deviceId}:${event.issuedAt}:${event.playing}:${event.track?.id ?? ""}:${event.positionSeconds}`;
    case SubscriptionEventType.ReleaseProgress:
      return `${event.eventType}:${event.userId}:${event.source}:${event.releaseKey}:${event.release?.state ?? "gone"}:${event.release?.percent ?? ""}:${event.release?.title ?? ""}:${event.release?.etaMinutes === null ? "no-eta" : "eta"}:${event.release?.trackRequestIds.join(",") ?? ""}`;
  }
}

export function isDuplicate(event: SubscriptionEvent, cache: Map<string, number>): boolean {
  if (event.eventType === SubscriptionEventType.UserActivity) return false;
  if (event.eventType === SubscriptionEventType.ListeningNowUpdate) return false;
  if (event.eventType === SubscriptionEventType.DropImportUpdate) return false;

  const key = eventKey(event);
  const lastTimestamp = cache.get(key);

  if (lastTimestamp && Date.now() - lastTimestamp < DEDUP_WINDOW_MS) {
    return true;
  }

  cache.set(key, Date.now());

  if (cache.size > DEDUP_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  return false;
}
