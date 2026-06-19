"use client";

import { useAlbumDetail } from "@hooks/api/queries/content-detail";
import { memo, useCallback, useMemo } from "react";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { EMPTY_GENRES, EMPTY_SOCIALS, EMPTY_TRACKS } from "../../constants";
import { artistTarget, computeRequestState, deriveTrackStatusCounts } from "../../helpers";
import { AlbumCreditsWidget, AlbumDetailWidget, AlbumStatsWidget, MoreFromArtistWidget } from "../../widgets";
import { DetailHero } from "../DetailHero/DetailHero";
import { modalFullRow, modalGrid, modalLayout, modalMain, modalScrollArea, modalSide } from "../../styles";
import type { AlbumDetailBodyProps } from "./types";

function AlbumDetailBodyComponent({ target, onNavigate, showInLibraryPill = true }: AlbumDetailBodyProps) {
  const { data: album } = useAlbumDetail({ deezerAlbumId: target.id });
  const { requestAlbum } = useContentDetailActions();

  const artistName = album?.artist ?? target.artistName;
  const artistExternalId = album?.artistExternalId ?? null;
  const genres = useMemo(() => album?.genres ?? EMPTY_GENRES, [album?.genres]);
  const trackCount = album?.totalTracks ?? null;
  const cover = album?.cover ?? target.cover;
  const tracks = album?.tracks ?? EMPTY_TRACKS;
  const counts = useMemo(() => deriveTrackStatusCounts(tracks), [tracks]);
  const requestState = computeRequestState({
    requestedTrackCount: counts.requestedCount,
    failedTrackCount: counts.failedCount,
    libraryTrackCount: counts.completeCount,
    totalTracks: tracks.length,
  });

  const handleRequest = useCallback(() => {
    requestAlbum({
      id: target.id,
      name: target.name,
      artistName,
      cover,
      genres,
    });
  }, [requestAlbum, target.id, target.name, artistName, cover, genres]);

  const handleArtistNavigate = useMemo(
    () =>
      artistExternalId
        ? () => onNavigate(artistTarget({ id: artistExternalId, name: artistName, cover: null }))
        : undefined,
    [artistExternalId, artistName, onNavigate]
  );

  const statsSlot = useMemo(
    () => <AlbumStatsWidget artistName={artistName} albumName={target.name} trackCount={trackCount} slot="stats" />,
    [artistName, target.name, trackCount]
  );

  return (
    <div className={modalLayout()}>
      <DetailHero
        mode="album"
        name={target.name}
        subtitle={artistName}
        cover={cover}
        genres={genres}
        requestState={requestState}
        showInLibraryPill={showInLibraryPill}
        onRequest={handleRequest}
        onSubtitleClick={handleArtistNavigate}
        socials={EMPTY_SOCIALS}
        statsSlot={statsSlot}
      />

      <div className={modalScrollArea()}>
        <div className={modalGrid()}>
          <div className={modalMain()}>
            <AlbumDetailWidget deezerAlbumId={target.id} />
          </div>

          <div className={modalSide()}>
            <AlbumStatsWidget artistName={artistName} albumName={target.name} trackCount={trackCount} slot="about" />
            <AlbumCreditsWidget
              deezerAlbumId={target.id}
              releaseDate={album?.releaseDate ?? null}
              label={album?.label ?? null}
              recordType={album?.recordType ?? null}
              length={album?.length ?? null}
            />
          </div>
        </div>

        <div className={modalFullRow()}>
          <MoreFromArtistWidget
            artistExternalId={album?.artistExternalId ?? null}
            artistName={artistName}
            excludeAlbumId={target.id}
            onSelectAlbum={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}

export const AlbumDetailBody = memo(AlbumDetailBodyComponent);
