"use client";

import { IconButton } from "@components/ui/IconButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";

import { TOOLTIP_DELAY_MS } from "./constants";
import type { TipIconButtonProps } from "./types";

export function TipIconButton({ label, ...props }: TipIconButtonProps) {
  return (
    <TooltipProvider delayDuration={TOOLTIP_DELAY_MS}>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton aria-label={label} {...props} />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
