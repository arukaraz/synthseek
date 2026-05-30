"use client";

import { Download } from "lucide-react";

import { Button } from "@components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";
import { primaryGradientButton } from "@theme/utilities/styles";

import type { RequestAllButtonProps } from "./types";

export function RequestAllButton({ onRequestAll, disabled, tooltip }: RequestAllButtonProps) {
  const button = (
    <Button
      onClick={onRequestAll}
      disabled={disabled}
      size="lg"
      className={`${primaryGradientButton({ size: "lg", glow: "primary", hover: "lighten" })} text-overlay-fg shrink-0 font-semibold`}
      data-cy="content-browser-request-all-btn"
    >
      <Download className="h-5 w-5 sm:mr-2" />
      <span className="hidden sm:inline">Request</span>
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0">{button}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
