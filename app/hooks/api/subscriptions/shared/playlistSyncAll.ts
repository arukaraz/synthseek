import type { MediaServerKey } from "@api/__generated__/types";

export interface PlaylistSyncAllUpdate {
  server: MediaServerKey;
  phase: "start" | "progress" | "complete";
  synced: number;
  total: number;
  failed?: number;
}

type Listener = (update: PlaylistSyncAllUpdate) => void;

const listeners = new Set<Listener>();

export function emitPlaylistSyncAll(update: PlaylistSyncAllUpdate): void {
  listeners.forEach((listener) => listener(update));
}

export function subscribePlaylistSyncAll(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
