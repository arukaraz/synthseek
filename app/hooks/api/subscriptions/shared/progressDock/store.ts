import { useSyncExternalStore } from "react";

import { countDockItems, deriveTerminalStatus } from "./helpers";
import type { DockItem, DockItemState, DockJob, DockJobStatus, LibraryImportFailureReason } from "./types";

const jobs = new Map<string, DockJob>();
const dismissed = new Set<string>();
const listeners = new Set<() => void>();

let snapshot: DockJob[] = [];

function publish(): void {
  snapshot = Array.from(jobs.values()).sort((a, b) => a.updatedAt - b.updatedAt);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DockJob[] {
  return snapshot;
}

export function seedDockJob(job: Omit<DockJob, "updatedAt">): void {
  for (const [existingId, existingJob] of jobs) {
    if (existingJob.status !== "running") jobs.delete(existingId);
  }
  dismissed.delete(job.id);
  jobs.set(job.id, { ...job, updatedAt: Date.now() });
  publish();
}

export function markDockItem(
  jobId: string,
  key: string,
  state: DockItemState,
  reason?: LibraryImportFailureReason
): void {
  if (dismissed.has(jobId)) return;
  const job = jobs.get(jobId);
  if (!job) return;
  const items = job.items.map((item) => (item.key === key ? { ...item, state, reason } : item));
  jobs.set(jobId, { ...job, items, updatedAt: Date.now() });
  publish();
}

export function setDockJobStatus(jobId: string, status: DockJobStatus): void {
  if (dismissed.has(jobId)) return;
  const job = jobs.get(jobId);
  if (!job) return;
  jobs.set(jobId, { ...job, status, updatedAt: Date.now() });
  publish();
}

export function finalizeDockJob(jobId: string): void {
  if (dismissed.has(jobId)) return;
  const job = jobs.get(jobId);
  if (!job) return;
  const counts = countDockItems(job.items);
  setDockJobStatus(jobId, deriveTerminalStatus(counts.done, counts.failed));
}

export function dismissDockJob(jobId: string): void {
  dismissed.add(jobId);
  if (jobs.delete(jobId)) publish();
}

export function isDockJobDismissed(jobId: string): boolean {
  return dismissed.has(jobId);
}

export function hasDockJob(jobId: string): boolean {
  return jobs.has(jobId);
}

export function resetDockStore(): void {
  jobs.clear();
  dismissed.clear();
  publish();
}

export function buildDockItems(seed: ReadonlyArray<Omit<DockItem, "state">>): DockItem[] {
  return seed.map((item) => ({ ...item, state: "pending" }));
}

export function useDockJobs(): DockJob[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
