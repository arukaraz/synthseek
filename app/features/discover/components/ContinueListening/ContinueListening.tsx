"use client";

import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { useRecentPlays } from "@hooks/api/queries/analytics/useRecentPlays";
import { useResumePoint } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatRelativeTime } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetEyebrow, widgetNote } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { ResumeCard } from "./ResumeCard";

export function ContinueListening({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { point, toggle } = useResumePoint();
  const { playEntity } = useEntityPlayback();
  const withRecent = size !== "M";
  const recent = useRecentPlays(withRecent);
  const plays = withRecent ? (recent.data ?? []) : [];

  return (
    <WidgetFrame
      icon={PlayCircle}
      title={t("continueListening.title")}
      subtitle={t("continueListening.subtitle")}
      info={info}
      titleId="continue-listening-heading"
      loading={false}
      note={null}
    >
      {point ? (
        <ResumeCard point={point} onToggle={toggle} />
      ) : (
        <p className={widgetNote()}>{t("continueListening.empty")}</p>
      )}
      {plays.length > 0 ? (
        <>
          <span className={widgetEyebrow()}>{t("continueListening.recent")}</span>
          <FadeScroll>
            <ul className={widgetList()}>
              {plays.map((play) => (
                <WidgetRow
                  key={`${play.trackId}-${play.playedAt.getTime()}`}
                  cover={play.cover}
                  seed={play.trackId}
                  title={play.title}
                  subtitle={t("continueListening.played", {
                    artist: play.artist,
                    when: formatRelativeTime(play.playedAt),
                  })}
                  trailing={play.client ?? undefined}
                  coverAction={{
                    kind: "play",
                    label: t("history.play", { name: play.title }),
                    onClick: () => void playEntity({ kind: "tracks", trackIds: [play.trackId] }),
                  }}
                />
              ))}
            </ul>
          </FadeScroll>
        </>
      ) : null}
    </WidgetFrame>
  );
}
