"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { tracksReasonButton } from "./styles";
import { TrackStatusIcon } from "./TrackStatusIcon";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  const { t } = useTranslation("requests");
  const { t: tStatus } = useTranslation("status");
  const statusConfig = REQUEST_STATUS_CONFIG[track.status];
  const reasonConfig = track.failure_reason ? statusConfig.reasons?.[track.failure_reason] : undefined;
  const [popoverOpen, setPopoverOpen] = useState(false);

  const label =
    reasonConfig && track.failure_reason
      ? tStatus(`failureReason.${track.failure_reason}.label`)
      : tStatus(`request.${track.status}.label`);
  const description =
    reasonConfig && track.failure_reason
      ? tStatus(`failureReason.${track.failure_reason}.description`)
      : tStatus(`request.${track.status}.description`);

  return (
    <div className="flex items-center gap-2">
      <TrackStatusIcon status={track.status} />
      <span className={cn("truncate text-xs font-medium", statusConfig.color)}>{label}</span>
      {reasonConfig && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={t("tracks.moreInfo", { label })} className={tracksReasonButton()}>
              <HelpCircle className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top">{description}</PopoverContent>
        </Popover>
      )}
    </div>
  );
}
