"use client";

import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLastYear } from "@hooks/api/queries/analytics/useLastYear";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { cn } from "@utils/cn";
import { formatElapsed, formatShortDate } from "@utils/formatters";

import { WidgetHeader } from "../WidgetHeader";
import { CARD_ROW_SKELETONS } from "../constants";
import { glassPanelCard, scrollFadeBottom, widgetNote } from "../styles";
import { LastYearRow } from "./LastYearRow";
import {
  weekBody,
  weekLayout,
  weekList,
  weekSkeleton,
  weekStat,
  weekStatLabel,
  weekStatValue,
  weekStats,
} from "./styles";
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
        <div className={weekList()}>
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
            <ol className={cn(weekList(), scrollFadeBottom())}>
              {week.tracks.map((track, index) => (
                <LastYearRow key={track.trackId} track={track} rank={index + 1} />
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
