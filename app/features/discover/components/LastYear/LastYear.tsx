"use client";

import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { useLastYear } from "@hooks/api/queries/analytics/useLastYear";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatElapsed, formatShortDate } from "@utils/formatters";

import { leaderFrame, leaderLayout, leaderSubtitle, leaderTitle } from "../WidgetLeader/styles";
import { WidgetLeader } from "../WidgetLeader/WidgetLeader";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { weekStat, weekStatLabel, weekStats, weekStatValue, weekTopPlays } from "./styles";
import type { LastYearProps } from "./types";

export function LastYear({ info }: LastYearProps) {
  const { t } = useTranslation("discover");
  const { data: week, isLoading, isError } = useLastYear();
  const { playEntity } = useEntityPlayback();
  const trackIds = week?.trackIds ?? [];
  const [top, ...rest] = week?.tracks ?? [];

  return (
    <WidgetFrame
      icon={CalendarClock}
      title={t("lastYear.title")}
      subtitle={week ? t("lastYear.subtitle", { from: formatShortDate(week.from), to: formatShortDate(week.to) }) : ""}
      info={info}
      titleId="last-year-heading"
      loading={isLoading}
      note={isError ? t("history.error") : !week || week.plays === 0 || top === undefined ? t("lastYear.empty") : null}
      action={
        trackIds.length > 0
          ? { label: t("lastYear.play"), onClick: () => void playEntity({ kind: "tracks", trackIds }) }
          : undefined
      }
    >
      {week && top ? (
        <div className={leaderFrame()}>
          <div className={leaderLayout()}>
            <WidgetLeader
              cover={top.cover}
              seed={top.trackId}
              badge={{ icon: CalendarClock, label: t("lastYear.leaderBadge", { year: week.from.getFullYear() }) }}
            >
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
              <h3 className={leaderTitle()}>{top.title}</h3>
              <p className={leaderSubtitle()}>{top.artist}</p>
              <span className={weekTopPlays()}>{t("lastYear.plays", { count: top.plays })}</span>
            </WidgetLeader>
            <FadeScroll>
              <ol className={widgetList()} start={2}>
                {rest.map((track, index) => (
                  <WidgetRow
                    key={track.trackId}
                    cover={track.cover}
                    seed={track.trackId}
                    title={track.title}
                    subtitle={track.artist}
                    lead={index + 2}
                    trailing={t("lastYear.plays", { count: track.plays })}
                    onSelect={() => void playEntity({ kind: "tracks", trackIds: [track.trackId] })}
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
      ) : null}
    </WidgetFrame>
  );
}
