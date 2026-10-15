"use client";

import { Notice } from "@components/ui/Notice";
import { Spinner } from "@components/ui/Spinner";
import { formatBytes } from "@utils/formatters";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  noticeList,
  previewNote,
  previewPending,
  previewWrap,
  sampleArrow,
  sampleHead,
  samplePath,
  sampleRow,
  sampleTable,
  statItem,
  statStrip,
} from "./styles";
import type { MovePreviewPanelProps } from "./types";

export function MovePreviewPanel({ path, preview, isLoading, isError }: MovePreviewPanelProps) {
  const { t } = useTranslation("library");

  if (isLoading) {
    return (
      <div className={previewPending()}>
        <Spinner size="sm" label={t("files.move.checking")} />
      </div>
    );
  }

  if (isError || preview === undefined) {
    return <Notice variant="danger" title={t("files.move.previewFailed")} />;
  }

  if (preview.outcome === "not_found") {
    return <Notice variant="danger" title={t("files.move.notFound")} />;
  }

  if (preview.outcome === "target_unavailable") {
    return <Notice variant="warning" title={t("files.move.targetUnavailable", { label: path.label })} />;
  }

  const size = formatBytes(preview.bytes);

  return (
    <div className={previewWrap()}>
      <div className={statStrip()}>
        <span className={statItem()}>{t("files.move.stats.songs", { count: preview.tracks })}</span>
        <span className={statItem()}>
          {preview.crossDevice ? t("files.move.stats.copy", { size }) : t("files.move.stats.rename", { size })}
        </span>
        {path.freeBytes === null ? null : (
          <span className={statItem()}>
            {t("files.move.stats.free", { size: formatBytes(path.freeBytes), label: path.label })}
          </span>
        )}
      </div>

      {preview.tracks === 0 ? (
        <Notice variant="warning" title={t("files.move.nothing")} />
      ) : (
        <Notice variant="info" title={preview.crossDevice ? t("files.move.crossDevice") : t("files.move.sameDevice")} />
      )}

      {preview.alreadyThere > 0 ? (
        <p className={previewNote()}>
          {t("files.move.alreadyThere", { count: preview.alreadyThere, label: path.label })}
        </p>
      ) : null}

      {preview.unmovable > 0 ? (
        <p className={previewNote()}>{t("files.move.unmovable", { count: preview.unmovable })}</p>
      ) : null}

      {preview.splitAlbums.length > 0 ? (
        <Notice variant="warning" title={t("files.move.splitTitle")}>
          <ul className={noticeList()}>
            {preview.splitAlbums.map((album) => (
              <li key={album.albumId}>
                {t("files.move.split", { moving: album.moving, total: album.total, album: album.albumName })}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {preview.blocked.length > 0 ? (
        <Notice variant="danger" title={t("files.move.blockedTitle", { label: path.label })}>
          <ul className={noticeList()}>
            {preview.blocked.map((album) => (
              <li key={album.albumId}>
                {t("files.move.blocked", {
                  album: album.albumName,
                  needed: formatBytes(album.neededBytes),
                  free: formatBytes(album.freeBytes),
                })}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {preview.sample.length > 0 ? (
        <div className={sampleTable()}>
          <div className={sampleHead()}>
            <span>{t("files.move.sampleFrom")}</span>
            <span />
            <span>{t("files.move.sampleTo", { label: path.label })}</span>
          </div>
          {preview.sample.map((entry) => (
            <div key={entry.from} className={sampleRow()}>
              <code className={samplePath()} title={entry.from}>
                {entry.from}
              </code>
              <ArrowRight className={sampleArrow()} aria-hidden />
              <code className={samplePath()} title={entry.to}>
                {entry.to}
              </code>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
