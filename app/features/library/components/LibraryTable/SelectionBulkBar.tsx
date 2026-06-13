"use client";

import { ListPlus, RefreshCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  selectionAction,
  selectionBar,
  selectionChip,
  selectionChipDot,
  selectionChipNum,
  selectionClear,
} from "./styles";
import type { SelectionBulkBarProps } from "./types";

export function SelectionBulkBar({
  selectedCount,
  failedCount,
  onRetryFailed,
  onAddToPlaylist,
  onClear,
  isRetrying,
}: SelectionBulkBarProps) {
  const { t } = useTranslation("library");

  return (
    <div className={selectionBar()}>
      <span className={selectionChip()}>
        <span className={selectionChipDot()} />
        <span className={selectionChipNum()}>{selectedCount}</span>
        {t("page.selection.selected")}
      </span>

      {failedCount > 0 ? (
        <button type="button" className={selectionAction()} onClick={onRetryFailed} disabled={isRetrying}>
          <RefreshCcw className="size-3.5" />
          {t("page.selection.retryFailed", { count: failedCount })}
        </button>
      ) : null}

      <button type="button" className={selectionAction()} onClick={onAddToPlaylist}>
        <ListPlus className="size-3.5" />
        {t("page.selection.addToPlaylist")}
      </button>

      <button type="button" className={selectionClear()} onClick={onClear}>
        <X className="size-3.5" />
        {t("page.selection.clear")}
      </button>
    </div>
  );
}
