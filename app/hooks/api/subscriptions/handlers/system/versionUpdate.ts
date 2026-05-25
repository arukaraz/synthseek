import type { VersionUpdatePayload } from "@api/__generated__/types";
import { useSyncExternalStore } from "react";

interface VersionState {
  latestVersion: string | null;
  currentVersion: string | null;
}

let state: VersionState = { latestVersion: null, currentVersion: null };
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
  state = { latestVersion: event.latestVersion, currentVersion: event.currentVersion };
  listeners.forEach((l) => l());
}

export function useVersionState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const currentVersion = snapshot.currentVersion ?? BUILD_VERSION;
  return {
    latestVersion: snapshot.latestVersion,
    currentVersion,
    updateAvailable: snapshot.latestVersion !== null && snapshot.latestVersion !== currentVersion,
  };
}
