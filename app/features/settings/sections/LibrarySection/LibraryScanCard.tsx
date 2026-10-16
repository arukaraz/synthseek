"use client";

import { Inbox, Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { REVIEW_URL_PARAM, REVIEW_URL_VALUE, UnidentifiedFilesModal } from "@features/unidentified-files";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { Button } from "@components/ui/Button";
import { LoadingDots } from "@components/ui/LoadingDots";
import { formatRelativeTime } from "@utils/formatters";
import { Notice } from "@components/ui/Notice";
import { DataTable } from "@components/ui/Table";
import {
  useCancelLibraryScan,
  useKeepBestLibraryCopies,
  useScanLibraryPath,
} from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";

import { SettingsCard } from "../../components/SettingsCard";
import { scanActions, scanHeaderMeta, scanFooter, scanFooterLink, scanFooterRow, jobPlayButton } from "../../styles";
import { buildScanPathColumns } from "./scanColumns";

export function LibraryScanCard() {
  const { t } = useTranslation("settings");
  const status = useLibraryScanStatus();
  const { data, isLoading, error } = status;
  const cancel = useCancelLibraryScan();
  const trigger = useTriggerJob();
  const keepBest = useKeepBestLibraryCopies();
  const scanPath = useScanLibraryPath();
  const [review, setReview] = useUrlParam(REVIEW_URL_PARAM, { validValues: [REVIEW_URL_VALUE] });

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

  const { activeRun, lastRun, inventory, paths } = data;
  const isScanning = activeRun !== null;
  const reclaiming = data.reclaimRunning || keepBest.isPending;
  const busy = isScanning || data.identifyRunning || reclaiming || trigger.isPending || scanPath.isPending;
  const columns = buildScanPathColumns({
    t,
    busy,
    onScan: (path) => scanPath.mutate({ pathId: path.id }, { onSuccess: () => void status.refetch() }),
  });
  const name = t("libraryScan.card.title");
  const lastRunLabel =
    lastRun?.finishedAt != null
      ? t("libraryScan.header.ago", { ago: formatRelativeTime(new Date(lastRun.finishedAt)) })
      : t("libraryScan.header.never");

  return (
    <SettingsCard
      title={name}
      description={t("libraryScan.card.description")}
      anchor="library-scan"
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
        <DataTable data={paths} columns={columns} getRowId={(path) => path.id} staggerDelay={0} />

        <div className={scanFooterRow()}>
          <p className={scanFooter()}>
            {inventory.ignoredFiles > 0 ? (
              <button type="button" className={scanFooterLink()} onClick={() => setReview(REVIEW_URL_VALUE)}>
                {t("libraryScan.paths.ignored", { count: inventory.ignoredFiles })}
              </button>
            ) : (
              t("libraryScan.paths.ignored", { count: inventory.ignoredFiles })
            )}
          </p>
          {inventory.reviewFiles > 0 ? (
            <Button size="sm" onClick={() => setReview(REVIEW_URL_VALUE)}>
              <Inbox />
              {t("libraryScan.stats.reviewFilesCount", { count: inventory.reviewFiles })}
            </Button>
          ) : null}
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
      <UnidentifiedFilesModal
        open={review === REVIEW_URL_VALUE}
        onOpenChange={(open) => setReview(open ? REVIEW_URL_VALUE : null)}
      />
    </SettingsCard>
  );
}
