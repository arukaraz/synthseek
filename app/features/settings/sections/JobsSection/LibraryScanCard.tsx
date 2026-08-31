"use client";

import { useState } from "react";
import { Loader2, Play, Sparkles, Square, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { LoadingDots } from "@components/ui/LoadingDots";
import { Notice } from "@components/ui/Notice";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import {
  useCancelLibraryScan,
  useDiscardLibraryCopy,
  useKeepBestLibraryCopies,
} from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useAlternateLibraryCopies, useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";
import { formatBytes } from "@utils/formatters";

import { SettingsCard } from "../../components/SettingsCard";
import {
  scanActions,
  scanMetaRow,
  scanRunLine,
  scanStat,
  scanStatGrid,
  scanStatLabel,
  scanStatValue,
  scanCopyDiscard,
  scanCopyRow,
  scanUnlinkedItem,
  scanUnlinkedList,
  jobPlayButton,
} from "../../styles";

export function LibraryScanCard() {
  const { t } = useTranslation("settings");
  const status = useLibraryScanStatus();
  const { data, isLoading, error } = status;
  const cancel = useCancelLibraryScan();
  const discard = useDiscardLibraryCopy();
  const trigger = useTriggerJob();
  const keepBest = useKeepBestLibraryCopies();
  const alternates = useAlternateLibraryCopies((data?.inventory.linkedFiles ?? 0) > 0);
  const [pendingDiscard, setPendingDiscard] = useState<{
    id: string;
    relativePath: string;
    servingPath: string;
  } | null>(null);

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
  const run = activeRun ?? lastRun;
  const busy = isScanning || trigger.isPending;
  const reclaiming = data.reclaimRunning || keepBest.isPending;
  const name = t("libraryScan.card.title");

  return (
    <SettingsCard
      title={name}
      description={t("libraryScan.card.description")}
      trailing={
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

        <div className={scanMetaRow()}>
          <span>{t("libraryScan.meta.size", { size: formatBytes(inventory.totalBytes) })}</span>
          {inventory.formats.map((entry) => (
            <span key={entry.format}>
              {entry.format.toUpperCase()} {entry.count.toLocaleString()}
            </span>
          ))}
          {inventory.completeRequestsWithoutFile > 0 ? (
            <span>{t("libraryScan.meta.requestsWithoutFile", { count: inventory.completeRequestsWithoutFile })}</span>
          ) : null}
        </div>

        {run ? (
          <div className={scanRunLine()}>
            {isScanning ? <LoadingDots size="sm" /> : null}
            <span>
              {t(`libraryScan.state.${run.state}`, { defaultValue: run.state })}
              {run.terminalCode !== null ? ` · ${run.terminalCode}` : ""}
            </span>
          </div>
        ) : (
          <div className={scanRunLine()}>
            <span>{t("libraryScan.run.never")}</span>
          </div>
        )}

        {lastRun && !lastRun.walkClean ? (
          <Notice variant="warning" title={t("libraryScan.warning.dirtyWalk.title")}>
            {t("libraryScan.warning.dirtyWalk.body", { count: lastRun.walkFailures })}
          </Notice>
        ) : null}

        {alternates.data && alternates.data.items.length > 0 ? (
          <div className={scanUnlinkedList()}>
            <div className={scanCopyRow()}>
              <span className={scanStatLabel()}>
                {t("libraryScan.alternates.heading", {
                  count: alternates.data.total,
                  size: formatBytes(alternates.data.totalBytes),
                })}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => keepBest.mutate(undefined, { onSuccess: () => void status.refetch() })}
                disabled={reclaiming}
                aria-busy={reclaiming}
              >
                {reclaiming ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {reclaiming ? t("libraryScan.alternates.keepBestRunning") : t("libraryScan.alternates.keepBest")}
              </Button>
            </div>
            {alternates.data.items.map((copy) => (
              <div key={copy.id} className={scanCopyRow()}>
                <span className={scanUnlinkedItem()}>
                  {copy.artist} - {copy.title} ({copy.fileFormat.toUpperCase()}, {formatBytes(copy.sizeBytes)})
                </span>
                <button
                  type="button"
                  className={scanCopyDiscard()}
                  onClick={() =>
                    setPendingDiscard({ id: copy.id, relativePath: copy.relativePath, servingPath: copy.servingPath })
                  }
                  disabled={discard.isPending || reclaiming}
                  aria-label={t("libraryScan.alternates.discard")}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <ConfirmationModal
          isOpen={pendingDiscard !== null}
          onClose={() => setPendingDiscard(null)}
          onConfirm={() => {
            if (pendingDiscard) discard.mutate({ fileId: pendingDiscard.id });
            setPendingDiscard(null);
          }}
          title={t("libraryScan.alternates.confirmTitle")}
          message={t("libraryScan.alternates.confirmBody", {
            path: pendingDiscard?.relativePath ?? "",
            keep: pendingDiscard?.servingPath ?? "",
          })}
          confirmText={t("libraryScan.alternates.discard")}
          variant="danger"
        />

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
