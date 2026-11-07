"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";

import { lockedAction } from "./styles";
import type { LockedActionProps } from "./types";

export function LockedAction({ label, hint, children }: LockedActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={lockedAction()} role="button" tabIndex={0} aria-disabled="true" aria-label={label}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
