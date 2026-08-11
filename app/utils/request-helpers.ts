import { ContentType, ReclaimOutcome, type AppRouter, type TrackRequest } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";
import type { ParseKeys } from "i18next";
import { toast } from "sonner";

import i18n from "@locale";

type ReclaimKind = "download" | "album" | "playlist";

export type UpgradeTrackResult = inferRouterOutputs<AppRouter>["requests"]["upgradeTracks"]["results"][number];

type UpgradeSkipReason = Extract<UpgradeTrackResult, { outcome: "skipped" }>["reason"];

const UPGRADE_SKIP_REASON_KEYS: Record<UpgradeSkipReason, ParseKeys<"mutations">> = {
  notFound: "requests.upgradeSkipNotFound",
  forbidden: "requests.upgradeSkipForbidden",
  notComplete: "requests.upgradeSkipNotComplete",
  upgradesDisabled: "requests.upgradeSkipUpgradesDisabled",
  upgradeError: "requests.upgradeSkipUpgradeError",
};

const RECLAIM_KIND_KEYS: Record<
  ReclaimKind,
  "requests.reclaim.download" | "requests.reclaim.album" | "requests.reclaim.playlist"
> = {
  download: "requests.reclaim.download",
  album: "requests.reclaim.album",
  playlist: "requests.reclaim.playlist",
};

export function isSingleTrackRequest(tracks: TrackRequest[]): boolean {
  if (tracks.length !== 1) return false;

  const track = tracks[0];
  return track.request_type === ContentType.enum.track;
}

export function notifyPendingApproval(itemName: string) {
  toast.info(i18n.t("mutations:requests.awaitingApprovalTitle"), {
    description: i18n.t("mutations:requests.awaitingApprovalDescription", { itemName }),
  });
}

export function notifyUpgradeOutcome(args: { outcome: ReclaimOutcome; itemName: string }) {
  const { outcome, itemName } = args;
  if (outcome === ReclaimOutcome.enum.requeued) {
    toast.success(i18n.t("mutations:requests.upgradeStartedTitle"), {
      description: i18n.t("mutations:requests.upgradeStartedDescription", { itemName }),
    });
    return;
  }
  if (outcome === ReclaimOutcome.enum.already_complete) {
    toast.info(i18n.t("mutations:requests.upgradeDisabledTitle"), {
      description: i18n.t("mutations:requests.upgradeDisabledDescription", { itemName }),
    });
    return;
  }
  notifyReclaimOutcome({ outcome, kind: "download", itemName });
}

function summarizeUpgradeSkips(reasons: UpgradeSkipReason[]): string {
  const counts = new Map<UpgradeSkipReason, number>();
  for (const reason of reasons) {
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => i18n.t(`mutations:${UPGRADE_SKIP_REASON_KEYS[reason]}`, { count }))
    .join(" · ");
}

export function notifyBulkUpgradeOutcome(results: UpgradeTrackResult[]) {
  const queued = results.filter((result) => result.outcome === "queued").length;
  const pending = results.filter((result) => result.outcome === "pendingApproval").length;
  const skipped = results.flatMap((result) => (result.outcome === "skipped" ? [result.reason] : []));

  if (queued === 0 && pending === 0) {
    if (skipped.length > 0 && skipped.every((reason) => reason === "upgradesDisabled")) {
      toast.info(i18n.t("mutations:requests.upgradeDisabledTitle"), {
        description: i18n.t("mutations:requests.upgradeDisabledBulkDescription", { count: skipped.length }),
      });
      return;
    }
    toast.warning(i18n.t("mutations:requests.tracksUpgradeAllSkipped"), {
      description: skipped.length > 0 ? summarizeUpgradeSkips(skipped) : undefined,
    });
    return;
  }

  const details = [
    queued > 0 && pending > 0 ? i18n.t("mutations:requests.tracksUpgradePending", { count: pending }) : null,
    skipped.length > 0
      ? i18n.t("mutations:requests.tracksUpgradeSkipped", {
          count: skipped.length,
          reasons: summarizeUpgradeSkips(skipped),
        })
      : null,
  ].filter((part) => part !== null);
  const description = details.length > 0 ? details.join(" · ") : undefined;

  if (queued === 0) {
    toast.info(i18n.t("mutations:requests.tracksUpgradeSentForApproval", { count: pending }), { description });
    return;
  }
  toast.success(i18n.t("mutations:requests.tracksUpgrading", { count: queued }), { description });
}

export function notifyBulkUpgradeLimit(max: number) {
  toast.warning(i18n.t("mutations:requests.upgradeTooManyTitle"), {
    description: i18n.t("mutations:requests.upgradeTooManyDescription", { max }),
  });
}

export function notifyReclaimOutcome(args: { outcome: ReclaimOutcome; kind: ReclaimKind; itemName: string }) {
  const { outcome, kind, itemName } = args;
  const noun = i18n.t(`mutations:${RECLAIM_KIND_KEYS[kind]}`);
  switch (outcome) {
    case ReclaimOutcome.enum.created:
      toast.success(i18n.t("mutations:requests.reclaim.startedTitle", { kind: noun }), {
        description: i18n.t("mutations:requests.reclaim.startedDescription", { itemName }),
      });
      return;
    case ReclaimOutcome.enum.already_complete:
      toast.info(i18n.t("mutations:requests.reclaim.alreadyCompleteTitle", { kind: noun }), { description: itemName });
      return;
    case ReclaimOutcome.enum.already_in_progress:
      toast.info(i18n.t("mutations:requests.reclaim.alreadyInProgressTitle", { kind: noun }), {
        description: itemName,
      });
      return;
    case ReclaimOutcome.enum.requeued:
      toast.success(i18n.t("mutations:requests.reclaim.requeuedTitle", { kind: noun }), {
        description: i18n.t("mutations:requests.reclaim.requeuedDescription", { itemName }),
      });
      return;
  }
}
