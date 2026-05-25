"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { isRetryableStatus } from "@utils/status-helpers";
import { MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import { mobileActionsButton } from "../../styles";
import type { FlatTrackRow } from "../../../types";

interface TrackActionsCellProps {
  item: FlatTrackRow;
  canAct: boolean;
  onRetry: () => void;
  onCancel: () => void;
}

export function TrackActionsCell({ item, canAct, onRetry, onCancel }: TrackActionsCellProps) {
  if (!canAct) return null;

  const canRetry = isRetryableStatus(item.status);

  return (
    <>
      <div className="desktop-only items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {canRetry && (
          <IconButton
            icon={RefreshCw}
            variant="green"
            size="sm"
            onClick={onRetry}
            aria-label="Retry download"
            title="Retry"
          />
        )}
        <IconButton icon={Trash2} variant="red" size="sm" onClick={onCancel} aria-label="Cancel track" title="Cancel" />
      </div>

      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={mobileActionsButton()} aria-label="Actions menu">
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canRetry && (
              <DropdownMenuItem onClick={onRetry} className="text-green-400 hover:text-green-300">
                <RefreshCw className="size-4" />
                Retry download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onCancel} className="text-red-400 hover:text-red-300">
              <Trash2 className="size-4" />
              Cancel track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
