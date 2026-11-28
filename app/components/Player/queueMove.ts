import type { KeyboardEvent } from "react";

import { QUEUE_MOVE_TARGETS } from "./constants";
import type { PlayerQueueEntry, PlayerTrack, QueueMoveTarget } from "./types";

export function queueMoveFromKey(event: KeyboardEvent): QueueMoveTarget | null {
  if (!event.altKey || event.ctrlKey || event.metaKey) return null;
  if (event.key === "ArrowUp") return event.shiftKey ? "top" : "up";
  if (event.key === "ArrowDown") return event.shiftKey ? "bottom" : "down";
  return null;
}

export function queueMoveDestination(target: QueueMoveTarget, from: number, total: number): number | null {
  const last = total - 1;
  const destination = {
    top: 0,
    up: Math.max(0, from - 1),
    down: Math.min(last, from + 1),
    bottom: last,
  }[target];
  return destination === from ? null : destination;
}

export function queueMoveTargetsFor(from: number, total: number): QueueMoveTarget[] {
  return QUEUE_MOVE_TARGETS.filter((target) => queueMoveDestination(target, from, total) !== null);
}

export function movedUpNext(upNext: readonly PlayerQueueEntry[], from: number, to: number): PlayerTrack[] {
  const tracks = upNext.map((entry) => entry.track);
  const [moved] = tracks.splice(from, 1);
  if (moved === undefined) return tracks;
  tracks.splice(to, 0, moved);
  return tracks;
}
