import { useSyncExternalStore } from "react";

import { DOCK_AUTO_DISMISS_MS } from "./constants";
import type { DockItem, DockItemState, DockJob, DockJobStatus } from "./types";

const jobs = new Map<string, DockJob>();
const dismissed = new Set<string>();
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
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

function clearDismissTimer(jobId: string): void {
  const timer = dismissTimers.get(jobId);
  if (timer) {
    clearTimeout(timer);
    dismissTimers.delete(jobId);
  }
}

function scheduleAutoDismiss(jobId: string): void {
  clearDismissTimer(jobId);
  const timer = setTimeout(() => {
    dismissTimers.delete(jobId);
    dismissDockJob(jobId);
  }, DOCK_AUTO_DISMISS_MS);
  dismissTimers.set(jobId, timer);
}

export function seedDockJob(job: Omit<DockJob, "updatedAt">): void {
  clearDismissTimer(job.id);
  dismissed.delete(job.id);
  jobs.set(job.id, { ...job, updatedAt: Date.now() });
  publish();
}

export function markDockItem(jobId: string, key: string, state: DockItemState): void {
  if (dismissed.has(jobId)) return;
  const job = jobs.get(jobId);
  if (!job) return;
  const items = job.items.map((item) => (item.key === key ? { ...item, state } : item));
  jobs.set(jobId, { ...job, items, updatedAt: Date.now() });
  publish();
}

export function setDockJobStatus(jobId: string, status: DockJobStatus): void {
  if (dismissed.has(jobId)) return;
  const job = jobs.get(jobId);
  if (!job) return;
  jobs.set(jobId, { ...job, status, updatedAt: Date.now() });
  if (status !== "running") scheduleAutoDismiss(jobId);
  publish();
}

export function dismissDockJob(jobId: string): void {
  clearDismissTimer(jobId);
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
  dismissTimers.forEach((timer) => clearTimeout(timer));
  dismissTimers.clear();
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
