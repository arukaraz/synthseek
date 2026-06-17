"use client";

import { useArtistDiscography, useArtistIdentity, useArtistStats } from "@hooks/api/queries/content-detail";

import {
  ArtistDiscographyWidget,
  ArtistIdentityWidget,
  ArtistSimilarWidget,
  ArtistStatsWidget,
  ArtistTopTracksWidget,
} from "../../widgets";
import { DetailHero } from "../DetailHero/DetailHero";
import { buildSocialLinks } from "../DetailHero/helpers";
import { modalFullRow, modalGrid, modalLayout, modalMain, modalScrollArea, modalSide } from "../../styles";
import type { ArtistDetailBodyProps } from "./types";

export function ArtistDetailBody({ target, onNavigate }: ArtistDetailBodyProps) {
  const { data: identity } = useArtistIdentity({ deezerArtistId: target.id, artistName: target.artistName });
  const { data: stats } = useArtistStats({ artistName: target.artistName, mbid: identity?.mbid ?? null });
  const { data: discography } = useArtistDiscography({ deezerArtistId: target.id });

  const mbid = identity?.mbid ?? null;
  const albumsInLibrary =
    discography?.groups.reduce((total, group) => total + group.albums.filter((album) => album.inLibrary).length, 0) ??
    null;
  const genres = stats?.genres ?? [];
  const socials = buildSocialLinks(identity?.socials);

  return (
    <div className={modalLayout()}>
      <DetailHero
        mode="artist"
        name={target.name}
        subtitle={null}
        cover={identity?.image ?? target.cover}
        genres={genres}
        requestState="request"
        socials={socials}
        statsSlot={
          <ArtistStatsWidget artistName={target.artistName} mbid={mbid} inLibraryCount={albumsInLibrary} slot="stats" />
        }
      />

      <div className={modalScrollArea()}>
        <div className={modalGrid()}>
          <div className={modalMain()}>
            <ArtistTopTracksWidget deezerArtistId={target.id} />
          </div>

          <div className={modalSide()}>
            <ArtistStatsWidget
              artistName={target.artistName}
              mbid={mbid}
              inLibraryCount={albumsInLibrary}
              slot="about"
            />
            <ArtistIdentityWidget
              deezerArtistId={target.id}
              artistName={target.artistName}
              albumsInLibrary={albumsInLibrary}
            />
          </div>
        </div>

        <div className={modalFullRow()}>
          <ArtistDiscographyWidget
            deezerArtistId={target.id}
            artistName={target.artistName}
            onSelectAlbum={onNavigate}
          />
          <ArtistSimilarWidget artistName={target.artistName} onSelectArtist={onNavigate} />
        </div>
      </div>
    </div>
  );
}
