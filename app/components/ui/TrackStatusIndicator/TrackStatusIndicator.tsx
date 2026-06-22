"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { indicatorLabel, indicatorRow, reasonButton } from "./styles";
import { TrackStatusIcon } from "./TrackStatusIcon";
import type { TrackStatusIndicatorProps } from "./types";

export function TrackStatusIndicator({ status, failureReason, hideLabel = false }: TrackStatusIndicatorProps) {
  const { t } = useTranslation("components");
  const { t: tStatus } = useTranslation("status");
  const statusConfig = REQUEST_STATUS_CONFIG[status];
  const reasonConfig = failureReason ? statusConfig.reasons?.[failureReason] : undefined;
  const [popoverOpen, setPopoverOpen] = useState(false);

  const label =
    reasonConfig && failureReason
      ? tStatus(`failureReason.${failureReason}.label`)
      : tStatus(`request.${status}.label`);
  const description =
    reasonConfig && failureReason
      ? tStatus(`failureReason.${failureReason}.description`)
      : tStatus(`request.${status}.description`);

  return (
    <div className={indicatorRow()}>
      <TrackStatusIcon status={status} />
      <span className={cn(indicatorLabel({ hidden: hideLabel }), statusConfig.color)}>{label}</span>
      {reasonConfig && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={t("trackStatus.moreInfo", { label })} className={reasonButton()}>
              <HelpCircle className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top">{description}</PopoverContent>
        </Popover>
      )}
    </div>
  );
}
