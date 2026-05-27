"use client";

import { RefreshCcw } from "lucide-react";

import { Button } from "@components/ui/Button";

import { footer, footerRow, helperText } from "../styles";

import type { ImportFooterProps } from "./types";

export function ImportFooter({
  totalSelected,
  onImport,
  onCancel,
  onSyncAll,
  isPending,
  isSyncAllPending,
  canSyncAll,
}: ImportFooterProps) {
  return (
    <div className={footer()}>
      <div className={footerRow()}>
        <span className={helperText()}>
          {totalSelected === 0
            ? "Select playlists, liked songs, or albums to import."
            : `${totalSelected} item${totalSelected === 1 ? "" : "s"} selected`}
        </span>
        <div className="flex items-center gap-2">
          {canSyncAll && onSyncAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSyncAll}
              disabled={isSyncAllPending || isPending}
            >
              <RefreshCcw className="mr-1.5 size-3.5" />
              {isSyncAllPending ? "Syncing…" : "Sync all now"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onImport} disabled={totalSelected === 0 || isPending} size="sm">
            {isPending ? "Importing…" : "Import"}
          </Button>
        </div>
      </div>
    </div>
  );
}
