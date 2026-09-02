"use client";

import { Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { LoadingDots } from "@components/ui/LoadingDots";
import { formatRelativeTime } from "@utils/formatters";
import { Notice } from "@components/ui/Notice";
import { useCancelLibraryScan, useKeepBestLibraryCopies } from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";

import { SettingsCard } from "../../components/SettingsCard";
import {
  scanActions,
  scanStat,
  scanStatGrid,
  scanStatLabel,
  scanStatValue,
  scanHeaderMeta,
  jobPlayButton,
} from "../../styles";

export function LibraryScanCard() {
  const { t } = useTranslation("settings");
  const status = useLibraryScanStatus();
  const { data, isLoading, error } = status;
  const cancel = useCancelLibraryScan();
  const trigger = useTriggerJob();
  const keepBest = useKeepBestLibraryCopies();

  if (isLoading) {
    return (
      <SettingsCard title={t("libraryScan.card.title")} description={t("libraryScan.card.description")}>
        <span className="text-fg/60 text-sm">{t("jobs.card.loading")}</span>
      </SettingsCard>
    );
  }

  if (error || !data) {
    return (
      <SettingsCard title={t("libraryScan.card.title")} description={t("libraryScan.card.description")}>
        <span className="text-destructive-vivid text-sm">
          {t("jobs.card.loadError", { message: error?.message ?? t("jobs.card.unknownError") })}
        </span>
      </SettingsCard>
    );
  }

  const { activeRun, lastRun, inventory } = data;
  const isScanning = activeRun !== null;
  const reclaiming = data.reclaimRunning || keepBest.isPending;
  const busy = isScanning || data.identifyRunning || reclaiming || trigger.isPending;
  const name = t("libraryScan.card.title");
  const lastRunLabel =
    lastRun?.finishedAt != null
      ? t("libraryScan.header.ago", { ago: formatRelativeTime(new Date(lastRun.finishedAt)) })
      : t("libraryScan.header.never");

  return (
    <SettingsCard
      title={name}
      description={t("libraryScan.card.description")}
      trailing={
        <div className="flex items-center gap-3">
          <span className={scanHeaderMeta()}>
            {busy ? (
              <>
                {isScanning ? t("libraryScan.header.running") : t("libraryScan.header.identifying")}
                <LoadingDots size="sm" />
              </>
            ) : (
              lastRunLabel
            )}
          </span>
          <button
            type="button"
            className={jobPlayButton()}
            onClick={() => trigger.mutate({ id: "library-scan" }, { onSuccess: () => void status.refetch() })}
            disabled={busy}
            aria-label={busy ? t("jobs.row.running", { name }) : t("jobs.row.runNow", { name })}
            aria-busy={busy}
          >
            {busy ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className={scanStatGrid()}>
          <div className={scanStat()}>
            <span className={scanStatValue()}>{inventory.indexedFiles.toLocaleString()}</span>
            <span className={scanStatLabel()}>{t("libraryScan.stats.onDisk")}</span>
          </div>
          <div className={scanStat()}>
            <span className={scanStatValue()}>{inventory.linkedFiles.toLocaleString()}</span>
            <span className={scanStatLabel()}>{t("libraryScan.stats.linked")}</span>
          </div>
          <div className={scanStat()}>
            <span className={scanStatValue()}>{inventory.unlinkedFiles.toLocaleString()}</span>
            <span className={scanStatLabel()}>{t("libraryScan.stats.unlinked")}</span>
          </div>
          <div className={scanStat()}>
            <span className={scanStatValue()}>{inventory.missingFiles.toLocaleString()}</span>
            <span className={scanStatLabel()}>{t("libraryScan.stats.missing")}</span>
          </div>
        </div>

        {lastRun && !lastRun.walkClean ? (
          <Notice variant="warning" title={t("libraryScan.warning.dirtyWalk.title")}>
            {t("libraryScan.warning.dirtyWalk.body", { count: lastRun.walkFailures })}
          </Notice>
        ) : null}

        {isScanning ? (
          <div className={scanActions()}>
            <Button size="sm" variant="secondary" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
              {cancel.isPending ? <Loader2 className="animate-spin" /> : <Square />}
              {t("libraryScan.actions.cancel")}
            </Button>
          </div>
        ) : null}
      </div>
    </SettingsCard>
  );
}
