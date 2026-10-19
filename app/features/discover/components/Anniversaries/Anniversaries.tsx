"use client";

import { Cake } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useAnniversaries } from "@hooks/api/queries/analytics/useAnniversaries";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatCalendarDate } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetPill } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function Anniversaries({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useAnniversaries();
  const { playEntity } = useEntityPlayback();
  const { openForResult } = useContentRequestFlow();
  const albums = data ?? [];

  return (
    <WidgetFrame
      icon={Cake}
      title={t("anniversaries.title")}
      subtitle={t("anniversaries.subtitle")}
      info={info}
      titleId="anniversaries-heading"
      loading={isLoading}
      note={isError ? t("history.error") : albums.length === 0 ? t("anniversaries.empty") : null}
    >
      <FadeScroll>
        <ul className={widgetList()}>
          {albums.map((album) => (
            <WidgetRow
              key={album.albumExternalId}
              cover={album.cover}
              seed={album.albumExternalId}
              title={album.name}
              subtitle={t("anniversaries.released", {
                artist: album.artist,
                date: formatCalendarDate(album.releaseDate) ?? album.releaseDate,
              })}
              trailing={
                <span className={widgetPill({ tone: "primary" })}>
                  {t("anniversaries.years", { count: album.years })}
                </span>
              }
              onSelect={() =>
                openForResult(
                  albumRequestItem({
                    id: album.albumExternalId,
                    name: album.name,
                    artistName: album.artist,
                    cover: album.cover,
                  })
                )
              }
              coverAction={{
                kind: "play",
                label: t("history.play", { name: album.name }),
                onClick: () => void playEntity({ kind: "album", albumExternalId: album.albumExternalId }),
              }}
            />
          ))}
        </ul>
      </FadeScroll>
    </WidgetFrame>
  );
}
