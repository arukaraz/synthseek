"use client";

import { useTranslation } from "react-i18next";

import { ProgressBar } from "@components/ui/ProgressBar";

import { percentOf } from "../helpers";
import { CoverArt } from "../WidgetRow/CoverArt";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { gapArtist, gapCard, gapCopy, gapCount, gapCover, gapHead, gapPercent } from "./styles";
import type { GapCardProps } from "./types";

export function GapCard({ gap, onOpen }: GapCardProps) {
  const { t } = useTranslation("discover");
  const share = gap.total > 0 ? gap.have / gap.total : 0;

  return (
    <div className={gapCard()}>
      <div className={gapHead()}>
        <span className={gapCover()}>
          <CoverArt src={gap.cover} seed={gap.artist} sizes="40px" />
        </span>
        <span className={gapCopy()}>
          <span className={gapArtist()}>{gap.artist}</span>
          <span className={gapCount()}>{t("gaps.have", { have: gap.have, total: gap.total })}</span>
        </span>
        <span className={gapPercent()}>{percentOf(share)}</span>
      </div>
      <ProgressBar progress={share * 100} size="sm" />
      <ul className={widgetList()}>
        {gap.missing.map((album) => (
          <WidgetRow
            key={album.id}
            cover={album.cover}
            seed={album.id}
            title={album.name}
            subtitle={album.year === null ? t("gaps.missing") : String(album.year)}
            onSelect={() => onOpen(album)}
          />
        ))}
      </ul>
    </div>
  );
}
