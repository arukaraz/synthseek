"use client";

import { ListPlus, RefreshCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  selectionAction,
  selectionActionCount,
  selectionActionLabel,
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
        <button
          type="button"
          className={selectionAction()}
          onClick={onRetryFailed}
          disabled={isRetrying}
          aria-label={t("page.selection.retryFailed", { count: failedCount })}
        >
          <RefreshCcw className="size-3.5 shrink-0" aria-hidden />
          <span className={selectionActionCount()} aria-hidden>
            {failedCount}
          </span>
          <span className={selectionActionLabel()} aria-hidden>
            {t("page.selection.retryFailed", { count: failedCount })}
          </span>
        </button>
      ) : null}

      <button
        type="button"
        className={selectionAction()}
        onClick={onAddToPlaylist}
        aria-label={t("page.selection.addToPlaylist")}
      >
        <ListPlus className="size-3.5 shrink-0" aria-hidden />
        <span className={selectionActionLabel()} aria-hidden>
          {t("page.selection.addToPlaylist")}
        </span>
      </button>

      <button type="button" className={selectionClear()} onClick={onClear} aria-label={t("page.selection.clear")}>
        <X className="size-3.5 shrink-0" aria-hidden />
        <span className={selectionActionLabel()} aria-hidden>
          {t("page.selection.clear")}
        </span>
      </button>
    </div>
  );
}
