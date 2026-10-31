"use client";

import { Download, Pin, Play } from "lucide-react";
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
import { PLAY_SET_MOSAIC_SHAPES } from "./constants";
import {
  pinFlag,
  playButton,
  playSetCard,
  playSetInfo,
  playSetOpen,
  playSetPoster,
  singleCover,
  tagRow,
  tagText,
} from "./styles";
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
  actionKind = "play",
  onOpen,
  revealAction = false,
  layout = "stack",
  pinned = false,
}: PlaySetCardProps) {
  const [onlyCover] = covers;
  const shape = PLAY_SET_MOSAIC_SHAPES[layout];

  return (
    <article data-acc={accent} className={cn(mixCard(), playSetCard({ layout }))}>
      <div className={playSetPoster({ layout })}>
        {shape === "square" && covers.length === 1 && onlyCover ? (
          <Image src={artworkProxySrc(onlyCover)} alt="" fill sizes="320px" className={singleCover()} unoptimized />
        ) : (
          <DiscoveryMixMosaic covers={covers} fallbackSeed={seed} shape={shape} />
        )}
        <span className={mixPosterTint()} />
        <span className={mixPosterShade()} />
        <span className={mixChip()}>
          <Icon className="size-4" />
        </span>
        {pinned ? (
          <span className={pinFlag()}>
            <Pin aria-hidden />
          </span>
        ) : null}
        {onPlay ? (
          <button
            type="button"
            className={playButton({ reveal: revealAction })}
            aria-label={playLabel}
            onClick={onPlay}
          >
            {actionKind === "play" ? <Play /> : <Download />}
          </button>
        ) : null}
      </div>
      <div className={cn(mixInfo(), playSetInfo({ layout }))}>
        <span className={tagRow()}>
          <span className={cn(mixTag(), tagText())}>{tag}</span>
          {info ? <InfoTooltip title={title} description={info} /> : null}
        </span>
        {onOpen ? (
          <button type="button" className={cn(mixTitle(), playSetOpen())} onClick={onOpen}>
            {title}
          </button>
        ) : (
          <h3 className={mixTitle()}>{title}</h3>
        )}
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
