"use client";

import { useSyncExternalStore } from "react";

import type { ImportReviewLaunch } from "./types";

const CLOSED: ImportReviewLaunch = { open: false, focusTrackId: null };

let launch: ImportReviewLaunch = CLOSED;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): ImportReviewLaunch {
  return launch;
}

function serverSnapshot(): ImportReviewLaunch {
  return CLOSED;
}

function publish(next: ImportReviewLaunch): void {
  launch = next;
  listeners.forEach((listener) => listener());
}

export function openImportReview(focusTrackId: string | null = null): void {
  publish({ open: true, focusTrackId });
}

export function closeImportReview(): void {
  if (!launch.open) return;
  publish(CLOSED);
}

export function useImportReviewLauncher(): ImportReviewLaunch {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
