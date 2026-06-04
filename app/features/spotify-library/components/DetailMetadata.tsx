"use client";

import { useTranslation } from "react-i18next";

import { formatLastSync } from "../helpers";
import {
  detailSection,
  detailSectionTitle,
  detailSectionTitleLine,
  metaGrid,
  metaKey,
  metaVal,
  metaValText,
} from "../styles";
import type { DetailMetadataProps } from "./types";

export function DetailMetadata({ sourceId, released, label, lastSyncedAt }: DetailMetadataProps) {
  const { t } = useTranslation("library");

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
        <div className={metaVal()}>{formatLastSync(lastSyncedAt)}</div>
      </div>
    </div>
  );
}
