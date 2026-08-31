"use client";

import { Loader2, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { LoadingDots } from "@components/ui/LoadingDots";
import { Notice } from "@components/ui/Notice";
import { useCancelLibraryScan } from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useLibraryScanStatus, useUnlinkedLibraryFiles } from "@hooks/api/queries/useLibraryScanStatus";
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
  scanUnlinkedItem,
  scanUnlinkedList,
} from "../../styles";

export function LibraryScanCard() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useLibraryScanStatus();
  const cancel = useCancelLibraryScan();
  const unlinked = useUnlinkedLibraryFiles((data?.inventory.unlinkedFiles ?? 0) > 0);

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

  return (
    <SettingsCard title={t("libraryScan.card.title")} description={t("libraryScan.card.description")}>
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
              {" · "}
              {t("libraryScan.run.seen", { count: run.filesSeen })}
              {" · "}
              {t("libraryScan.run.added", { count: run.filesNew })}
              {" · "}
              {t("libraryScan.run.updated", { count: run.filesUpdated })}
              {" · "}
              {t("libraryScan.run.unchanged", { count: run.filesUnchanged })}
              {" · "}
              {t("libraryScan.run.matched", { count: run.filesLinked })}
              {" · "}
              {t("libraryScan.run.missing", { count: run.filesMissing })}
              {run.filesFailed > 0 ? ` · ${t("libraryScan.run.unreadable", { count: run.filesFailed })}` : ""}
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

        {unlinked.data && unlinked.data.items.length > 0 ? (
          <div className={scanUnlinkedList()}>
            <span className={scanStatLabel()}>{t("libraryScan.unlinked.heading", { count: unlinked.data.total })}</span>
            {unlinked.data.items.map((file) => (
              <span key={file.id} className={scanUnlinkedItem()}>
                {file.artistName && file.title
                  ? `${file.artistName} - ${file.title}${file.albumTitle ? ` (${file.albumTitle})` : ""}`
                  : file.relativePath}
              </span>
            ))}
          </div>
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
