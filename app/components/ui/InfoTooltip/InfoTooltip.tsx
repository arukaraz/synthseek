"use client";

import { Info } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";

import { infoTooltipContent, infoTooltipTrigger } from "./styles";
import type { InfoTooltipProps } from "./types";

export function InfoTooltip({
  description,
  side = "top",
  align = "start",
  className,
  trigger = "hover",
}: InfoTooltipProps) {
  if (trigger === "click") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={infoTooltipTrigger({ className })}
            aria-label="More information"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <Info className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          align={align}
          className={infoTooltipContent()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {description}
        </PopoverContent>
      </Popover>
    );
  }

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
