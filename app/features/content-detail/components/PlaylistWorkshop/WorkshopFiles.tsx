"use client";

import { PLAYLIST_M3U_ACCEPT } from "@hooks/api/mutations/playlists/constants";
import { useExportPlaylistM3u } from "@hooks/api/mutations/playlists/useExportPlaylistM3u";
import { useImportPlaylistM3u } from "@hooks/api/mutations/playlists/useImportPlaylistM3u";
import { useExportCollection } from "@hooks/api/queries/portability/useExportCollection";
import { downloadText } from "@utils/download";
import { collectionFilename } from "@utils/filename";
import { formatBytes } from "@utils/formatters";
import { FileDown, FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { JSPF_EXTENSION } from "./constants";
import {
  actionList,
  actionRow,
  actionRowHint,
  actionRowLabel,
  importActions,
  importButton,
  importMissItem,
  importMissList,
  importSummary,
  importText,
} from "./styles";
import type { M3uPreview, WorkshopFilesProps } from "./types";

export function WorkshopFiles({ playlistId, name, canImport, maxChars }: WorkshopFilesProps) {
  const { t } = useTranslation("contentDetail");
  const picker = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<M3uPreview | null>(null);
  const importM3u = useImportPlaylistM3u();
  const exportM3u = useExportPlaylistM3u();
  const { exportCollection } = useExportCollection();
  const exportFailed = t("workshop.details.exportFailed");
  const tooLarge = t("workshop.details.importTooLarge", { size: formatBytes(maxChars) });
  const missed = preview === null ? 0 : preview.report.unmatchedCount;

  const readFile = async (file: File) => {
    if (file.size > maxChars) {
      toast.error(tooLarge);
      return;
    }
    const content = await file.text();
    if (content.trim().length === 0) {
      setPreview(null);
      return;
    }
    try {
      const report = await importM3u.mutateAsync({ playlistId, content, commit: false });
      setPreview({ content, report });
    } catch {
      setPreview(null);
    }
  };

  const commit = async () => {
    if (preview === null) return;
    try {
      await importM3u.mutateAsync({ playlistId, content: preview.content, commit: true });
      setPreview(null);
    } catch {
      return;
    }
  };

  const exportJspf = async () => {
    try {
      const doc = await exportCollection({ id: playlistId, type: "playlist" });
      downloadText(collectionFilename(name, JSPF_EXTENSION), JSON.stringify(doc, null, 2));
    } catch {
      toast.error(exportFailed);
    }
  };

  return (
    <>
      <div className={actionList()}>
        {canImport ? (
          <>
            <input
              ref={picker}
              type="file"
              hidden
              accept={PLAYLIST_M3U_ACCEPT}
              data-cy="workshop-m3u-input"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void readFile(file);
              }}
            />
            <button
              type="button"
              className={actionRow()}
              disabled={importM3u.isPending}
              onClick={() => picker.current?.click()}
            >
              <FileUp className="size-4 shrink-0" aria-hidden />
              <span className={actionRowLabel()}>{t("workshop.details.importFile")}</span>
              <span className={actionRowHint()}>{t("workshop.details.importHint")}</span>
            </button>
          </>
        ) : null}
        <button
          type="button"
          className={actionRow()}
          disabled={exportM3u.isPending}
          onClick={() => exportM3u.mutate({ playlistId })}
        >
          <FileDown className="size-4 shrink-0" aria-hidden />
          <span className={actionRowLabel()}>{t("workshop.details.exportM3u")}</span>
          <span className={actionRowHint()}>{t("workshop.details.exportM3uHint")}</span>
        </button>
        <button type="button" className={actionRow()} onClick={() => void exportJspf()}>
          <FileDown className="size-4 shrink-0" aria-hidden />
          <span className={actionRowLabel()}>{t("workshop.details.exportJspf")}</span>
          <span className={actionRowHint()}>{t("workshop.details.exportJspfHint")}</span>
        </button>
      </div>

      {preview === null ? null : (
        <div className={importSummary()} role="status">
          <p className={importText()}>
            {t("workshop.details.importRecognized", {
              recognized: preview.report.recognized,
              count: preview.report.entries,
            })}
          </p>
          {preview.report.alreadyPresent > 0 ? (
            <p className={importText({ tone: "quiet" })}>
              {t("workshop.details.importPresent", { count: preview.report.alreadyPresent })}
            </p>
          ) : null}
          {missed > 0 ? (
            <>
              <p className={importText({ tone: "quiet" })}>
                {t("workshop.details.importUnmatched", { count: missed })}
              </p>
              <ul className={importMissList()}>
                {preview.report.unmatched.map((line, index) => (
                  <li key={`${index}-${line}`} className={importMissItem()} title={line}>
                    {line}
                  </li>
                ))}
                {missed > preview.report.unmatched.length ? (
                  <li>
                    {t("workshop.details.importUnmatchedMore", { count: missed - preview.report.unmatched.length })}
                  </li>
                ) : null}
              </ul>
            </>
          ) : null}
          <div className={importActions()}>
            <button
              type="button"
              className={importButton({ tone: "primary" })}
              disabled={preview.report.added === 0 || importM3u.isPending}
              onClick={() => void commit()}
            >
              {preview.report.added === 0
                ? t("workshop.details.importNothing")
                : t("workshop.details.importAdd", { count: preview.report.added })}
            </button>
            <button type="button" className={importButton()} onClick={() => setPreview(null)}>
              {t("workshop.details.importCancel")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
