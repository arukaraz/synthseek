import type { VersionUpdatePayload } from "@api/__generated__/types";
import { useSyncExternalStore } from "react";

interface VersionState {
  latestVersion: string | null;
}

let state: VersionState = { latestVersion: null };
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): VersionState {
  return state;
}

const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export function handleVersionUpdate(event: VersionUpdatePayload): void {
  state = { latestVersion: event.latestVersion };
  listeners.forEach((l) => l());
}

export function useVersionState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    latestVersion: snapshot.latestVersion,
    currentVersion: BUILD_VERSION,
    updateAvailable: snapshot.latestVersion !== null && snapshot.latestVersion !== BUILD_VERSION,
  };
}
