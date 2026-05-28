"use client";

import { Button } from "@components/ui/Button";
import { RefreshCw } from "lucide-react";

import { bbStat, bbStatStrong, bottombar, bottombarLeft, bottombarRight } from "../styles";

import { AutoWatchToggles } from "./AutoWatchToggles";
import { SelectionBulkActions } from "./SelectionBulkActions";
import type { ModalBottombarProps } from "./types";

export function ModalBottombar({
  totalRows,
  totalTracks,
  selectedCount,
  onBulkSync,
  onBulkImport,
  onClearSelection,
  onSave,
  onCancel,
  isSaving,
  hasChanges,
  autoWatch,
  onWatchChange,
  onRefresh,
  isRefreshing,
}: ModalBottombarProps) {
  const showSelectionMode = selectedCount > 0;

  return (
    <div className={bottombar()}>
      <div className={bottombarLeft()}>
        {showSelectionMode ? (
          <SelectionBulkActions
            selectedCount={selectedCount}
            onEnableSync={() => onBulkSync(true)}
            onDisableSync={() => onBulkSync(false)}
            onEnableImport={() => onBulkImport(true)}
            onDisableImport={() => {
              onBulkImport(false);
              onBulkSync(false);
            }}
            onClear={onClearSelection}
          />
        ) : (
          <>
            <span className={bbStat()}>
              <span className={bbStatStrong()}>{totalRows}</span> rows
            </span>
            <span className={bbStat()}>
              <span className={bbStatStrong()}>{totalTracks}</span> tracks total
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Pull the latest list of items from your library"
              className="ml-auto sm:ml-0"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isRefreshing ? "Refreshing…" : "Refresh list"}</span>
            </Button>
          </>
        )}
      </div>
      <div className={bottombarRight()}>
        <AutoWatchToggles value={autoWatch} onChange={onWatchChange} />
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!hasChanges || isSaving} size="sm">
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
