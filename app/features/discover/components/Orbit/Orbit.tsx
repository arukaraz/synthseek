"use client";

import { Orbit as OrbitIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem, albumTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { OrbitAlbum } from "@hooks/api/queries/analytics/types";
import { useOrbitAlbums } from "@hooks/api/queries/analytics/useOrbitAlbums";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import type { CoverActionButtonProps } from "../CustomWidget/types";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { cardRowLimit } from "../helpers";
import { cardRowBody, cardRowVars, railScroller } from "../styles";
import { OrbitCard } from "./OrbitCard";
import { orbitBody, orbitGrid, orbitRail } from "./styles";

export function Orbit({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useOrbitAlbums();
  const { openForTarget, requestResult } = useContentRequestFlow();
  const { playEntity } = useEntityPlayback();
  const albums = data ?? [];
  const reference = (album: OrbitAlbum) => ({
    id: album.id,
    name: album.name,
    artistName: album.artist,
    cover: album.cover,
  });
  const open = (album: OrbitAlbum) => openForTarget(albumTarget(reference(album)));
  const actionOf = (album: OrbitAlbum): CoverActionButtonProps["action"] =>
    album.playable
      ? {
          kind: "play",
          label: t("history.play", { name: album.name }),
          onClick: () => void playEntity({ kind: "album", albumExternalId: album.id }),
        }
      : {
          kind: "request",
          label: t("requestNamed", { name: album.name }),
          onClick: () => requestResult(albumRequestItem(reference(album))),
        };
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
              <OrbitCard key={album.id} album={album} onOpen={() => open(album)} action={actionOf(album)} />
            ))}
          </div>
        </div>
      ) : (
        <div className={orbitBody()}>
          <FadeScroll axis="x" arrows className={railScroller()} label={t("orbit.rail")}>
            <div className={orbitRail()}>
              {albums.map((album) => (
                <OrbitCard key={album.id} album={album} onOpen={() => open(album)} action={actionOf(album)} />
              ))}
            </div>
          </FadeScroll>
        </div>
      )}
    </WidgetFrame>
  );
}
