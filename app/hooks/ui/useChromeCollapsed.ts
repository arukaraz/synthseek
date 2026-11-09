"use client";

import { useSyncExternalStore } from "react";

let collapsed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function serverSnapshot(): boolean {
  return false;
}

export function isChromeCollapsed(): boolean {
  return collapsed;
}

export function setChromeCollapsed(next: boolean): void {
  if (collapsed === next) return;
  collapsed = next;
  listeners.forEach((listener) => listener());
}

export function useChromeCollapsed(): boolean {
  return useSyncExternalStore(subscribe, isChromeCollapsed, serverSnapshot);
}
