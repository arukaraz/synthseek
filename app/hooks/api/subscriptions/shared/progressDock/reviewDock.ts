import { REVIEW_DOCK_AUTO_DISMISS_MS, REVIEW_DOCK_ID } from "./constants";
import type { DockJob } from "./types";
import {
  appendDockItems,
  autoDismiss,
  buildDockItems,
  cancelAutoDismiss,
  finalizeDockJob,
  getDockJob,
  markDockItem,
  seedDockJob,
  setDockJobStatus,
} from "./store";

export interface ReviewApprovalSeed {
  key: string;
  name: string;
}

export interface ReviewDockRow {
  id: string;
  importing: boolean;
  failed: boolean;
  hasError: boolean;
}

const EMPTY: ReadonlySet<string> = new Set();

export function enqueueReviewApproval(seed: ReviewApprovalSeed): void {
  const job = getDockJob(REVIEW_DOCK_ID);
  if (job === null) {
    seedDockJob({
      id: REVIEW_DOCK_ID,
      kind: "review-approve",
      items: buildDockItems([seed]),
      status: "running",
    });
    return;
  }

  cancelAutoDismiss(REVIEW_DOCK_ID);
  if (job.items.some((item) => item.key === seed.key)) markDockItem(REVIEW_DOCK_ID, seed.key, "pending");
  else appendDockItems(REVIEW_DOCK_ID, [seed]);
  setDockJobStatus(REVIEW_DOCK_ID, "running");
}

export function markReviewApprovalStarted(key: string): void {
  markDockItem(REVIEW_DOCK_ID, key, "importing");
}

export function failReviewApproval(key: string): void {
  markDockItem(REVIEW_DOCK_ID, key, "failed");
}

export function reviewApprovalsInFlight(jobs: ReadonlyArray<DockJob>): ReadonlySet<string> {
  const job = jobs.find((candidate) => candidate.id === REVIEW_DOCK_ID);
  if (!job) return EMPTY;
  const keys = job.items.filter((item) => item.state !== "failed").map((item) => item.key);
  return keys.length === 0 ? EMPTY : new Set(keys);
}

export function reconcileReviewDock(rows: ReadonlyArray<ReviewDockRow>): void {
  const job = getDockJob(REVIEW_DOCK_ID);
  if (!job || job.status !== "running") return;

  const stillHeld = new Map(rows.map((row) => [row.id, row]));
  let unsettled = 0;

  for (const item of job.items) {
    if (item.state !== "pending" && item.state !== "importing") continue;

    const row = stillHeld.get(item.key);
    if (row === undefined) {
      markDockItem(REVIEW_DOCK_ID, item.key, "done");
      continue;
    }
    if (row.failed) {
      markDockItem(REVIEW_DOCK_ID, item.key, "failed");
      continue;
    }
    if (row.importing) {
      if (item.state !== "importing") markDockItem(REVIEW_DOCK_ID, item.key, "importing");
      unsettled += 1;
      continue;
    }
    if (item.state === "importing" && row.hasError) {
      markDockItem(REVIEW_DOCK_ID, item.key, "failed");
      continue;
    }
    unsettled += 1;
  }

  if (unsettled > 0) return;
  finalizeDockJob(REVIEW_DOCK_ID);
  autoDismiss(REVIEW_DOCK_ID, REVIEW_DOCK_AUTO_DISMISS_MS);
}
