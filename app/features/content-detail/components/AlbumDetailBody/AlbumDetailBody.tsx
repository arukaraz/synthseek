"use client";

import { useAlbumDetail } from "@hooks/api/queries/content-detail";

import { AlbumCreditsWidget, AlbumDetailWidget, AlbumStatsWidget, MoreFromArtistWidget } from "../../widgets";
import { DetailHero } from "../DetailHero/DetailHero";
import { modalFullRow, modalGrid, modalLayout, modalMain, modalScrollArea, modalSide } from "../../styles";
import type { AlbumDetailBodyProps } from "./types";

export function AlbumDetailBody({ target, onNavigate }: AlbumDetailBodyProps) {
  const { data: album } = useAlbumDetail({ deezerAlbumId: target.id });

  const artistName = album?.artist ?? target.artistName;
  const genres = album?.genres ?? [];
  const trackCount = album?.totalTracks ?? null;
  const totalTracks = album?.totalTracks ?? 0;
  const libraryTrackCount = album?.libraryTrackCount ?? 0;
  const requestState =
    totalTracks > 0 && libraryTrackCount >= totalTracks
      ? "inLibrary"
      : libraryTrackCount > 0
        ? "requestMissing"
        : "request";

  return (
    <div className={modalLayout()}>
      <DetailHero
        mode="album"
        name={target.name}
        subtitle={artistName}
        cover={album?.cover ?? target.cover}
        genres={genres}
        requestState={requestState}
        socials={[]}
        statsSlot={
          <AlbumStatsWidget artistName={artistName} albumName={target.name} trackCount={trackCount} slot="stats" />
        }
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
