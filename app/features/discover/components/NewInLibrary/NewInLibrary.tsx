"use client";

import { ListPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useRecentAlbums } from "@hooks/api/queries/analytics/useRecentAlbums";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatRelativeTime } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { widgetPill } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function NewInLibrary({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useRecentAlbums();
  const { playEntity } = useEntityPlayback();
  const { openForResult } = useContentRequestFlow();
  const albums = data ?? [];

  return (
    <WidgetFrame
      icon={ListPlus}
      title={t("newInLibrary.title")}
      subtitle={t("newInLibrary.subtitle")}
      info={info}
      titleId="new-in-library-heading"
      loading={isLoading}
      note={isError ? t("board.loadError") : albums.length === 0 ? t("newInLibrary.empty") : null}
    >
      <FadeScroll>
        <ul className={widgetList({ columns: listColumns(size) })}>
          {albums.map((album) => (
            <WidgetRow
              key={album.albumExternalId}
              cover={album.cover}
              seed={album.albumExternalId}
              title={album.name}
              subtitle={t("albumMeta", {
                artist: album.artist,
                count: album.tracks,
                when: formatRelativeTime(album.landedAt),
              })}
              trailing={
                <span className={widgetPill({ tone: album.played ? "muted" : "primary" })}>
                  {album.played ? t("newInLibrary.played") : t("newInLibrary.unplayed")}
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
