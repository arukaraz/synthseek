"use client";

import { useTranslation } from "react-i18next";

import { formatLastSync, formatLastSyncFull } from "../helpers";
import {
  detailSection,
  detailSectionTitle,
  detailSectionTitleLine,
  metaGrid,
  metaKey,
  metaVal,
  metaValFull,
  metaValText,
} from "../styles";
import type { DetailMetadataProps } from "./types";

export function DetailMetadata({ sourceId, released, label, lastSyncedAt }: DetailMetadataProps) {
  const { t } = useTranslation("library");
  const lastSyncFull = formatLastSyncFull(lastSyncedAt);

  return (
    <div className={detailSection()}>
      <h3 className={detailSectionTitle()}>
        {t("spotifyLibrary.metadata.title")} <span className={detailSectionTitleLine()} />
      </h3>
      <div className={metaGrid()}>
        <div className={metaKey()}>{t("spotifyLibrary.metadata.sourceId")}</div>
        <div className={metaVal()}>{sourceId}</div>
        {released && (
          <>
            <div className={metaKey()}>{t("spotifyLibrary.metadata.released")}</div>
            <div className={metaVal()}>{released}</div>
          </>
        )}
        {label && (
          <>
            <div className={metaKey()}>{t("spotifyLibrary.metadata.label")}</div>
            <div className={metaValText()}>{label}</div>
          </>
        )}
        <div className={metaKey()}>{t("spotifyLibrary.metadata.lastSync")}</div>
        <div className={metaVal()}>
          {formatLastSync(lastSyncedAt)}
          {lastSyncFull ? <span className={metaValFull()}>{lastSyncFull}</span> : null}
        </div>
      </div>
    </div>
  );
}
