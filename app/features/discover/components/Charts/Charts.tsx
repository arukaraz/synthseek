"use client";

import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useCharts } from "@hooks/api/queries/analytics/useCharts";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useCountry } from "@modules/providers/CountryProvider";
import { cn } from "@utils/cn";
import { getCountryByCode } from "@utils/countries";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetAction } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { chartsBody, chartsList } from "./styles";

export function Charts({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { country } = useCountry();
  const { data, isLoading, isError } = useCharts(country);
  const { openForResult } = useContentRequestFlow();
  const { playEntity } = useEntityPlayback();
  const entries = data ?? [];

  return (
    <WidgetFrame
      icon={Flame}
      title={t("charts.title")}
      subtitle={t("charts.subtitle", { country: getCountryByCode(country)?.name ?? country })}
      info={info}
      titleId="charts-heading"
      loading={isLoading}
      note={isError ? t("history.error") : entries.length === 0 ? t("charts.empty") : null}
    >
      <div className={chartsBody()}>
        <ol className={cn(widgetList(), chartsList({ wide: size === "XL" }))}>
          {entries.map((entry, index) => {
            const { libraryTrackId, track } = entry;
            return (
              <WidgetRow
                key={`${entry.artist}-${entry.title}`}
                cover={track?.album.images[0]?.url ?? null}
                seed={`${entry.artist}-${entry.title}`}
                title={entry.title}
                subtitle={entry.artist}
                lead={index + 1}
                trailing={
                  libraryTrackId ? (
                    <button
                      type="button"
                      className={widgetAction()}
                      onClick={() => void playEntity({ kind: "tracks", trackIds: [libraryTrackId] })}
                    >
                      {t("charts.play")}
                    </button>
                  ) : track ? (
                    <button type="button" className={widgetAction()} onClick={() => openForResult(track)}>
                      {t("charts.request")}
                    </button>
                  ) : undefined
                }
              />
            );
          })}
        </ol>
      </div>
    </WidgetFrame>
  );
}
