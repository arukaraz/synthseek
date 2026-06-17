"use client";

import { SocialIcon } from "@components/ui/SocialIcon";
import { primaryGradientButton } from "@theme/utilities/styles";
import { CheckCircle, Download } from "lucide-react";
import Image from "next/image";
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
} from "../../styles";
import { GenreChips } from "./GenreChips";
import { ShareFan } from "./ShareFan";
import { avatarWrap, heroBackdrop, heroBackdropImage, heroBackdropVeil, heroSocialLink, heroSocials } from "./styles";
import type { DetailHeroProps } from "./types";

export function DetailHero({ mode, name, subtitle, cover, genres, requestState, socials, statsSlot }: DetailHeroProps) {
  const { t } = useTranslation("contentDetail");
  const badgeType = mode === "artist" ? "artist" : "album";
  const isArtist = mode === "artist";

  return (
    <header className={hero()}>
      {cover ? (
        <div className={heroBackdrop()} aria-hidden>
          <Image src={cover} alt="" fill sizes="100vw" className={heroBackdropImage()} />
          <span className={heroBackdropVeil()} />
        </div>
      ) : null}

      <div className={avatarWrap()}>
        <div className={heroCover({ shape: isArtist ? "round" : "square" })}>
          {cover ? (
            <Image src={cover} alt="" fill sizes="160px" className={heroImage()} />
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
        {subtitle ? <p className={heroSubtitle()}>{subtitle}</p> : null}

        <GenreChips genres={genres} />

        {statsSlot ? <div className={heroStats()}>{statsSlot}</div> : null}

        <div className={heroActions()}>
          {requestState === "inLibrary" ? (
            <span className={alreadyInLibrary()}>
              <CheckCircle className="size-4" aria-hidden />
              {t("alreadyInLibrary")}
            </span>
          ) : (
            <button type="button" className={primaryGradientButton({ size: "lg" })}>
              <Download className="size-4" />
              {requestState === "requestMissing" ? t("requestMissing") : t("request")}
            </button>
          )}
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
