"use client";

import { useTranslation } from "react-i18next";

import { DiscoveryMixMosaic } from "./DiscoveryMixMosaic";
import { LB_KIND_BLURB_KEYS, LB_KIND_LABEL_KEYS, LB_KIND_METADATA, LB_KIND_TAG_KEYS } from "./constants";
import { formatFreshness } from "./helpers";
import {
  mixBlurb,
  mixCard,
  mixChip,
  mixCount,
  mixFoot,
  mixFreshPill,
  mixInfo,
  mixPoster,
  mixPosterShade,
  mixPosterTint,
  mixTag,
  mixTitle,
} from "./styles";
import type { DiscoveryMixCardProps } from "./types";

export function DiscoveryMixCard({ mix, onClick }: DiscoveryMixCardProps) {
  const { t } = useTranslation("discover");
  const meta = LB_KIND_METADATA[mix.kind];
  const Icon = meta.icon;
  const freshness = formatFreshness(mix.generatedAt, mix.kind, Date.now());
  const label = t(LB_KIND_LABEL_KEYS[mix.kind]);
  const ariaLabel = t("mixes.cardAriaLabel", { label, count: mix.candidates.length });

  return (
    <button type="button" data-acc={meta.acc} onClick={onClick} aria-label={ariaLabel} className={mixCard()}>
      <div className={mixPoster()}>
        <DiscoveryMixMosaic candidates={mix.candidates.slice(0, 4)} fallbackSeed={mix.kind} />
        <span className={mixPosterTint()} />
        <span className={mixPosterShade()} />
        <span className={mixChip()}>
          <Icon className="size-4" />
        </span>
        {freshness ? <span className={mixFreshPill()}>{freshness}</span> : null}
      </div>
      <div className={mixInfo()}>
        <span className={mixTag()}>{t(LB_KIND_TAG_KEYS[mix.kind])}</span>
        <h3 className={mixTitle()}>{label}</h3>
        <p className={mixBlurb()}>{t(LB_KIND_BLURB_KEYS[mix.kind])}</p>
        <div className={mixFoot()}>
          <span className={mixCount()}>{t("mixes.trackCount", { count: mix.candidates.length })}</span>
        </div>
      </div>
    </button>
  );
}
