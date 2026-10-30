"use client";

import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";

import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { GapHeader } from "./GapHeader";
import { gapCard, gapMissing } from "./styles";
import type { GapCardProps } from "./types";

export function GapCard({ gap, onOpen, onRequest, onOpenArtist }: GapCardProps) {
  const { t } = useTranslation("discover");

  return (
    <div className={gapCard()}>
      <GapHeader gap={gap} onOpenArtist={onOpenArtist} />
      <FadeScroll className={gapMissing()}>
        <ul className={widgetList()}>
          {gap.missing.map((album) => (
            <WidgetRow
              key={album.id}
              cover={album.cover}
              seed={album.id}
              title={album.name}
              subtitle={album.year === null ? t("gaps.missing") : String(album.year)}
              onSelect={() => onOpen(album)}
              coverAction={{
                kind: "request",
                label: t("requestNamed", { name: album.name }),
                onClick: () => onRequest(album),
              }}
            />
          ))}
        </ul>
      </FadeScroll>
    </div>
  );
}
