"use client";

import { useTranslation } from "react-i18next";

import { REVIEW_REASON_KEYS, REVIEW_REASON_TONES } from "../constants";
import { reasonBadge } from "../styles";
import type { ReviewReasonBadgeProps } from "../types";

export function ReviewReasonBadge({ reason }: ReviewReasonBadgeProps) {
  const { t } = useTranslation("settings");

  return (
    <span className={reasonBadge({ tone: REVIEW_REASON_TONES[reason] })} title={t("quarantine.list.columns.reason")}>
      {t(REVIEW_REASON_KEYS[reason])}
    </span>
  );
}
