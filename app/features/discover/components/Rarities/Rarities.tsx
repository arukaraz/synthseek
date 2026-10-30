"use client";

import { Gem } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { useRarities } from "@hooks/api/queries/analytics/useRarities";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { COMPACT_ROW_LIMIT } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { compactCount, listColumns, percentOf } from "../helpers";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { rarityAside, rarityCaption, rarityValue } from "./styles";

export function Rarities({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useRarities();
  const { playEntity } = useEntityPlayback();
  const compact = size === "S";
  const index = data?.index ?? null;
  const items = data ? (compact ? data.items.slice(0, COMPACT_ROW_LIMIT) : data.items) : [];

  return (
    <WidgetFrame
      icon={Gem}
      title={t("rarities.title")}
      subtitle={
        data && index !== null
          ? t("rarities.subtitleMedian", { median: compactCount(data.medianListens ?? 0) })
          : t("rarities.subtitle")
      }
      info={info}
      titleId="rarities-heading"
      loading={isLoading}
      note={isError ? t("history.error") : !data || index === null ? t("rarities.empty") : null}
      aside={
        data && index !== null ? (
          <span className={rarityAside()}>
            <span className={rarityValue()}>{percentOf(index / 100)}</span>
            {compact ? null : (
              <span className={rarityCaption()}>
                {t("rarities.caption", { threshold: compactCount(data.threshold) })}
              </span>
            )}
          </span>
        ) : undefined
      }
    >
      {data && index !== null ? (
        <FadeScroll>
          <ul className={widgetList({ columns: listColumns(size) })}>
            {items.map((item) => (
              <WidgetRow
                key={item.trackId}
                cover={item.cover}
                seed={item.trackId}
                title={item.title}
                subtitle={t("rarities.yours", { artist: item.artist, count: item.plays })}
                trailing={compactCount(item.listens)}
                onSelect={() => void playEntity({ kind: "tracks", trackIds: [item.trackId] })}
                coverAction={{
                  kind: "play",
                  label: t("history.play", { name: item.title }),
                  onClick: () => void playEntity({ kind: "tracks", trackIds: [item.trackId] }),
                }}
              />
            ))}
          </ul>
        </FadeScroll>
      ) : null}
    </WidgetFrame>
  );
}
