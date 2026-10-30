"use client";

import { useTranslation } from "react-i18next";

import { ProgressBar } from "@components/ui/ProgressBar";

import { percentOf } from "../helpers";
import { CoverArt } from "../WidgetRow/CoverArt";
import { gapArtist, gapCopy, gapCount, gapCover, gapHead, gapHeader, gapPercent } from "./styles";
import type { GapHeaderProps } from "./types";

export function GapHeader({ gap, onOpenArtist }: GapHeaderProps) {
  const { t } = useTranslation("discover");
  const share = gap.total > 0 ? gap.have / gap.total : 0;

  return (
    <div className={gapHeader()}>
      <div className={gapHead()}>
        <span className={gapCover()}>
          <CoverArt src={gap.cover} seed={gap.artist} sizes="40px" />
        </span>
        <span className={gapCopy()}>
          <button
            type="button"
            className={gapArtist()}
            aria-label={t("gaps.openArtist", { artist: gap.artist })}
            onClick={onOpenArtist}
          >
            {gap.artist}
          </button>
          <span className={gapCount()}>{t("gaps.have", { have: gap.have, total: gap.total })}</span>
        </span>
        <span className={gapPercent()}>{percentOf(share)}</span>
      </div>
      <ProgressBar progress={share * 100} size="sm" />
    </div>
  );
}
