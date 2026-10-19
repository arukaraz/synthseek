"use client";

import { ListPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useRecentAlbums } from "@hooks/api/queries/analytics/useRecentAlbums";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatRelativeTime } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetPill } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function NewInLibrary({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useRecentAlbums();
  const { playEntity } = useEntityPlayback();
  const albums = data ?? [];

  return (
    <WidgetFrame
      icon={ListPlus}
      title={t("newInLibrary.title")}
      subtitle={t("newInLibrary.subtitle")}
      info={info}
      titleId="new-in-library-heading"
      loading={isLoading}
      note={isError ? t("history.error") : albums.length === 0 ? t("newInLibrary.empty") : null}
    >
      <ul className={widgetList()}>
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
            onSelect={() => void playEntity({ kind: "album", albumExternalId: album.albumExternalId })}
          />
        ))}
      </ul>
    </WidgetFrame>
  );
}
