import { useSyncExternalStore } from "react";

import { countDockItems, deriveTerminalStatus } from "./helpers";
import type { DockItem, DockItemState, DockJob, DockJobStatus, LibraryImportFailureReason } from "./types";

const jobs = new Map<string, DockJob>();
const dismissed = new Set<string>();
const listeners = new Set<() => void>();
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingTerminalByRequestId = new Map<string, DockJobStatus>();

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

function clearDismissTimer(jobId: string): void {
  const handle = dismissTimers.get(jobId);
  if (handle === undefined) return;
  clearTimeout(handle);
  dismissTimers.delete(jobId);
}

export function seedDockJob(job: Omit<DockJob, "updatedAt">): void {
  for (const [existingId, existingJob] of jobs) {
    if (existingJob.status !== "running") jobs.delete(existingId);
  }
  clearDismissTimer(job.id);
  dismissed.delete(job.id);
  if (job.requestId !== undefined) pendingTerminalByRequestId.delete(job.requestId);
  jobs.set(job.id, { ...job, updatedAt: Date.now() });
  publish();
}

export function stashPendingTerminal(requestId: string, status: DockJobStatus): void {
  pendingTerminalByRequestId.set(requestId, status);
}

export function correlateDockJob(jobId: string, requestId: string): void {
  const job = jobs.get(jobId);
  if (!job) return;
  jobs.set(jobId, { ...job, requestId, updatedAt: Date.now() });
  publish();
  const pending = pendingTerminalByRequestId.get(requestId);
  if (pending === undefined) return;
  pendingTerminalByRequestId.delete(requestId);
  setDockJobStatus(jobId, pending);
}

export function findRunningRequestJobId(requestId: string): string | null {
  for (const job of jobs.values()) {
    if (job.kind === "request" && job.status === "running" && job.requestId === requestId) return job.id;
  }
  return null;
}

export function autoDismiss(jobId: string, ms: number): void {
  clearDismissTimer(jobId);
  const handle = setTimeout(() => {
    dismissTimers.delete(jobId);
    dismissDockJob(jobId);
  }, ms);
  dismissTimers.set(jobId, handle);
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
  setDockJobStatus(jobId, deriveTerminalStatus(counts.done + counts.skipped, counts.failed));
}

export function dismissDockJob(jobId: string): void {
  clearDismissTimer(jobId);
  const job = jobs.get(jobId);
  if (job?.requestId !== undefined) pendingTerminalByRequestId.delete(job.requestId);
  dismissed.add(jobId);
  if (jobs.delete(jobId)) publish();
}

export function isDockJobDismissed(jobId: string): boolean {
  return dismissed.has(jobId);
}

export function hasDockJob(jobId: string): boolean {
  return jobs.has(jobId);
}

export function isDockJobRunning(jobId: string): boolean {
  return jobs.get(jobId)?.status === "running";
}

export function resetDockStore(): void {
  for (const handle of dismissTimers.values()) clearTimeout(handle);
  dismissTimers.clear();
  jobs.clear();
  dismissed.clear();
  pendingTerminalByRequestId.clear();
  publish();
}

export function buildDockItems(seed: ReadonlyArray<Omit<DockItem, "state">>): DockItem[] {
  return seed.map((item) => ({ ...item, state: "pending" }));
}

export function useDockJobs(): DockJob[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
