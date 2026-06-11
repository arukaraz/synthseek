import { DOCK_RESOLVED_STATES } from "./constants";
import type { DockItem, DockJobStatus } from "./types";

interface DockCounts {
  done: number;
  failed: number;
  total: number;
}

export function countDockItems(items: ReadonlyArray<DockItem>): DockCounts {
  let done = 0;
  let failed = 0;
  for (const item of items) {
    if (item.state === "failed") failed += 1;
    else if (DOCK_RESOLVED_STATES.has(item.state)) done += 1;
  }
  return { done, failed, total: items.length };
}

export function deriveTerminalStatus(done: number, failed: number): DockJobStatus {
  if (failed === 0) return "complete";
  if (done === 0) return "failed";
  return "partial";
}

export function terminalStatusFromCounts(synced: number, failed: number): DockJobStatus {
  return deriveTerminalStatus(synced, failed);
}
