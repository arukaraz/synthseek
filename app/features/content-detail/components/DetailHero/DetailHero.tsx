"use client";

import { RequestSplitButton } from "@components/RequestSplitButton";
import { SocialIcon } from "@components/ui/SocialIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { primaryGradientButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { artworkImage } from "@utils/artworkProxy";
import { CheckCircle, Download, Wrench } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { detailInitials } from "../../helpers";
import {
  alreadyInLibrary,
  hero,
  heroActions,
  heroCover,
  heroIdentity,
  heroImage,
  heroInfo,
  heroInitials,
  heroMeta,
  heroName,
  heroStats,
  heroSubtitle,
  heroSubtitleButton,
  heroTop,
} from "../../styles";
import { DegradedSourcesChip } from "../DegradedSourcesChip";
import { GenreChips } from "./GenreChips";
import { HeroPlaySplit } from "./HeroPlaySplit";
import { heroPillVisibility } from "./helpers";
import { ShareFan } from "./ShareFan";
import {
  avatarWrap,
  heroActionsSpacer,
  heroBackdrop,
  heroBackdropImage,
  heroBackdropVeil,
  heroBadgeDivider,
  heroBadgeRow,
  heroSocialLink,
  heroSocials,
  heroToolButton,
  heroToolDivider,
} from "./styles";
import type { DetailHeroProps } from "./types";

function DetailHeroComponent({
  mode,
  name,
  subtitle,
  cover,
  genres,
  requestState,
  socials,
  statsSlot,
  followSlot,
  onRequest,
  onCustomizeRequest,
  onPlay,
  onShuffle,
  onStartRadio,
  onEnqueue,
  onSubtitleClick,
  showRequest = true,
  showInLibraryPill = true,
  requestDisabled,
  requestDisabledTooltip,
  playlistControls,
  degradedSources,
}: DetailHeroProps) {
  const { t } = useTranslation("contentDetail");
  const badgeType = mode;
  const isArtist = mode === "artist";
  const { showInLibrary, showRequestButton, showActions } = heroPillVisibility({
    requestState,
    showRequest,
    showInLibraryPill,
  });
  const isPlaylist = mode === "playlist";
  const onOpenWorkshop = playlistControls?.onOpenWorkshop;
  const quiet = playlistControls?.quietRequest === true;
  const requestShown = !showInLibrary && showRequestButton;
  const actionCount = [showActions, onPlay, followSlot, onOpenWorkshop].filter(Boolean).length;

  return (
    <header className={hero()}>
      {cover ? (
        <div className={heroBackdrop()} aria-hidden>
          <Image {...artworkImage(cover)} alt="" fill sizes="100vw" className={heroBackdropImage()} />
          <span className={heroBackdropVeil()} />
        </div>
      ) : null}

      <div className={avatarWrap()}>
        <div className={heroCover({ shape: isArtist ? "round" : "square" })}>
          {cover ? (
            <Image {...artworkImage(cover)} alt="" fill sizes="160px" className={heroImage()} />
          ) : (
            <span aria-hidden className={heroInitials()}>
              {detailInitials(name)}
            </span>
          )}
        </div>
        {isArtist ? <ShareFan socials={socials} /> : null}
      </div>

      <div className={heroInfo()}>
        <div className={heroTop()}>
          <div className={heroIdentity()}>
            <div className={heroBadgeRow()}>
              <span className={`type-badge type-badge-overlay type-badge-${badgeType}`}>{t(`badge.${badgeType}`)}</span>
              {playlistControls?.syncBadge ? <span aria-hidden className={heroBadgeDivider()} /> : null}
              {playlistControls?.syncBadge}
              {degradedSources ? <DegradedSourcesChip sources={degradedSources} /> : null}
            </div>

            <h2 className={heroName({ size: isPlaylist ? "compact" : "default" })}>{name}</h2>

            {subtitle ? (
              onSubtitleClick ? (
                <button
                  type="button"
                  className={heroSubtitleButton()}
                  onClick={onSubtitleClick}
                  aria-label={t("viewArtist", { name: subtitle })}
                >
                  {subtitle}
                </button>
              ) : (
                <p className={heroSubtitle()}>{subtitle}</p>
              )
            ) : null}

            {isPlaylist && statsSlot ? (
              <div className={heroMeta()}>
                {statsSlot}
                {genres.length > 0 ? <span aria-hidden className={heroBadgeDivider()} /> : null}
                <GenreChips genres={genres} />
              </div>
            ) : (
              <GenreChips genres={genres} />
            )}

            {actionCount > 0 ? (
              <div className={heroActions({ crowded: actionCount > 2 && !quiet })}>
                {onPlay ? (
                  <HeroPlaySplit
                    mode={mode}
                    name={name}
                    onPlay={onPlay}
                    onShuffle={onShuffle}
                    onStartRadio={onStartRadio}
                    onEnqueue={onEnqueue}
                  />
                ) : null}
                {quiet ? <span aria-hidden className={heroActionsSpacer()} /> : null}
                {showInLibrary ? (
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={alreadyInLibrary()} role="img" aria-label={t("alreadyInLibrary")} tabIndex={0}>
                          <CheckCircle className="size-5" aria-hidden />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t("alreadyInLibrary")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : showRequestButton && onRequest && onCustomizeRequest ? (
                  <RequestSplitButton
                    name={name}
                    label={requestState === "requestMissing" ? t("requestMissing") : t("request")}
                    shortLabel={quiet ? t("request") : undefined}
                    count={quiet ? playlistControls?.missingCount : undefined}
                    size={quiet ? "md" : "hero"}
                    tone={quiet ? "outline" : "primary"}
                    onRequest={onRequest}
                    onCustomize={onCustomizeRequest}
                    disabled={requestDisabled}
                    disabledReason={requestDisabledTooltip}
                    dataCy="hero-request"
                  />
                ) : showRequestButton ? (
                  <button
                    type="button"
                    className={cn(
                      primaryGradientButton({ size: "lg" }),
                      requestDisabled && "cursor-not-allowed opacity-50"
                    )}
                    onClick={onRequest}
                    disabled={requestDisabled}
                    title={requestDisabled ? (requestDisabledTooltip ?? undefined) : undefined}
                  >
                    <Download className="size-4" />
                    {requestState === "requestMissing" ? t("requestMissing") : t("request")}
                  </button>
                ) : null}
                {followSlot}
                {onOpenWorkshop ? (
                  <>
                    {requestShown ? <span aria-hidden className={heroToolDivider()} /> : null}
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={heroToolButton()}
                            onClick={onOpenWorkshop}
                            aria-label={t("workshop.open")}
                            data-cy="hero-workshop"
                          >
                            <Wrench className="size-4.5" aria-hidden />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{t("workshop.open")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {statsSlot && !isPlaylist ? <div className={heroStats()}>{statsSlot}</div> : null}
        </div>

        {isArtist && socials.length > 0 ? (
          <div className={heroSocials()}>
            {socials.map((social) => (
              <a
                key={social.brand}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`social.${social.brand}`)}
                className={heroSocialLink()}
              >
                <SocialIcon brand={social.brand} className="size-4" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export const DetailHero = memo(DetailHeroComponent);
