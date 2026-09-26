import type { MediaServerKey } from "@api/__generated__/types";

import { PLAYLIST_SYNC_DOCK_ID } from "./constants";
import { seedDockJob } from "./store";
import type { PlaylistSyncSeedItem } from "./types";

export function seedPlaylistSyncDockJob(server: MediaServerKey, items: ReadonlyArray<PlaylistSyncSeedItem>): void {
  seedDockJob({
    id: PLAYLIST_SYNC_DOCK_ID,
    kind: "playlist-sync",
    provider: server,
    items: items.map((item) => ({ key: item.id, name: item.name, state: item.state ?? "pending" })),
    status: "running",
  });
}
