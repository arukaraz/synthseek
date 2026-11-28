type Listener = () => void;

const listeners = new Set<Listener>();
let current: string | null = null;

export function publishNowPlayingTitle(next: string | null): void {
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

export function subscribeNowPlayingTitle(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readNowPlayingTitle(): string | null {
  return current;
}
