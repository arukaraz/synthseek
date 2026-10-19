"use client";

import { Gem } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useRarities } from "@hooks/api/queries/analytics/useRarities";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { compactCount, percentOf } from "../helpers";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { rarityCaption, rarityScore, rarityValue } from "./styles";

export function Rarities({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useRarities();
  const { playEntity } = useEntityPlayback();

  return (
    <WidgetFrame
      icon={Gem}
      title={t("rarities.title")}
      subtitle={t("rarities.subtitle")}
      info={info}
      titleId="rarities-heading"
      loading={isLoading}
      note={isError ? t("history.error") : !data || data.index === null ? t("rarities.empty") : null}
    >
      {data && data.index !== null ? (
        <>
          <div className={rarityScore()}>
            <span className={rarityValue()}>{percentOf(data.index / 100)}</span>
            <span className={rarityCaption()}>
              {t("rarities.caption", {
                threshold: compactCount(data.threshold),
                median: compactCount(data.medianListens ?? 0),
              })}
            </span>
          </div>
          <ul className={widgetList()}>
            {data.items.map((item) => (
              <WidgetRow
                key={item.trackId}
                cover={item.cover}
                seed={item.trackId}
                title={item.title}
                subtitle={t("rarities.yours", { artist: item.artist, count: item.plays })}
                trailing={compactCount(item.listens)}
                onSelect={() => void playEntity({ kind: "tracks", trackIds: [item.trackId] })}
              />
            ))}
          </ul>
        </>
      ) : null}
    </WidgetFrame>
  );
}
