"use client";

import { useTranslation } from "react-i18next";

import { downloadSourceLabelKey } from "@utils/download-source";

import { acquisitionLicense, acquisitionLine, acquisitionRow } from "./styles";
import type { AcquisitionLineProps } from "./types";

export function AcquisitionLine({ source, sourceRef, license }: AcquisitionLineProps) {
  const { t } = useTranslation("requests");
  const { t: tSettings } = useTranslation("settings");
  const labelKey = downloadSourceLabelKey(source);

  return (
    <span className={acquisitionRow()}>
      <span className={acquisitionLine()} title={sourceRef ?? undefined}>
        {t("tracks.acquiredFrom", { source: labelKey ? tSettings(labelKey) : source })}
      </span>
      {license !== null ? (
        <a href={license} target="_blank" rel="noopener noreferrer" className={acquisitionLicense()}>
          {t("tracks.license")}
        </a>
      ) : null}
    </span>
  );
}
