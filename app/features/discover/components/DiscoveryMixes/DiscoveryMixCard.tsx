"use client";

import { DiscoveryMixMosaic } from "./DiscoveryMixMosaic";
import { LB_KIND_METADATA } from "./constants";
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
  const meta = LB_KIND_METADATA[mix.kind];
  const Icon = meta.icon;
  const freshness = formatFreshness(mix.generatedAt, mix.kind, Date.now());
  const ariaLabel = `Open ${meta.label} mix, ${mix.candidates.length} tracks`;

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
        <span className={mixTag()}>{meta.tag}</span>
        <h3 className={mixTitle()}>{meta.label}</h3>
        <p className={mixBlurb()}>{meta.blurb}</p>
        <div className={mixFoot()}>
          <span className={mixCount()}>{mix.candidates.length} tracks</span>
        </div>
      </div>
    </button>
  );
}
