"use client";

import { LB_KIND_METADATA } from "./constants";
import { describeEmptyReason, tileGradient } from "./helpers";
import {
  mixBlurb,
  mixCard,
  mixChip,
  mixInfo,
  mixPoster,
  mixPosterShade,
  mixTag,
  mixTitle,
  mosaicFallback,
} from "./styles";
import type { DiscoveryMixCardEmptyProps } from "./types";

export function DiscoveryMixCardEmpty({ mix }: DiscoveryMixCardEmptyProps) {
  const meta = LB_KIND_METADATA[mix.kind];
  const Icon = meta.icon;
  const reasonLabel = describeEmptyReason(mix);
  const background = tileGradient(mix.kind);

  return (
    <div data-acc={meta.acc} className={mixCard({ state: "empty" })} aria-disabled="true">
      <div className={mixPoster()}>
        <div style={{ background }} className={mosaicFallback()} />
        <span className={mixPosterShade()} />
        <span className={mixChip()}>
          <Icon className="size-4 opacity-70" />
        </span>
      </div>
      <div className={mixInfo()}>
        <span className={mixTag()}>{meta.tag}</span>
        <h3 className={mixTitle()}>{meta.label}</h3>
        <p className={mixBlurb()}>{reasonLabel}</p>
      </div>
    </div>
  );
}
