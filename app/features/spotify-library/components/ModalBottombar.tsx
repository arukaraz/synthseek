"use client";

import { Button } from "@components/ui/Button";
import { ArrowRight } from "lucide-react";

import { bbStat, bbStatStrong, bottombar } from "../styles";

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
}: ModalBottombarProps) {
  const showSelectionMode = selectedCount > 0;

  return (
    <div className={bottombar()}>
      <div className="flex flex-wrap items-center gap-3">
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
          </>
        )}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        <AutoWatchToggles value={autoWatch} onChange={onWatchChange} />
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!hasChanges || isSaving} size="sm">
          {isSaving ? "Saving…" : "Save changes"}
          {hasChanges && !isSaving && <ArrowRight className="ml-1 size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
