"use client";

import { useCatalogPlaylistTracks, usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { EMPTY_GENRES, EMPTY_SOCIALS, EMPTY_TRACKS } from "../../constants";
import { catalogPlaylistTracks } from "../../helpers";
import { PlaylistDetailWidget } from "../../widgets";
import { DetailHero } from "../DetailHero/DetailHero";
import { DetailEmpty, DetailSection } from "../DetailSection";
import { Tracklist } from "../Tracklist";
import { modalLayout, modalMain, modalScrollArea } from "../../styles";
import type { PlaylistDetailBodyProps } from "./types";

function PlaylistDetailBodyComponent({ target }: PlaylistDetailBodyProps) {
  const { t } = useTranslation("contentDetail");
  const source = target.playlistSource ?? (target.preloadedTracks ? "preloaded" : "library");
  const isPreloaded = source === "preloaded";
  const isLibrary = source === "library";
  const isCatalog = source === "catalog";

  const { data: playlist } = usePlaylistDetail({ playlistId: target.id, enabled: isLibrary });
  const { data: catalogContent, isLoading: isCatalogLoading } = useCatalogPlaylistTracks({
    playlistId: target.id,
    enabled: isCatalog,
  });
  const { requestPlaylist } = useContentDetailActions();

  const catalogTracks = useMemo(
    () => (isCatalog ? catalogPlaylistTracks(catalogContent?.content) : EMPTY_TRACKS),
    [isCatalog, catalogContent]
  );

  const displayTracks = useMemo(
    () =>
      isPreloaded
        ? (target.preloadedTracks ?? EMPTY_TRACKS)
        : isCatalog
          ? catalogTracks
          : (playlist?.tracks ?? EMPTY_TRACKS),
    [isPreloaded, isCatalog, target.preloadedTracks, catalogTracks, playlist?.tracks]
  );

  const totalTracks = isLibrary ? (playlist?.totalTracks ?? 0) : displayTracks.length;
  const libraryTrackCount = isLibrary ? (playlist?.libraryTrackCount ?? 0) : 0;
  const hasMeta = isLibrary ? !!playlist : true;
  const subtitle = hasMeta ? t("playlistTrackCount", { count: totalTracks }) : null;
  const requestState =
    totalTracks > 0 && libraryTrackCount >= totalTracks
      ? "inLibrary"
      : libraryTrackCount > 0
        ? "requestMissing"
        : "request";

  const heroCover = isLibrary ? (playlist?.cover ?? target.cover) : target.cover;

  const handleRequest = useCallback(() => {
    if (target.requestDisabled) return;
    if (isLibrary && !playlist) return;
    requestPlaylist({
      id: target.id,
      name: target.name,
      cover: heroCover,
      totalTracks: displayTracks.length,
      tracks: displayTracks,
    });
  }, [requestPlaylist, target.requestDisabled, target.id, target.name, isLibrary, playlist, heroCover, displayTracks]);

  const inLibraryCount = displayTracks.filter((track) => track.inLibrary).length;
  const tracklistCount =
    displayTracks.length > 0
      ? t("tracklistCount", { inLibrary: inLibraryCount, total: displayTracks.length })
      : undefined;

  return (
    <div className={modalLayout()}>
      <DetailHero
        mode="playlist"
        name={target.name}
        subtitle={subtitle}
        cover={heroCover}
        genres={EMPTY_GENRES}
        requestState={requestState}
        onRequest={handleRequest}
        requestDisabled={target.requestDisabled}
        requestDisabledTooltip={target.requestDisabledTooltip}
        socials={EMPTY_SOCIALS}
      />

      <div className={modalScrollArea()}>
        <div className={modalMain()}>
          {isLibrary ? (
            <PlaylistDetailWidget playlistId={target.id} />
          ) : (
            <DetailSection
              title={t("sections.tracklist")}
              isLoading={isCatalog ? isCatalogLoading : false}
              skeletonHeight="h-72"
              count={tracklistCount}
            >
              {displayTracks.length > 0 ? (
                <Tracklist tracks={displayTracks} showArtist />
              ) : (
                <DetailEmpty message={t("empty.tracklist")} />
              )}
            </DetailSection>
          )}
        </div>
      </div>
    </div>
  );
}

export const PlaylistDetailBody = memo(PlaylistDetailBodyComponent);
