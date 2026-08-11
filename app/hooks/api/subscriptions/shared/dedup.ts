import { SubscriptionEventType, type SubscriptionEvent } from "@api/__generated__/types";

const DEDUP_WINDOW_MS = 1000;
const DEDUP_MAX_ENTRIES = 100;

function eventKey(event: SubscriptionEvent): string {
  switch (event.eventType) {
    case SubscriptionEventType.TrackUpdate:
      return `${event.eventType}:${event.requestId}:${event.status}:${event.progress ?? ""}`;
    case SubscriptionEventType.AlbumUpdate:
      return `${event.eventType}:${event.albumId}:${event.status}:${event.completedTracks}`;
    case SubscriptionEventType.PlaylistUpdate:
      return `${event.eventType}:${event.playlistId}:${event.status}:${event.completedTracks}:${event.populatePhase ?? ""}`;
    case SubscriptionEventType.PlaylistPlexCreated:
      return `${event.eventType}:${event.playlistId}:${event.plexPlaylistId}`;
    case SubscriptionEventType.PlexSyncAllProgress:
      return `${event.eventType}:${event.phase}:${event.synced}`;
    case SubscriptionEventType.VersionUpdate:
      return `${event.eventType}:${event.latestVersion}`;
    case SubscriptionEventType.SettingsUpdate:
      return `${event.eventType}:${event.changedKey}`;
    case SubscriptionEventType.PortabilityProgress:
      return `${event.eventType}:${event.jobId}:${event.processed}`;
    case SubscriptionEventType.LibraryImportProgress:
      return `${event.eventType}:${event.jobId}:${event.item?.key ?? event.phase}:${event.item?.state ?? ""}`;
    case SubscriptionEventType.DropImportUpdate:
      return `${event.eventType}:${event.batchId}:${event.status}:${event.importedFiles}:${event.alreadyInLibraryFiles}:${event.pendingFiles}:${event.failedFiles}:${event.discardedFiles}:${event.file?.id ?? ""}:${event.file?.status ?? ""}`;
  }
}

export function isDuplicate(event: SubscriptionEvent, cache: Map<string, number>): boolean {
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
