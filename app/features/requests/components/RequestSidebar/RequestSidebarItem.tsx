"use client";

import { ProgressBar } from "@components/ui/ProgressBar";
import { ACTIVE_STATUSES, type RequestWithTracks } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { getContentTypeLabel } from "@utils/content-type-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { sidebarItem } from "./styles";

interface RequestSidebarItemProps {
  request: RequestWithTracks;
  isSelected: boolean;
  onSelect: () => void;
}

export function RequestSidebarItem({ request, isSelected, onSelect }: RequestSidebarItemProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[request.status];
  const isActive = ACTIVE_STATUSES.includes(request.status as (typeof ACTIVE_STATUSES)[number]);
  const typeLabel = getContentTypeLabel(request.contentType).toUpperCase();
  const progressPercent = request.total_tracks > 0 ? (request.completed_tracks / request.total_tracks) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-active={isSelected ? "true" : undefined}
      data-status={request.status}
      data-cy="sidebar-request-item"
      data-testid="sidebar-request-item"
      className={cn(
        sidebarItem(),
        isSelected &&
          "bg-primary-500/10 before:bg-primary-500 before:absolute before:inset-y-0 before:left-0 before:w-0.5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-fg/40 truncate text-[10px] font-semibold tracking-wider">{typeLabel}</span>
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusConfig.glowColor)}
            aria-label={statusConfig.label}
          />
        </div>
        <span className="text-fg/40 shrink-0 font-mono text-xs">
          {request.completed_tracks}/{request.total_tracks}
        </span>
      </div>

      <div className="min-w-0">
        <p className={cn("truncate text-sm font-semibold", isSelected ? "text-fg" : "text-fg/90")}>{request.name}</p>
        <p className="text-fg/50 truncate text-xs">{request.artist}</p>
      </div>

      <ProgressBar progress={progressPercent} isActive={isActive} size="md" gradient={statusConfig.glowColor} />
    </button>
  );
}
