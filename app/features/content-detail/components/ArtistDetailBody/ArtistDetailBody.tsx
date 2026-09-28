"use client";

import { useHasPlayableTracks } from "@hooks/api";
import { useArtistIdentity, useArtistStats } from "@hooks/api/queries/content-detail";
import { useLidarrAvailable } from "@hooks/api/queries/useLidarrAvailable";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
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
  const { data: identity } = useArtistIdentity({ catalogArtistId: target.id, artistName: target.artistName });
  const { data: stats } = useArtistStats({ artistName: target.artistName, mbid: identity?.mbid ?? null });
  const { data: lidarr } = useLidarrAvailable();
  const { data: playable } = useHasPlayableTracks({ kind: "artist", artist: target.name });
  const { requestArtist } = useContentDetailActions();
  const { playEntity, startRadio } = useEntityPlayback();

  const mbid = identity?.mbid ?? null;
  const cover = identity?.image ?? target.cover;
  const genres = useMemo(() => stats?.genres ?? EMPTY_GENRES, [stats?.genres]);
  const socials = useMemo(() => buildSocialLinks(identity?.socials), [identity?.socials]);
  const degradedSources = useMemo(
    () => collectDegradedSources([identity?.degraded, stats?.degraded]),
    [identity?.degraded, stats?.degraded]
  );

  const handlePlay = useCallback(() => playEntity({ kind: "artist", artist: target.name }), [playEntity, target.name]);
  const handleStartRadio = useCallback(
    () => startRadio({ kind: "artist", artist: target.name }),
    [startRadio, target.name]
  );

  const artistInput = useMemo(() => ({ id: target.id, name: target.name, cover }), [target.id, target.name, cover]);

  const handleRequest = useCallback(() => {
    requestArtist(artistInput);
  }, [requestArtist, artistInput]);

  const statsSlot = useMemo(
    () => <ArtistStatsWidget catalogArtistId={target.id} artistName={target.artistName} mbid={mbid} slot="stats" />,
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
        onPlay={playable ? handlePlay : undefined}
        onStartRadio={playable ? handleStartRadio : undefined}
        showRequest={showRequest}
        socials={socials}
        statsSlot={statsSlot}
        degradedSources={degradedSources}
      />

      <div className={modalScrollArea()}>
        <div className={modalGrid()}>
          <div className={modalMain()}>
            <ArtistTopTracksWidget artist={artistInput} />
          </div>

          <div className={modalSide()}>
            <ArtistStatsWidget catalogArtistId={target.id} artistName={target.artistName} mbid={mbid} slot="about" />
            <ArtistIdentityWidget catalogArtistId={target.id} artistName={target.artistName} />
          </div>
        </div>

        <div className={modalFullRow()}>
          <ArtistDiscographyWidget
            catalogArtistId={target.id}
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
