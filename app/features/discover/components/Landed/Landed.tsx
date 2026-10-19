"use client";

import { PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useRecentAlbums } from "@hooks/api/queries/analytics/useRecentAlbums";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { formatElapsed, formatRelativeTime } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetPill } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { downloadedAlbums } from "./helpers";
import { landedMeta, landedTook } from "./styles";

export function Landed({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useRecentAlbums();
  const sourceLabel = useDownloadSourceLabel();
  const { playEntity } = useEntityPlayback();
  const { openForResult } = useContentRequestFlow();
  const albums = downloadedAlbums(data ?? []);

  return (
    <WidgetFrame
      icon={PackageCheck}
      title={t("landed.title")}
      subtitle={t("landed.subtitle")}
      info={info}
      titleId="landed-heading"
      loading={isLoading}
      note={isError ? t("board.loadError") : albums.length === 0 ? t("landed.empty") : null}
    >
      <FadeScroll>
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
                <span className={landedMeta()}>
                  <span className={widgetPill({ tone: "primary" })}>{sourceLabel(album.source)}</span>
                  <span className={landedTook()}>
                    {t("landed.took", { duration: formatElapsed(album.minutes * 60) })}
                  </span>
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
