"use client";

import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { useCharts } from "@hooks/api/queries/analytics/useCharts";
import { useCountry } from "@modules/providers/CountryProvider";
import { getCountryByCode } from "@utils/countries";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { leaderFrame, leaderLayout } from "../WidgetLeader/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { ChartAction } from "./ChartAction";
import { ChartsLeader } from "./ChartsLeader";
import { chartKey } from "./helpers";
import { chartRank, chartsList } from "./styles";

export function Charts({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { country } = useCountry();
  const { data, isLoading, isError } = useCharts(country);
  const countryName = getCountryByCode(country)?.name ?? country;
  const [leaderEntry, ...rest] = data ?? [];

  return (
    <WidgetFrame
      icon={Flame}
      title={t("charts.title")}
      subtitle={t("charts.subtitle", { country: countryName })}
      info={info}
      titleId="charts-heading"
      loading={isLoading}
      note={isError ? t("board.loadError") : leaderEntry === undefined ? t("charts.empty") : null}
    >
      <div className={leaderFrame()}>
        <div className={leaderLayout()}>
          {leaderEntry ? <ChartsLeader entry={leaderEntry} country={countryName} /> : null}
          <FadeScroll>
            <ol className={chartsList()} start={2}>
              {rest.map((entry, index) => (
                <WidgetRow
                  key={chartKey(entry)}
                  cover={entry.track?.album.images[0]?.url ?? null}
                  seed={chartKey(entry)}
                  title={entry.title}
                  subtitle={entry.artist}
                  lead={<span className={chartRank()}>{index + 2}</span>}
                  trailing={<ChartAction entry={entry} />}
                />
              ))}
            </ol>
          </FadeScroll>
        </div>
      </div>
    </WidgetFrame>
  );
}
