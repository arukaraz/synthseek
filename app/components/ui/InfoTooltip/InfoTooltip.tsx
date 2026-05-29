"use client";

import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";

import { infoTooltipContent, infoTooltipTrigger } from "./styles";
import type { InfoTooltipProps } from "./types";

export function InfoTooltip({ description, side = "top", align = "start", className }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={infoTooltipTrigger({ className })}
            aria-label="More information"
            onClick={(e) => e.preventDefault()}
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={infoTooltipContent()}>
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
