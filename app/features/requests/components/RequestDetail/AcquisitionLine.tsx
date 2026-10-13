"use client";

import { useTranslation } from "react-i18next";

import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { acquisitionLicense, acquisitionLine, acquisitionRow } from "./styles";
import type { AcquisitionLineProps } from "./types";

export function AcquisitionLine({ source, sourceRef, license }: AcquisitionLineProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();

  return (
    <span className={acquisitionRow()}>
      <span className={acquisitionLine()} title={sourceRef ?? undefined}>
        {t("tracks.acquiredFrom", { source: sourceLabel(source) })}
      </span>
      {license !== null ? (
        <a href={license} target="_blank" rel="noopener noreferrer" className={acquisitionLicense()}>
          {t("tracks.license")}
        </a>
      ) : null}
    </span>
  );
}
