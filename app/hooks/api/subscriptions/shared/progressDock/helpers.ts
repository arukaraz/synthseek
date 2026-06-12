import type { DockItem, DockJobStatus } from "./types";

interface DockCounts {
  done: number;
  skipped: number;
  failed: number;
  total: number;
}

export function countDockItems(items: ReadonlyArray<DockItem>): DockCounts {
  let done = 0;
  let skipped = 0;
  let failed = 0;
  for (const item of items) {
    if (item.state === "failed") failed += 1;
    else if (item.state === "skipped") skipped += 1;
    else if (item.state === "done") done += 1;
  }
  return { done, skipped, failed, total: items.length };
}

export function deriveTerminalStatus(resolved: number, failed: number): DockJobStatus {
  if (failed === 0) return "complete";
  if (resolved === 0) return "failed";
  return "partial";
}

export function terminalStatusFromCounts(synced: number, failed: number): DockJobStatus {
  return deriveTerminalStatus(synced, failed);
}
