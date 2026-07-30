"use client";

import { useArtistIdentity, useArtistStats } from "@hooks/api/queries/content-detail";
import { useLidarrAvailable } from "@hooks/api/queries/useLidarrAvailable";
import { memo, useCallback, useMemo } from "react";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { EMPTY_GENRES } from "../../constants";
import { collectDegradedSources } from "../../helpers";
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

function ArtistDetailBodyComponent({ target, onNavigate }: ArtistDetailBodyProps) {
  const { data: identity } = useArtistIdentity({ deezerArtistId: target.id, artistName: target.artistName });
  const { data: stats } = useArtistStats({ artistName: target.artistName, mbid: identity?.mbid ?? null });
  const { data: lidarr } = useLidarrAvailable();
  const { requestArtist } = useContentDetailActions();

  const mbid = identity?.mbid ?? null;
  const cover = identity?.image ?? target.cover;
  const genres = useMemo(() => stats?.genres ?? EMPTY_GENRES, [stats?.genres]);
  const socials = useMemo(() => buildSocialLinks(identity?.socials), [identity?.socials]);
  const degradedSources = useMemo(
    () => collectDegradedSources([identity?.degraded, stats?.degraded]),
    [identity?.degraded, stats?.degraded]
  );

  const handleRequest = useCallback(() => {
    requestArtist({ id: target.id, name: target.name, cover });
  }, [requestArtist, target.id, target.name, cover]);

  const statsSlot = useMemo(
    () => <ArtistStatsWidget deezerArtistId={target.id} artistName={target.artistName} mbid={mbid} slot="stats" />,
    [target.id, target.artistName, mbid]
  );

  const showRequest = lidarr?.available === true;

  return (
    <div className={modalLayout()}>
      <DetailHero
        mode="artist"
        name={target.name}
        subtitle={null}
        cover={cover}
        genres={genres}
        requestState="request"
        onRequest={handleRequest}
        showRequest={showRequest}
        socials={socials}
        statsSlot={statsSlot}
        degradedSources={degradedSources}
      />

      <div className={modalScrollArea()}>
        <div className={modalGrid()}>
          <div className={modalMain()}>
            <ArtistTopTracksWidget deezerArtistId={target.id} />
          </div>

          <div className={modalSide()}>
            <ArtistStatsWidget deezerArtistId={target.id} artistName={target.artistName} mbid={mbid} slot="about" />
            <ArtistIdentityWidget deezerArtistId={target.id} artistName={target.artistName} />
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

export const ArtistDetailBody = memo(ArtistDetailBodyComponent);
