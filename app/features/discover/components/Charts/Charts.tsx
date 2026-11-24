"use client";

import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { SOURCE_NAMES } from "@components/SourceBadge";
import { WidgetFrame } from "@components/WidgetFrame";
import { useCharts } from "@hooks/api/queries/analytics/useCharts";
import { useActiveIntegrations } from "@hooks/api/queries/widgets/useActiveIntegrations";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { leaderFrame, leaderLayout } from "../WidgetLeader/styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { ChartAction } from "./ChartAction";
import { ChartsLeader } from "./ChartsLeader";
import { chartKey } from "./helpers";
import { chartRank } from "./styles";

export function Charts({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useCharts(provider);
  const active = useActiveIntegrations();
  const name = SOURCE_NAMES[provider];
  const inactive = active !== undefined && !active.includes(provider);
  const [leaderEntry, ...rest] = data ?? [];

  return (
    <WidgetFrame
      icon={Flame}
      title={t("charts.title")}
      subtitle={t("charts.subtitle", { provider: name })}
      info={info}
      titleId={`charts-heading-${provider}`}
      loading={isLoading}
      note={
        isError
          ? t("board.loadError")
          : inactive
            ? t("board.providerInactive", { provider: name })
            : leaderEntry === undefined
              ? t("charts.empty")
              : null
      }
    >
      <div className={leaderFrame()}>
        <div className={leaderLayout()}>
          {leaderEntry ? <ChartsLeader entry={leaderEntry} /> : null}
          <FadeScroll>
            <ol className={widgetList({ columns: listColumns(size) })} start={2}>
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
