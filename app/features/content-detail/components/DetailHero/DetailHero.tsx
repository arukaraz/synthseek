"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { SocialIcon } from "@components/ui/SocialIcon";
import { primaryGradientButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import { Check, CheckCircle, Download, EllipsisVertical, Pencil, Trash2, Upload } from "lucide-react";
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
import { heroPillVisibility } from "./helpers";
import { ShareFan } from "./ShareFan";
import {
  avatarWrap,
  heroBackdrop,
  heroBackdropImage,
  heroBackdropVeil,
  heroEditInput,
  heroEditRow,
  heroBadgeDivider,
  heroBadgeRow,
  heroEditSave,
  heroKebab,
  heroMenuItem,
  heroMenuItemDanger,
  heroNameRow,
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
  showInLibraryPill = true,
  requestDisabled,
  requestDisabledTooltip,
  playlistControls,
}: DetailHeroProps) {
  const { t } = useTranslation("contentDetail");
  const badgeType = mode;
  const isArtist = mode === "artist";
  const canEdit = playlistControls?.canEdit ?? false;
  const isEditing = playlistControls?.isEditing ?? false;
  const { showInLibrary, showRequestButton, showActions } = heroPillVisibility({
    requestState,
    showRequest,
    showInLibraryPill,
  });

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
        <div className={heroBadgeRow()}>
          <span className={`type-badge type-badge-${badgeType}`}>{t(`badge.${badgeType}`)}</span>
          {playlistControls?.syncBadge ? <span aria-hidden className={heroBadgeDivider()} /> : null}
          {playlistControls?.syncBadge}
        </div>

        {playlistControls && isEditing ? (
          <div className={heroEditRow()}>
            <input
              autoFocus
              className={heroEditInput()}
              value={playlistControls.editValue}
              onChange={(event) => playlistControls.onEditChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") playlistControls.onEditSave();
                if (event.key === "Escape") playlistControls.onEditCancel();
              }}
              aria-label={playlistControls.labels.nameField}
            />
            <button
              type="button"
              className={heroEditSave()}
              onClick={playlistControls.onEditSave}
              aria-label={playlistControls.labels.save}
            >
              <Check className="size-4" aria-hidden />
            </button>
          </div>
        ) : playlistControls ? (
          <div className={heroNameRow()}>
            <h2 className={heroName({ size: "compact" })}>{name}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger className={heroKebab()} aria-label={playlistControls.labels.menu}>
                <EllipsisVertical className="size-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit ? (
                  <DropdownMenuItem className={heroMenuItem()} onSelect={playlistControls.onRename}>
                    <Pencil className="size-4" aria-hidden />
                    {playlistControls.labels.rename}
                  </DropdownMenuItem>
                ) : null}
                {playlistControls.onSyncToPlex ? (
                  <DropdownMenuItem
                    className={heroMenuItem()}
                    onSelect={playlistControls.onSyncToPlex}
                    disabled={playlistControls.isSyncing}
                  >
                    <Upload className="size-4" aria-hidden />
                    {playlistControls.isSyncing ? playlistControls.labels.syncing : playlistControls.labels.syncToPlex}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem className={heroMenuItemDanger()} onSelect={playlistControls.onDelete}>
                  <Trash2 className="size-4" aria-hidden />
                  {playlistControls.labels.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <h2 className={heroName({ size: mode === "playlist" ? "compact" : "default" })}>{name}</h2>
        )}

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

        {showActions ? (
          <div className={heroActions()}>
            {showInLibrary ? (
              <span className={alreadyInLibrary()}>
                <CheckCircle className="size-4" aria-hidden />
                {t("alreadyInLibrary")}
              </span>
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
