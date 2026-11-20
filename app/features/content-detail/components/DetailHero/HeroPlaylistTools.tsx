"use client";

import { PlaylistVisibility } from "@api/__generated__/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { PlaylistVisibilityIcon } from "@components/PlaylistVisibilityIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PLAYLIST_VISIBILITY_OPTIONS } from "../../constants";
import { heroToolButton, heroToolGroup, playSplitHint, playSplitOption } from "./styles";
import type { HeroPlaylistToolsProps } from "./types";

export function HeroPlaylistTools({ onOpenWorkshop, visibility }: HeroPlaylistToolsProps) {
  const { t } = useTranslation("contentDetail");
  const workshopLabel = t("workshop.open");
  const menuLabel = t("workshop.details.visibility");

  return (
    <TooltipProvider delayDuration={150}>
      <span className={heroToolGroup()}>
        {visibility ? (
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger
                  className={heroToolButton()}
                  disabled={visibility.disabled}
                  aria-label={t("workshop.details.visibilityNow", {
                    value: t(`workshop.details.${visibility.value}`),
                  })}
                  data-cy="hero-visibility"
                  data-visibility={visibility.value}
                >
                  <PlaylistVisibilityIcon visibility={visibility.value} className="size-4" />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={visibility.value}
                  onValueChange={(next) => {
                    const parsed = PlaylistVisibility.safeParse(next);
                    if (parsed.success) visibility.onChange(parsed.data);
                  }}
                >
                  {PLAYLIST_VISIBILITY_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem key={option} value={option}>
                      <PlaylistVisibilityIcon visibility={option} />
                      <span className={playSplitOption()}>
                        {t(`workshop.details.${option}`)}
                        <span className={playSplitHint()}>{t(`workshop.details.${option}Hint`)}</span>
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>
              {t("workshop.details.visibilityNow", { value: t(`workshop.details.${visibility.value}`) })}
            </TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={heroToolButton()}
              onClick={onOpenWorkshop}
              aria-label={workshopLabel}
              data-cy="hero-workshop"
            >
              <Wrench className="size-4" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent>{workshopLabel}</TooltipContent>
        </Tooltip>
      </span>
    </TooltipProvider>
  );
}
