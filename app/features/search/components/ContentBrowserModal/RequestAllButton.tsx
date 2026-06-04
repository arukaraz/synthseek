"use client";

import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";
import { primaryGradientButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";

import type { RequestAllButtonProps } from "./types";

export function RequestAllButton({ onRequestAll, disabled, tooltip }: RequestAllButtonProps) {
  const { t } = useTranslation("search");
  const button = (
    <Button
      onClick={onRequestAll}
      disabled={disabled}
      size="lg"
      className={cn(
        primaryGradientButton({ size: "lg", glow: "primary", hover: "lighten" }),
        "text-overlay-fg shrink-0 text-sm font-semibold"
      )}
      data-cy="content-browser-request-all-btn"
    >
      <Download className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">{t("browser.request")}</span>
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
