"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { TRACK_GROUP_STYLE } from "./consts";
import { summaryChip, summaryChipCount, summaryChipDot } from "./styles";
import type { SummaryFilterChipProps } from "./types";

export function SummaryFilterChip({ group, count, active, dimmed, onToggle }: SummaryFilterChipProps) {
  const { t } = useTranslation("requests");

  return (
    <button
      type="button"
      className={summaryChip({ active, dimmed })}
      aria-pressed={active}
      onClick={() => onToggle(group)}
      data-filter={group}
    >
      <span className={cn(summaryChipDot(), TRACK_GROUP_STYLE[group].fill)} aria-hidden />
      {t(`summary.groups.${group}`)}
      <span className={summaryChipCount()}>{count}</span>
    </button>
  );
}
