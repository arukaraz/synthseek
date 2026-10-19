"use client";

import { Orbit as OrbitIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { albumTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { OrbitAlbum } from "@hooks/api/queries/analytics/types";
import { useOrbitAlbums } from "@hooks/api/queries/analytics/useOrbitAlbums";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { OrbitCard } from "./OrbitCard";
import { orbitBody, orbitGrid } from "./styles";

export function Orbit({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useOrbitAlbums();
  const { openForTarget } = useContentRequestFlow();
  const albums = data ?? [];
  const open = (album: OrbitAlbum) =>
    openForTarget(albumTarget({ id: album.id, name: album.name, artistName: album.artist, cover: album.cover }));

  return (
    <WidgetFrame
      icon={OrbitIcon}
      title={t("orbit.title")}
      subtitle={t("orbit.subtitle")}
      info={info}
      titleId="orbit-heading"
      loading={isLoading}
      note={isError ? t("history.error") : albums.length === 0 ? t("orbit.empty") : null}
    >
      {size === "M" ? (
        <ul className={widgetList()}>
          {albums.map((album) => (
            <WidgetRow
              key={album.id}
              cover={album.cover}
              seed={album.id}
              title={album.name}
              subtitle={t("orbit.row", { artist: album.artist, title: album.because })}
              onSelect={() => open(album)}
            />
          ))}
        </ul>
      ) : (
        <div className={orbitBody()}>
          <div className={orbitGrid()}>
            {albums.map((album) => (
              <OrbitCard key={album.id} album={album} onOpen={() => open(album)} />
            ))}
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
