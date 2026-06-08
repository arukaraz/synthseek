"use client";

import i18n from "@locale";
import { ChevronsUp } from "lucide-react";
import { priorityChip } from "../styles";
import type { PriorityCellProps } from "../types";

export function PriorityCell({ item }: PriorityCellProps) {
  if (item.priority <= 0) return null;

  return (
    <span className={priorityChip()}>
      <ChevronsUp className="size-3" aria-hidden />
      {i18n.t("requests:tracks.prioritized")}
    </span>
  );
}
