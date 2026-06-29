import type { ParseKeys, TFunction } from "i18next";
import { CheckCircle, XCircle, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import type {
  DockItemState,
  DockJob,
  DockJobKind,
  DockJobStatus,
  LibraryImportFailureReason,
} from "@hooks/api/subscriptions";

import { countDockItems } from "@hooks/api/subscriptions";

import { REQUEST_LONG_RUN_TRACK_THRESHOLD } from "./constants";
import type { DockCardModel, DockControls, DockCounts, DockPresentation, DockSubtitle } from "./types";

type AppShellKey = ParseKeys<"appShell">;

export function selectActiveJob(jobs: ReadonlyArray<DockJob>): DockJob | null {
  if (jobs.length === 0) return null;
  return jobs.reduce((latest, job) => (job.updatedAt >= latest.updatedAt ? job : latest));
}

export function orderDockJobs(jobs: ReadonlyArray<DockJob>): DockJob[] {
  return [...jobs].sort((a, b) => b.updatedAt - a.updatedAt);
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
  request: { running: "progressDock.title.queueing", done: "progressDock.title.queued" },
};

function requestTitleKey(status: DockJobStatus): AppShellKey {
  switch (status) {
    case "running":
      return "progressDock.title.queueing";
    case "complete":
    case "partial":
      return "progressDock.title.queued";
    case "failed":
      return "progressDock.title.queueFailed";
  }
}

export function titleKey(kind: DockJobKind, status: DockJobStatus): AppShellKey {
  if (kind === "request") return requestTitleKey(status);
  const keys = TITLE_KEYS[kind];
  return status === "running" ? keys.running : keys.done;
}

export function presentationFor(
  kind: DockJobKind,
  status: DockJobStatus,
  ratio: number,
  percent: number
): DockPresentation {
  if (kind !== "request") return { indicator: "ring", ratio, percent };
  if (status === "running") return { indicator: "spinner" };
  return { indicator: "status-icon", status };
}

export function controlsFor(kind: DockJobKind, status: DockJobStatus): DockControls {
  if (kind !== "request") return { toggle: true, close: true };
  if (status === "running") return { toggle: false, close: false };
  return { toggle: false, close: true };
}

export function statusIconGlyph(status: DockJobStatus): LucideIcon {
  return status === "failed" ? XCircle : CheckCircle;
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

export function buildRequestSubtitle(
  status: DockJobStatus,
  trackCount: number,
  t: TFunction<"appShell">
): DockSubtitle {
  switch (status) {
    case "running": {
      const rest =
        trackCount > REQUEST_LONG_RUN_TRACK_THRESHOLD
          ? t("progressDock.subtitle.processingTracksLong", { count: trackCount })
          : t("progressDock.subtitle.processingTracks", { count: trackCount });
      return { accent: "", accentTone: "sync", rest };
    }
    case "complete":
      return {
        accent: "",
        accentTone: "sync",
        rest: t("progressDock.subtitle.requestComplete", { count: trackCount }),
      };
    case "partial":
      return { accent: "", accentTone: "sync", rest: t("progressDock.subtitle.requestPartial") };
    case "failed":
      return { accent: "", accentTone: "error", rest: t("progressDock.subtitle.requestFailed") };
  }
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

export function deriveDockCardModel(job: DockJob, t: TFunction<"appShell">): DockCardModel {
  const counts = countDockItems(job.items);
  const resolved = counts.done + counts.skipped + counts.failed;
  const ratio = clampRatio(resolved, counts.total);
  const percent = Math.round(ratio * 100);
  const isRequest = job.kind === "request";
  const isTerminal = job.status !== "running";
  const isRequestRunning = isRequest && !isTerminal;
  const title = t(titleKey(job.kind, job.status), {
    provider: t(providerLabelKey(job.provider)),
    name: currentItemName(job),
  });
  const subtitle = isRequest ? buildRequestSubtitle(job.status, counts.total, t) : buildSubtitle(counts, isTerminal, t);
  const mobileMeta = isRequest
    ? subtitle.rest
    : t("progressDock.mobileMeta", { done: counts.done, total: counts.total, current: currentItemName(job) });
  return {
    counts,
    presentation: presentationFor(job.kind, job.status, ratio, percent),
    controls: controlsFor(job.kind, job.status),
    title,
    subtitle,
    wrapSubtitle: isRequestRunning,
    mobileMeta,
  };
}
