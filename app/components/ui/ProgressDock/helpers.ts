import type { ParseKeys, TFunction } from "i18next";
import type { CSSProperties } from "react";

import type {
  DockItemState,
  DockJob,
  DockJobKind,
  DockJobStatus,
  LibraryImportFailureReason,
} from "@hooks/api/subscriptions";

import type { DockCounts, DockSubtitle } from "./types";

type AppShellKey = ParseKeys<"appShell">;

export function selectActiveJob(jobs: ReadonlyArray<DockJob>): DockJob | null {
  if (jobs.length === 0) return null;
  return jobs.reduce((latest, job) => (job.updatedAt >= latest.updatedAt ? job : latest));
}

export function ringStyle(ratio: number): CSSProperties {
  const filled = Math.round(ratio * 360);
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

const FAILURE_REASON_KEYS: Record<LibraryImportFailureReason, AppShellKey> = {
  notInLibrary: "progressDock.failureReason.notInLibrary",
  noMatchableTracks: "progressDock.failureReason.noMatchableTracks",
  sourceHasNoTracks: "progressDock.failureReason.sourceHasNoTracks",
  importError: "progressDock.failureReason.importError",
};

export function failureReasonKey(reason: LibraryImportFailureReason | undefined): AppShellKey {
  const key = reason ? FAILURE_REASON_KEYS[reason] : undefined;
  return key ?? "progressDock.itemState.failed";
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

export function buildSubtitle(counts: DockCounts, isTerminal: boolean, t: TFunction<"appShell">): DockSubtitle {
  if (counts.failed > 0) {
    return { accent: String(counts.failed), accentTone: "error", rest: t("progressDock.subtitle.failed") };
  }
  if (isTerminal && counts.skipped > 0) {
    return {
      accent: String(counts.done),
      accentTone: "sync",
      rest: t("progressDock.subtitle.skippedBreakdown", { skipped: counts.skipped }),
    };
  }
  return {
    accent: String(counts.done),
    accentTone: "sync",
    rest: t("progressDock.subtitle.ofTotal", { total: counts.total }),
  };
}
