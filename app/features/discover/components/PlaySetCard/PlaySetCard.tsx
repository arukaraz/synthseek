"use client";

import { Pin, Play } from "lucide-react";
import Image from "next/image";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { artworkImage } from "@utils/artworkProxy";
import { cn } from "@utils/cn";

import { CoverRequestAction } from "../CustomWidget/CoverRequestAction";
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
import { pinFlag, playButton, playSetOpen, playSetPoster, singleCover, tagRow, tagText } from "./styles";
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
  requestAction,
  onOpen,
  revealAction = false,
  pinned = false,
}: PlaySetCardProps) {
  const [onlyCover] = covers;

  return (
    <article data-acc={accent} className={mixCard()}>
      <div className={playSetPoster()}>
        {covers.length === 1 && onlyCover ? (
          <Image {...artworkImage(onlyCover)} alt="" fill sizes="320px" className={singleCover()} />
        ) : (
          <DiscoveryMixMosaic covers={covers} fallbackSeed={seed} />
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
        {requestAction ? (
          <CoverRequestAction action={requestAction} placement="poster" />
        ) : onPlay ? (
          <button
            type="button"
            className={playButton({ reveal: revealAction })}
            aria-label={playLabel}
            onClick={onPlay}
          >
            <Play />
          </button>
        ) : null}
      </div>
      <div className={mixInfo()}>
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
