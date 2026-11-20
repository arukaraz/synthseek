"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { artworkImage } from "@utils/artworkProxy";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { detailInitials } from "../../helpers";
import { HeroPlaySplit } from "../DetailHero";
import {
  workshopBadge,
  workshopCover,
  workshopCoverImage,
  workshopCoverInitials,
  workshopDivider,
  workshopHead,
  workshopIconButton,
  workshopIdentity,
  workshopMeta,
  workshopName,
  workshopTitles,
  workshopTools,
} from "./styles";
import type { WorkshopHeaderProps } from "./types";

export function WorkshopHeader({
  name,
  cover,
  trackCount,
  minutes,
  inLibrary,
  onPlay,
  onShuffle,
  onEnqueue,
  onExit,
}: WorkshopHeaderProps) {
  const { t } = useTranslation("contentDetail");

  return (
    <header className={workshopHead()}>
      <div className={workshopIdentity()}>
        <span className={workshopCover()}>
          {cover ? (
            <Image {...artworkImage(cover)} alt="" fill sizes="56px" className={workshopCoverImage()} />
          ) : (
            <span aria-hidden className={workshopCoverInitials()}>
              {detailInitials(name)}
            </span>
          )}
        </span>
        <div className={workshopTitles()}>
          <span className={workshopBadge()}>{t("workshop.badge")}</span>
          <h2 className={workshopName()}>{name}</h2>
          <p className={workshopMeta()}>
            <span>{t("playlistTrackCount", { count: trackCount })}</span>
            <span>{t("workshop.minutes", { count: minutes })}</span>
            <span>{t("workshop.inLibrary", { count: inLibrary })}</span>
          </p>
        </div>
      </div>

      <div className={workshopTools()}>
        {trackCount > 0 ? (
          <>
            <HeroPlaySplit mode="playlist" name={name} onPlay={onPlay} onShuffle={onShuffle} onEnqueue={onEnqueue} />
            <span aria-hidden className={workshopDivider()} />
          </>
        ) : null}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={workshopIconButton()}
                onClick={onExit}
                aria-label={t("workshop.exit")}
                data-cy="workshop-exit"
              >
                <LogOut className="size-4.5" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t("workshop.exit")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
