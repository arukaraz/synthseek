"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { CloudOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { degradedProviderLabel } from "./helpers";
import { degradedChip, degradedTooltipIntro, degradedTooltipList } from "./styles";
import type { DegradedSourcesChipProps } from "./types";

export function DegradedSourcesChip({ sources }: DegradedSourcesChipProps) {
  const { t } = useTranslation("contentDetail");

  if (sources.length === 0) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={degradedChip()}>
            <CloudOff className="size-3.5" aria-hidden />
            {t("degraded.label")}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <p className={degradedTooltipIntro()}>{t("degraded.tooltipIntro")}</p>
          <ul className={degradedTooltipList()}>
            {sources.map((source) => (
              <li key={source}>{degradedProviderLabel(source, t)}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
