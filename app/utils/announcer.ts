type Listener = () => void;

export interface Announcement {
  id: number;
  text: string;
}

export const ANNOUNCEMENT_CLEAR_MS = 8000;

const EMPTY_ANNOUNCEMENT: Announcement = { id: 0, text: "" };

const listeners = new Set<Listener>();
let current: Announcement = EMPTY_ANNOUNCEMENT;
let sequence = 0;
let clearTimer: ReturnType<typeof setTimeout> | undefined;

function publish(next: Announcement): void {
  current = next;
  listeners.forEach((listener) => listener());
}

export function announce(text: string): void {
  clearTimeout(clearTimer);
  if (text === "") {
    if (current.text !== "") publish(EMPTY_ANNOUNCEMENT);
    return;
  }
  sequence += 1;
  publish({ id: sequence, text });
  clearTimer = setTimeout(() => {
    publish(EMPTY_ANNOUNCEMENT);
  }, ANNOUNCEMENT_CLEAR_MS);
}

export function resetAnnouncements(): void {
  clearTimeout(clearTimer);
  sequence = 0;
  publish(EMPTY_ANNOUNCEMENT);
}

export function subscribeAnnouncement(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readAnnouncement(): Announcement {
  return current;
}
