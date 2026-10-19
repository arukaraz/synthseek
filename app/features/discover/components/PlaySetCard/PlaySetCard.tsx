"use client";

import { Play } from "lucide-react";
import Image from "next/image";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { artworkProxySrc } from "@utils/artworkProxy";
import { cn } from "@utils/cn";

import { DiscoveryMixMosaic } from "../DiscoveryMixes/DiscoveryMixMosaic";
import {
  mixBlurb,
  mixCard,
  mixChip,
  mixCount,
  mixFoot,
  mixInfo,
  mixPosterShade,
  mixPosterTint,
  mixTag,
  mixTitle,
} from "../DiscoveryMixes/styles";
import { playButton, playSetPoster, singleCover, tagRow, tagText } from "./styles";
import type { PlaySetCardProps } from "./types";

export function PlaySetCard({
  accent,
  icon: Icon,
  tag,
  title,
  blurb,
  footnote,
  covers,
  seed,
  info,
  playLabel,
  onPlay,
}: PlaySetCardProps) {
  const [onlyCover] = covers;

  return (
    <article data-acc={accent} className={mixCard()}>
      <div className={playSetPoster()}>
        {covers.length === 1 && onlyCover ? (
          <Image src={artworkProxySrc(onlyCover)} alt="" fill sizes="320px" className={singleCover()} unoptimized />
        ) : (
          <DiscoveryMixMosaic covers={covers} fallbackSeed={seed} />
        )}
        <span className={mixPosterTint()} />
        <span className={mixPosterShade()} />
        <span className={mixChip()}>
          <Icon className="size-4" />
        </span>
        {onPlay ? (
          <button type="button" className={playButton()} aria-label={playLabel} onClick={onPlay}>
            <Play />
          </button>
        ) : null}
      </div>
      <div className={mixInfo()}>
        <span className={tagRow()}>
          <span className={cn(mixTag(), tagText())}>{tag}</span>
          {info ? <InfoTooltip title={title} description={info} /> : null}
        </span>
        <h3 className={mixTitle()}>{title}</h3>
        {blurb ? <p className={mixBlurb()}>{blurb}</p> : null}
        {footnote ? (
          <div className={mixFoot()}>
            <span className={mixCount()}>{footnote}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
