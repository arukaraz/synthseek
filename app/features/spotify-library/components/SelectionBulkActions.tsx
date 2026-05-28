"use client";

import { RefreshCcw, Upload } from "lucide-react";

import { inlineAct, selChip, selChipDot, selChipNum, selDivider } from "../styles";
import type { SelectionBulkActionsProps } from "./types";

export function SelectionBulkActions({
  selectedCount,
  onEnableSync,
  onDisableSync,
  onEnableImport,
  onDisableImport,
  onClear,
}: SelectionBulkActionsProps) {
  return (
    <>
      <span className={selChip()}>
        <span className={selChipDot()} />
        <span className={selChipNum()}>{selectedCount}</span> selected
      </span>
      <span className={selDivider()} />
      <button type="button" className={inlineAct()} onClick={onEnableSync}>
        <RefreshCcw className="size-3" />
        Enable sync
      </button>
      <button type="button" className={inlineAct()} onClick={onDisableSync}>
        Disable
      </button>
      <span className={selDivider()} />
      <button type="button" className={inlineAct()} onClick={onEnableImport}>
        <Upload className="size-3" />
        Enable import
      </button>
      <button type="button" className={inlineAct()} onClick={onDisableImport}>
        Disable import
      </button>
      <button type="button" className={inlineAct({ danger: true })} onClick={onClear}>
        Clear
      </button>
    </>
  );
}
