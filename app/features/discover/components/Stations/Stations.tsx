"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useStations } from "@hooks/api/queries/analytics/useStations";
import { useStartRadio } from "@hooks/ui/player";

import { PlaySetCard } from "../PlaySetCard/PlaySetCard";
import { CARD_ROW_SKELETONS } from "../constants";
import { cardRowLimit } from "../helpers";
import { cardRow, cardRowBody, cardRowSkeleton, cardRowVars, railScroller, widgetNote } from "../styles";
import { STATION_ACCENTS, STATION_TAG_KEYS, STATION_TITLE_KEYS } from "./constants";
import { stationRail } from "./styles";
import type { StationsProps } from "./types";

export function Stations({ size, info }: StationsProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useStations();
  const startRadio = useStartRadio();
  const rail = size === "M";
  const limit = cardRowLimit(size);
  const stations = rail ? (data ?? []) : (data ?? []).slice(0, limit);

  const cards = stations.map((station) => {
    const title = station.kind === "artist" ? (station.artist ?? "") : t(STATION_TITLE_KEYS[station.kind]);
    return (
      <PlaySetCard
        key={station.id}
        accent={STATION_ACCENTS[station.kind]}
        icon={Radio}
        tag={t(STATION_TAG_KEYS[station.kind])}
        title={title}
        blurb={null}
        footnote={null}
        covers={station.covers}
        seed={station.id}
        playLabel={t("stations.start", { name: title })}
        onPlay={() => void startRadio(station.seed, null)}
      />
    );
  });

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="stations-heading">
      <WidgetHeader
        icon={Radio}
        title={t("stations.heading")}
        subtitle={t("stations.subtitle")}
        titleId="stations-heading"
        info={info}
      />
      {isLoading ? (
        <div className={cardRowBody()}>
          <div className={cardRow()} style={cardRowVars(limit)}>
            {CARD_ROW_SKELETONS.slice(0, limit).map((index) => (
              <div key={index} className={cardRowSkeleton()} />
            ))}
          </div>
        </div>
      ) : isError || stations.length === 0 ? (
        <p className={widgetNote()}>{isError ? t("history.error") : t("stations.empty")}</p>
      ) : rail ? (
        <div className={cardRowBody()}>
          <FadeScroll axis="x" arrows className={railScroller()} label={t("stations.rail")}>
            <div className={stationRail()}>{cards}</div>
          </FadeScroll>
        </div>
      ) : (
        <div className={cardRowBody()}>
          <div className={cardRow()} style={cardRowVars(limit)}>
            {cards}
          </div>
        </div>
      )}
    </section>
  );
}
