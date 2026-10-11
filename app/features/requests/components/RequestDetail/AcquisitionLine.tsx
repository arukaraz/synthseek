"use client";

import { useTranslation } from "react-i18next";

import { downloadSourceLabelKey } from "@utils/download-source";

import { acquisitionLine } from "./styles";
import type { AcquisitionLineProps } from "./types";

export function AcquisitionLine({ source, sourceRef }: AcquisitionLineProps) {
  const { t } = useTranslation("requests");
  const { t: tSettings } = useTranslation("settings");
  const labelKey = downloadSourceLabelKey(source);

  return (
    <span className={acquisitionLine()} title={sourceRef ?? undefined}>
      {t("tracks.acquiredFrom", { source: labelKey ? tSettings(labelKey) : source })}
    </span>
  );
}
