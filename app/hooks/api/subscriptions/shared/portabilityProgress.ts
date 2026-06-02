export interface PortabilityProgressUpdate {
  processed: number;
  total: number;
  phase: "matching" | "resolving-mbid";
}

type Listener = (update: PortabilityProgressUpdate) => void;

const listeners = new Map<string, Set<Listener>>();

export function emitPortabilityProgress(jobId: string, update: PortabilityProgressUpdate): void {
  const set = listeners.get(jobId);
  if (!set) return;
  set.forEach((listener) => listener(update));
}

export function subscribePortabilityProgress(jobId: string, listener: Listener): () => void {
  const set = listeners.get(jobId) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(jobId, set);
  return () => {
    const current = listeners.get(jobId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) listeners.delete(jobId);
  };
}
