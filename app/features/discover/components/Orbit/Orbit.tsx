"use client";

import { Orbit as OrbitIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { OrbitAlbum } from "@hooks/api/queries/analytics/types";
import { useOrbitAlbums } from "@hooks/api/queries/analytics/useOrbitAlbums";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { cardRowLimit } from "../helpers";
import { cardRowBody, cardRowVars, railScroller } from "../styles";
import { OrbitCard } from "./OrbitCard";
import { orbitBody, orbitGrid, orbitRail } from "./styles";

export function Orbit({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useOrbitAlbums();
  const { openForTarget } = useContentRequestFlow();
  const albums = data ?? [];
  const open = (album: OrbitAlbum) =>
    openForTarget(albumTarget({ id: album.id, name: album.name, artistName: album.artist, cover: album.cover }));
  const limit = cardRowLimit(size);

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
      {size === "S" ? (
        <div className={cardRowBody()}>
          <div className={orbitGrid()} style={cardRowVars(limit)}>
            {albums.slice(0, limit).map((album) => (
              <OrbitCard key={album.id} album={album} onOpen={() => open(album)} />
            ))}
          </div>
        </div>
      ) : (
        <div className={orbitBody()}>
          <FadeScroll axis="x" arrows className={railScroller()} label={t("orbit.rail")}>
            <div className={orbitRail()}>
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
