"use client";

import { SocialIcon } from "@components/ui/SocialIcon";
import { primaryGradientButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import { CheckCircle, Download, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { detailInitials } from "../../helpers";
import {
  alreadyInLibrary,
  hero,
  heroActions,
  heroCover,
  heroImage,
  heroInfo,
  heroInitials,
  heroName,
  heroStats,
  heroSubtitle,
  heroSubtitleButton,
} from "../../styles";
import { GenreChips } from "./GenreChips";
import { ShareFan } from "./ShareFan";
import {
  avatarWrap,
  heroBackdrop,
  heroBackdropImage,
  heroBackdropVeil,
  heroDeleteButton,
  heroEditActions,
  heroEditButton,
  heroPlaylistControls,
  heroSocialLink,
  heroSocials,
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
  onRequest,
  onSubtitleClick,
  showRequest = true,
  requestDisabled,
  requestDisabledTooltip,
  playlistControls,
}: DetailHeroProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const badgeType = mode;
  const isArtist = mode === "artist";
  const renameLabel = tLibrary("playlists.actions.rename");
  const deleteLabel = tLibrary("playlists.actions.delete");

  return (
    <header className={hero()}>
      {cover ? (
        <div className={heroBackdrop()} aria-hidden>
          <Image src={artworkProxySrc(cover)} alt="" fill sizes="100vw" className={heroBackdropImage()} />
          <span className={heroBackdropVeil()} />
        </div>
      ) : null}

      <div className={avatarWrap()}>
        <div className={heroCover({ shape: isArtist ? "round" : "square" })}>
          {cover ? (
            <Image src={artworkProxySrc(cover)} alt="" fill sizes="160px" className={heroImage()} />
          ) : (
            <span aria-hidden className={heroInitials()}>
              {detailInitials(name)}
            </span>
          )}
        </div>
        {isArtist ? <ShareFan socials={socials} /> : null}
      </div>

      <div className={heroInfo()}>
        <span className={`type-badge type-badge-${badgeType}`}>{t(`badge.${badgeType}`)}</span>
        <h2 className={heroName()}>{name}</h2>
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

        <GenreChips genres={genres} />

        {statsSlot ? <div className={heroStats()}>{statsSlot}</div> : null}

        {showRequest ? (
          <div className={heroActions()}>
            {requestState === "inLibrary" ? (
              <span className={alreadyInLibrary()}>
                <CheckCircle className="size-4" aria-hidden />
                {t("alreadyInLibrary")}
              </span>
            ) : (
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
            )}
          </div>
        ) : null}

        {playlistControls ? (
          <div className={heroPlaylistControls()}>
            {playlistControls.syncSlot}
            <div className={heroEditActions()}>
              <button
                type="button"
                className={heroEditButton()}
                onClick={playlistControls.onRename}
                disabled={!playlistControls.canEdit}
                title={playlistControls.canEdit ? undefined : playlistControls.disabledTooltip}
              >
                <Pencil className="size-4" aria-hidden />
                {renameLabel}
              </button>
              <button
                type="button"
                className={heroDeleteButton()}
                onClick={playlistControls.onDelete}
                title={deleteLabel}
              >
                <Trash2 className="size-4" aria-hidden />
                {deleteLabel}
              </button>
            </div>
          </div>
        ) : null}

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
