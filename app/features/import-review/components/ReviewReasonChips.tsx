"use client";

import { useTranslation } from "react-i18next";

import { REVIEW_REASON_KEYS } from "../constants";
import { reasonChip, reasonChipCount, reasonChips } from "../styles";
import type { ReviewReasonChipsProps } from "../types";

export function ReviewReasonChips({ counts, total, active, onChange }: ReviewReasonChipsProps) {
  const { t } = useTranslation(["requests", "settings"]);

  return (
    <div className={reasonChips()} role="group" aria-label={t("requests:review.reasonFilter.label")}>
      <button
        type="button"
        className={reasonChip({ active: active === "all" })}
        aria-pressed={active === "all"}
        onClick={() => onChange("all")}
      >
        {t("requests:review.reasonFilter.all")}
        <span className={reasonChipCount()}>{total}</span>
      </button>
      {counts.map(({ reason, count }) => (
        <button
          key={reason}
          type="button"
          className={reasonChip({ active: active === reason })}
          aria-pressed={active === reason}
          onClick={() => onChange(reason)}
        >
          {t(REVIEW_REASON_KEYS[reason], { ns: "settings" })}
          <span className={reasonChipCount()}>{count}</span>
        </button>
      ))}
    </div>
  );
}
