"use client";

import { ExternalLink, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";

import {
  infoTooltipBody,
  infoTooltipContent,
  infoTooltipLink,
  infoTooltipList,
  infoTooltipText,
  infoTooltipTitle,
  infoTooltipTrigger,
} from "./styles";
import type { InfoTooltipProps } from "./types";

export function InfoTooltip({
  description,
  secondary,
  title,
  triggerLabel,
  points,
  learnMore,
  side = "top",
  align = "start",
  className,
  trigger = "hover",
}: InfoTooltipProps) {
  const { t } = useTranslation("components");
  const resolvedTriggerLabel = triggerLabel ?? t("infoTooltip.trigger");
  const content = (
    <div className={infoTooltipBody()}>
      {title ? <p className={infoTooltipTitle()}>{title}</p> : null}
      <p className={infoTooltipText()}>{description}</p>
      {secondary ? <p className={infoTooltipText()}>{secondary}</p> : null}
      {points && points.length > 0 ? (
        <ul className={infoTooltipList()}>
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  if (trigger === "click") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={infoTooltipTrigger({ className })}
            aria-label={resolvedTriggerLabel}
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
          {content}
          {learnMore ? (
            <a href={learnMore.href} target="_blank" rel="noreferrer" className={infoTooltipLink()}>
              {learnMore.label}
              <ExternalLink className="size-3" />
            </a>
          ) : null}
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
            aria-label={resolvedTriggerLabel}
            onClick={(e) => e.preventDefault()}
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={infoTooltipContent()}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
