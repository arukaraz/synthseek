import { REQUEST_DOCK_AUTO_DISMISS_MS } from "./constants";
import {
  autoDismiss,
  buildDockItems,
  correlateDockJob,
  findRunningRequestJobId,
  seedDockJob,
  setDockJobStatus,
  stashPendingTerminal,
} from "./store";
import type { DockItem, DockJobStatus } from "./types";

function requestDockItems(name: string, trackCount: number): DockItem[] {
  const total = Math.max(trackCount, 1);
  const seed = Array.from({ length: total }, (_, index) => ({
    key: `track-${index}`,
    name: index === 0 ? name : "",
  }));
  return buildDockItems(seed);
}

export function seedRequestDockJob(args: { name: string; trackCount: number }): string {
  const id = crypto.randomUUID();
  seedDockJob({
    id,
    kind: "request",
    items: requestDockItems(args.name, args.trackCount),
    status: "running",
  });
  return id;
}

export function correlateRequestDockJob(jobId: string, requestId: string): void {
  correlateDockJob(jobId, requestId);
}

export function settleRequestDockJob(jobId: string, status: DockJobStatus, withAutoDismiss: boolean): void {
  setDockJobStatus(jobId, status);
  if (withAutoDismiss) autoDismiss(jobId, REQUEST_DOCK_AUTO_DISMISS_MS);
}

export function settleRequestDockJobByRequestId(requestId: string, status: DockJobStatus): void {
  const jobId = findRunningRequestJobId(requestId);
  if (!jobId) {
    stashPendingTerminal(requestId, status);
    return;
  }
  setDockJobStatus(jobId, status);
}
