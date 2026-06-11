export interface PlexSyncAllUpdate {
  phase: "start" | "progress" | "complete";
  synced: number;
  total: number;
  failed?: number;
}

type Listener = (update: PlexSyncAllUpdate) => void;

const listeners = new Set<Listener>();

export function emitPlexSyncAll(update: PlexSyncAllUpdate): void {
  listeners.forEach((listener) => listener(update));
}

export function subscribePlexSyncAll(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
