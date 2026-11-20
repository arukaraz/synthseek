"use client";

import { PlaylistVisibilityIcon } from "@components/PlaylistVisibilityIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { useTranslation } from "react-i18next";

import { visibilityMark } from "./styles";
import type { PlaylistVisibilityMarkProps } from "./types";

export function PlaylistVisibilityMark({ visibility }: PlaylistVisibilityMarkProps) {
  const { t } = useTranslation("library");
  const label = t(`playlists.visibility.${visibility}`);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={visibilityMark()} role="img" aria-label={label} data-visibility={visibility}>
            <PlaylistVisibilityIcon visibility={visibility} className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
