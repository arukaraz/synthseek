"use client";

import { useTranslation } from "react-i18next";

import { FILE_STATUS_KEYS, FILE_STATUS_TONES } from "../constants";
import { statusChip } from "../styles";
import type { FileStatusBadgeProps } from "../types";

export function FileStatusBadge({ file }: FileStatusBadgeProps) {
  const { t } = useTranslation("library");

  return (
    <span className={statusChip({ tone: FILE_STATUS_TONES[file.status] })}>{t(FILE_STATUS_KEYS[file.status])}</span>
  );
}
