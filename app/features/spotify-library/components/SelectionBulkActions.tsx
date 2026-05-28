"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { ChevronDown, RefreshCcw, RefreshCwOff, Upload, UploadCloud, X } from "lucide-react";

import { bulkMenuItem, bulkTrigger, inlineAct, selChip, selChipDot, selChipNum } from "../styles";
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={bulkTrigger()}>
            Bulk actions
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="min-w-[200px]">
          <DropdownMenuLabel>Sync</DropdownMenuLabel>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onEnableSync}>
            <RefreshCcw className="size-3.5" />
            Enable sync
          </DropdownMenuItem>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onDisableSync}>
            <RefreshCwOff className="size-3.5" />
            Disable sync
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Import</DropdownMenuLabel>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onEnableImport}>
            <UploadCloud className="size-3.5" />
            Enable import
          </DropdownMenuItem>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onDisableImport}>
            <Upload className="size-3.5 rotate-180" />
            Disable import
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button type="button" className={inlineAct()} onClick={onClear} aria-label="Clear selection">
        <X className="size-3.5" />
      </button>
    </>
  );
}
