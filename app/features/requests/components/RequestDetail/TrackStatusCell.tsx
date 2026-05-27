"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { tracksReasonButton } from "./styles";
import { TrackStatusIcon } from "./TrackStatusIcon";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[track.status];
  const reasonConfig = track.failure_reason ? statusConfig.reasons?.[track.failure_reason] : undefined;
  const display = reasonConfig ?? statusConfig;
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <TrackStatusIcon status={track.status} />
      <span className={cn("truncate text-xs font-medium", statusConfig.color)}>{display.label}</span>
      {reasonConfig && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={`More info: ${display.label}`} className={tracksReasonButton()}>
              <HelpCircle className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top">{display.description}</PopoverContent>
        </Popover>
      )}
    </div>
  );
}
