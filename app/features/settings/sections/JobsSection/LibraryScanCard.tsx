"use client";

import { useState } from "react";
import { Loader2, Square, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { LoadingDots } from "@components/ui/LoadingDots";
import { Notice } from "@components/ui/Notice";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useCancelLibraryScan, useDiscardLibraryCopy } from "@hooks/api/mutations/jobs/useLibraryScanControls";
import {
  useAlternateLibraryCopies,
  useLibraryScanStatus,
  useUnlinkedLibraryFiles,
} from "@hooks/api/queries/useLibraryScanStatus";
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
} from "../../styles";

export function LibraryScanCard() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useLibraryScanStatus();
  const cancel = useCancelLibraryScan();
  const discard = useDiscardLibraryCopy();
  const unlinked = useUnlinkedLibraryFiles((data?.inventory.unlinkedFiles ?? 0) > 0);
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

        {alternates.data && alternates.data.items.length > 0 ? (
          <div className={scanUnlinkedList()}>
            <span className={scanStatLabel()}>
              {t("libraryScan.alternates.heading", {
                count: alternates.data.total,
                size: formatBytes(alternates.data.totalBytes),
              })}
            </span>
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
                  disabled={discard.isPending}
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
