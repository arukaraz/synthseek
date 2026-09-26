"use client";

import { ArrowDownToLine, RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  selectionBar,
  selectionBarChip,
  selectionBarChipDot,
  selectionBarChipNum,
  selectionBarClear,
  selectionBarSyncHint,
  selectionBarToggles,
} from "../styles";

import { TriStateToggle } from "./TriStateToggle";
import type { SelectionBulkBarProps } from "./types";

export function SelectionBulkBar({
  selectedCount,
  syncState,
  importState,
  hasPlaylists,
  isMixedType,
  onActivateSync,
  onActivateImport,
  onClear,
  disabled,
}: SelectionBulkBarProps) {
  const { t } = useTranslation("library");

  return (
    <div
      role="region"
      aria-label={t("librarySource.selection.regionLabel", { count: selectedCount })}
      className={selectionBar()}
    >
      <span className={selectionBarChip()}>
        <span className={selectionBarChipDot()} />
        <span className={selectionBarChipNum()}>{selectedCount}</span>
        {t("librarySource.selection.selected", { count: selectedCount })}
      </span>

      <span aria-live="polite" className="sr-only">
        {t("librarySource.selection.announce", { count: selectedCount })}
      </span>

      <button type="button" className={selectionBarClear()} onClick={onClear} disabled={disabled}>
        <X className="size-3.5" />
        {t("librarySource.selection.clear")}
      </button>

      <div className={selectionBarToggles()}>
        <TriStateToggle
          state={syncState}
          onActivate={onActivateSync}
          label={t("librarySource.selection.sync")}
          glyph={RefreshCw}
          ariaLabel={t("librarySource.selection.syncAria")}
          disabled={disabled || !hasPlaylists}
          description={!hasPlaylists ? t("librarySource.selection.syncPlaylistsOnly") : undefined}
        />
        {hasPlaylists && isMixedType ? (
          <span className={selectionBarSyncHint()}>{t("librarySource.selection.playlistsOnlyHint")}</span>
        ) : null}
        <TriStateToggle
          state={importState}
          onActivate={onActivateImport}
          label={t("librarySource.selection.import")}
          glyph={ArrowDownToLine}
          ariaLabel={t("librarySource.selection.importAria")}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
