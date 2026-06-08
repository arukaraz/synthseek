"use client";

import { ChevronsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { priorityChip } from "./styles";
import type { TrackPriorityCellProps } from "./types";

export function PriorityCell({ track }: TrackPriorityCellProps) {
  const { t } = useTranslation("requests");

  if (track.priority <= 0) return null;

  return (
    <span className={priorityChip()}>
      <ChevronsUp className="size-3" aria-hidden />
      {t("tracks.prioritized")}
    </span>
  );
}
