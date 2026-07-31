"use client";

import { useTranslation } from "react-i18next";

import { BATCH_STATUS_KEYS, BATCH_STATUS_TONES } from "../constants";
import { statusChip } from "../styles";
import type { BatchStatusBadgeProps } from "../types";

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  const { t } = useTranslation("library");

  return <span className={statusChip({ tone: BATCH_STATUS_TONES[status] })}>{t(BATCH_STATUS_KEYS[status])}</span>;
}
