"use client";

import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useLastYear } from "@hooks/api/queries/analytics/useLastYear";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatElapsed, formatShortDate } from "@utils/formatters";

import { CARD_ROW_SKELETONS } from "../constants";
import { widgetNote } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { weekBody, weekLayout, weekSkeleton, weekStat, weekStatLabel, weekStatValue, weekStats } from "./styles";
import type { LastYearProps } from "./types";

export function LastYear({ info }: LastYearProps) {
  const { t } = useTranslation("discover");
  const { data: week, isLoading, isError } = useLastYear();
  const { playEntity } = useEntityPlayback();
  const trackIds = week?.trackIds ?? [];

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="last-year-heading">
      <WidgetHeader
        icon={CalendarClock}
        title={t("lastYear.title")}
        subtitle={
          week ? t("lastYear.subtitle", { from: formatShortDate(week.from), to: formatShortDate(week.to) }) : ""
        }
        titleId="last-year-heading"
        info={info}
        action={
          trackIds.length > 0
            ? { label: t("lastYear.play"), onClick: () => void playEntity({ kind: "tracks", trackIds }) }
            : undefined
        }
      />
      {isLoading ? (
        <div className={widgetList()}>
          {CARD_ROW_SKELETONS.map((index) => (
            <div key={index} className={weekSkeleton()} />
          ))}
        </div>
      ) : isError || !week || week.plays === 0 ? (
        <p className={widgetNote()}>{isError ? t("history.error") : t("lastYear.empty")}</p>
      ) : (
        <div className={weekBody()}>
          <div className={weekLayout()}>
            <dl className={weekStats()}>
              <div className={weekStat()}>
                <dt className={weekStatLabel()}>{t("lastYear.statPlays")}</dt>
                <dd className={weekStatValue()}>{week.plays}</dd>
              </div>
              <div className={weekStat()}>
                <dt className={weekStatLabel()}>{t("lastYear.statTime")}</dt>
                <dd className={weekStatValue()}>{formatElapsed(week.minutes * 60)}</dd>
              </div>
              <div className={weekStat()}>
                <dt className={weekStatLabel()}>{t("lastYear.statArtist")}</dt>
                <dd className={weekStatValue()}>{week.topArtist ?? ""}</dd>
              </div>
            </dl>
            <FadeScroll>
              <ol className={widgetList()}>
                {week.tracks.map((track, index) => (
                  <WidgetRow
                    key={track.trackId}
                    cover={track.cover}
                    seed={track.trackId}
                    title={track.title}
                    subtitle={track.artist}
                    lead={index + 1}
                    trailing={t("lastYear.plays", { count: track.plays })}
                    coverAction={{
                      kind: "play",
                      label: t("history.play", { name: track.title }),
                      onClick: () => void playEntity({ kind: "tracks", trackIds: [track.trackId] }),
                    }}
                  />
                ))}
              </ol>
            </FadeScroll>
          </div>
        </div>
      )}
    </section>
  );
}
