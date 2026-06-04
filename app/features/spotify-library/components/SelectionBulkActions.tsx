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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("library");

  return (
    <>
      <span className={selChip()}>
        <span className={selChipDot()} />
        <span className={selChipNum()}>{selectedCount}</span> {t("spotifyLibrary.bulk.selected")}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={bulkTrigger()}>
            {t("spotifyLibrary.bulk.actions")}
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="min-w-[200px]">
          <DropdownMenuLabel>{t("spotifyLibrary.bulk.syncGroup")}</DropdownMenuLabel>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onEnableSync}>
            <RefreshCcw className="size-3.5" />
            {t("spotifyLibrary.bulk.enableSync")}
          </DropdownMenuItem>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onDisableSync}>
            <RefreshCwOff className="size-3.5" />
            {t("spotifyLibrary.bulk.disableSync")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("spotifyLibrary.bulk.importGroup")}</DropdownMenuLabel>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onEnableImport}>
            <UploadCloud className="size-3.5" />
            {t("spotifyLibrary.bulk.enableImport")}
          </DropdownMenuItem>
          <DropdownMenuItem className={bulkMenuItem()} onSelect={onDisableImport}>
            <Upload className="size-3.5 rotate-180" />
            {t("spotifyLibrary.bulk.disableImport")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button type="button" className={inlineAct()} onClick={onClear} aria-label={t("spotifyLibrary.bulk.clearAria")}>
        <X className="size-3.5" />
      </button>
    </>
  );
}
