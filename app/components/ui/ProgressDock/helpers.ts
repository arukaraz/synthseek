import type { ParseKeys } from "i18next";
import type { CSSProperties } from "react";

import type { DockItemState, DockJob, DockJobKind, DockJobStatus } from "@hooks/api/subscriptions";

import { DOCK_RING_GAP_DEGREES } from "./constants";

type AppShellKey = ParseKeys<"appShell">;

export function selectActiveJob(jobs: ReadonlyArray<DockJob>): DockJob | null {
  if (jobs.length === 0) return null;
  return jobs.reduce((latest, job) => (job.updatedAt >= latest.updatedAt ? job : latest));
}

export function ringStyle(ratio: number): CSSProperties {
  const filled = Math.round(ratio * (360 - DOCK_RING_GAP_DEGREES));
  return { "--dock-ring-fill": `${filled}deg` } as CSSProperties;
}

const TITLE_KEYS: Record<DockJobKind, { running: AppShellKey; done: AppShellKey }> = {
  "plex-sync": { running: "progressDock.title.plexSyncRunning", done: "progressDock.title.plexSyncDone" },
  "library-import": {
    running: "progressDock.title.libraryImportRunning",
    done: "progressDock.title.libraryImportDone",
  },
  "file-import": { running: "progressDock.title.fileImportRunning", done: "progressDock.title.fileImportDone" },
};

export function titleKey(kind: DockJobKind, status: DockJobStatus): AppShellKey {
  const keys = TITLE_KEYS[kind];
  return status === "running" ? keys.running : keys.done;
}

const ITEM_STATE_KEYS: Record<DockItemState, AppShellKey> = {
  pending: "progressDock.itemState.pending",
  importing: "progressDock.itemState.importing",
  done: "progressDock.itemState.done",
  failed: "progressDock.itemState.failed",
  skipped: "progressDock.itemState.skipped",
};

export function itemStateKey(state: DockItemState): AppShellKey {
  return ITEM_STATE_KEYS[state];
}

const PROVIDER_LABEL_KEYS: Record<string, AppShellKey> = {
  spotify: "progressDock.provider.spotify",
};

export function providerLabelKey(provider: string | undefined): AppShellKey {
  const key = provider ? PROVIDER_LABEL_KEYS[provider] : undefined;
  return key ?? "progressDock.provider.generic";
}

export function clampRatio(value: number, max: number): number {
  if (max <= 0) return 0;
  const ratio = value / max;
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

export function currentItemName(job: DockJob): string {
  const active = job.items.find((item) => item.state === "importing");
  if (active && active.name) return active.name;
  const pending = job.items.find((item) => item.state === "pending");
  return pending?.name ?? "";
}
