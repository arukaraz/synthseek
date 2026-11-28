"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

import { NAME_TIP_DELAY_MS } from "./constants";
import type { NameTipProps } from "./types";

export function NameTip({ label, children }: NameTipProps) {
  const { mode } = useAccessibility();
  if (!mode || label === undefined || label === "") return children;

  return (
    <TooltipProvider delayDuration={NAME_TIP_DELAY_MS}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
