"use client";

import { useTranslation } from "react-i18next";

import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";
import { cn } from "@utils/cn";

import { releaseStateInfo } from "./helpers";
import { releaseState, releaseStateGlyph, releaseStateLabel, releaseStateTrigger } from "./styles";
import type { ReleaseStateProps } from "./types";

export function ReleaseState({ state, autoRequest, showLabel = true, className }: ReleaseStateProps) {
  const { t } = useTranslation("follows");
  const info = releaseStateInfo(state, autoRequest);
  const Glyph = info.glyph;
  const label = t(info.labelKey);
  const glyph = <Glyph className={releaseStateGlyph({ warning: state === "quota_skipped" })} aria-hidden />;

  if (showLabel) {
    return (
      <span className={cn(releaseState(), className)}>
        {glyph}
        <span className={releaseStateLabel()}>{label}</span>
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="img" tabIndex={0} aria-label={label} className={cn(releaseStateTrigger(), className)}>
          {glyph}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
