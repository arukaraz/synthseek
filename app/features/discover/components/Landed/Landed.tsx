"use client";

import { PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useRecentAlbums } from "@hooks/api/queries/analytics/useRecentAlbums";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatElapsed, formatRelativeTime } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { downloadedAlbums } from "./helpers";

export function Landed({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useRecentAlbums();
  const sourceLabel = useDownloadSourceLabel();
  const { playEntity } = useEntityPlayback();
  const albums = downloadedAlbums(data ?? []);

  return (
    <WidgetFrame
      icon={PackageCheck}
      title={t("landed.title")}
      subtitle={t("landed.subtitle")}
      info={info}
      titleId="landed-heading"
      loading={isLoading}
      note={isError ? t("history.error") : albums.length === 0 ? t("landed.empty") : null}
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
            trailing={t("landed.via", {
              source: sourceLabel(album.source),
              duration: formatElapsed(album.minutes * 60),
            })}
            onSelect={() => void playEntity({ kind: "album", albumExternalId: album.albumExternalId })}
          />
        ))}
      </ul>
    </WidgetFrame>
  );
}
