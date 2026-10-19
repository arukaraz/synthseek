"use client";

import { Orbit as OrbitIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem, albumTarget } from "@features/content-detail";
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
  const { openForTarget, requestResult } = useContentRequestFlow();
  const albums = data ?? [];
  const open = (album: OrbitAlbum) =>
    openForTarget(albumTarget({ id: album.id, name: album.name, artistName: album.artist, cover: album.cover }));
  const request = (album: OrbitAlbum) =>
    requestResult(albumRequestItem({ id: album.id, name: album.name, artistName: album.artist, cover: album.cover }));

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
        <FadeScroll>
          <ul className={widgetList()}>
            {albums.map((album) => (
              <WidgetRow
                key={album.id}
                cover={album.cover}
                seed={album.id}
                title={album.name}
                subtitle={t("orbit.row", { artist: album.artist, title: album.because })}
                onSelect={() => open(album)}
                coverAction={{
                  kind: "request",
                  label: t("requestNamed", { name: album.name }),
                  onClick: () => request(album),
                }}
              />
            ))}
          </ul>
        </FadeScroll>
      ) : (
        <div className={orbitBody()}>
          <FadeScroll>
            <div className={orbitGrid()}>
              {albums.map((album) => (
                <OrbitCard key={album.id} album={album} onOpen={() => open(album)} />
              ))}
            </div>
          </FadeScroll>
        </div>
      )}
    </WidgetFrame>
  );
}
