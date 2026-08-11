import { PLEX_SYNC_DOCK_ID } from "./constants";
import { seedDockJob } from "./store";
import type { PlexSyncSeedItem } from "./types";

export function seedPlexSyncDockJob(items: ReadonlyArray<PlexSyncSeedItem>): void {
  seedDockJob({
    id: PLEX_SYNC_DOCK_ID,
    kind: "plex-sync",
    items: items.map((item) => ({ key: item.id, name: item.name, state: item.state ?? "pending" })),
    status: "running",
  });
}
