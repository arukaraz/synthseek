"use client";

import { useCatalogPlaylistTracks, usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { useSetPlaylistSync } from "@hooks/api/mutations/playlists/useSetPlaylistSync";
import { playlistOriginLabel } from "@utils/playlist";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { EMPTY_GENRES, EMPTY_SOCIALS, EMPTY_TRACKS } from "../../constants";
import {
  catalogPlaylistTracks,
  computeRequestState,
  deriveTrackStatusCounts,
  failedToLoad,
  unrequestedTracks,
} from "../../helpers";
import { DetailHero, PlaylistSyncToggle } from "../DetailHero";
import { DetailEmpty, DetailSection } from "../DetailSection";
import { PlaylistTracklist } from "../PlaylistTracklist";
import { StatRow } from "../StatRow";
import { Tracklist } from "../Tracklist";
import { useDetailPlayback } from "../../hooks/useDetailPlayback";
import { useStableTracklistOrder } from "../../hooks/useStableTracklistOrder";
import { useTrackArtistNavigation } from "../../hooks/useTrackArtistNavigation";
import { modalLayout, modalMain, modalScrollArea } from "../../styles";
import { DEFAULT_SORT_KEY, PLAYLIST_SORT_KEY, PLAYLIST_SORT_KEYS, SORT_KEYS } from "./constants";
import { TracklistSort } from "./TracklistSort";
import type { RequestIntent } from "../../types";
import type { PlaylistDetailBodyProps, SortDirection, TracklistSortKey } from "./types";

function PlaylistDetailBodyComponent({
  target,
  onClose,
  onNavigate,
  onOpenWorkshop,
  showInLibraryPill = true,
}: PlaylistDetailBodyProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const openTrackArtist = useTrackArtistNavigation(onNavigate);
  const source = target.playlistSource ?? (target.preloadedTracks ? "preloaded" : "library");
  const isPreloaded = source === "preloaded";
  const isLibrary = source === "library";
  const isCatalog = source === "catalog";

  const playlistQuery = usePlaylistDetail({ playlistId: target.id, enabled: isLibrary });
  const { data: playlist } = playlistQuery;
  const catalogQuery = useCatalogPlaylistTracks({ playlistId: target.id, enabled: isCatalog });
  const { data: catalogContent, isLoading: isCatalogLoading } = catalogQuery;
  const loadFailed = failedToLoad(isLibrary ? playlistQuery : catalogQuery);
  const canManage = isLibrary && playlist?.canManage === true;
  const requestLocked = isLibrary && playlist?.ownedByViewer === false;
  const { requestPlaylist } = useContentDetailActions();
  const { play, shuffle, enqueue } = useDetailPlayback(onClose);
  const handleEnqueue = useCallback(() => enqueue({ kind: "playlist", playlistId: target.id }), [enqueue, target.id]);
  const handlePlay = useCallback(() => play({ kind: "playlist", playlistId: target.id }), [play, target.id]);
  const handleShuffle = useCallback(() => shuffle({ kind: "playlist", playlistId: target.id }), [shuffle, target.id]);

  const setSync = useSetPlaylistSync();
  const [sortKey, setSortKey] = useState<TracklistSortKey>(isLibrary ? PLAYLIST_SORT_KEY : DEFAULT_SORT_KEY);
  const [direction, setDirection] = useState<SortDirection>("asc");

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

  const sortedTracks = useStableTracklistOrder(displayTracks, sortKey, direction);

  const totalTracks = isLibrary ? (playlist?.totalTracks ?? 0) : displayTracks.length;
  const sourceProvider = playlist?.sourceProvider ?? null;
  const subtitle = !isLibrary
    ? t("playlistTrackCount", { count: totalTracks })
    : playlist
      ? playlistOriginLabel(playlist.origin, tLibrary, { withProvider: true })
      : null;
  const counts = useMemo(() => deriveTrackStatusCounts(displayTracks), [displayTracks]);
  const requestState = isLibrary
    ? computeRequestState({
        requestedTrackCount: counts.requestedCount,
        failedTrackCount: counts.failedCount,
        libraryTrackCount: counts.completeCount,
        totalTracks: displayTracks.length,
      })
    : "request";

  const heroCover = isLibrary ? (playlist?.cover ?? target.cover) : target.cover;

  const syncEnabled = playlist?.syncEnabled ?? false;
  const isImported = sourceProvider != null;
  const playlistName = isLibrary && playlist ? playlist.name : target.name;

  const requestWith = useCallback(
    (intent: RequestIntent) => {
      if (target.requestDisabled || requestLocked) return;
      if (isLibrary && !playlist) return;
      requestPlaylist(
        {
          id: target.id,
          name: target.name,
          cover: heroCover,
          totalTracks: displayTracks.length,
          tracks: displayTracks,
        },
        intent
      );
    },
    [
      requestPlaylist,
      target.requestDisabled,
      requestLocked,
      target.id,
      target.name,
      isLibrary,
      playlist,
      heroCover,
      displayTracks,
    ]
  );
  const handleRequest = useCallback(() => requestWith("direct"), [requestWith]);
  const handleCustomizeRequest = useCallback(() => requestWith("customize"), [requestWith]);

  const tracklistCount =
    displayTracks.length > 0
      ? t("tracklistCount", { inLibrary: counts.completeCount, total: displayTracks.length })
      : undefined;

  const handleSyncToggle = useCallback(
    (next: boolean) => setSync.mutate({ playlistId: target.id, enabled: next }),
    [setSync, target.id]
  );

  const playlistControls = isLibrary
    ? {
        quietRequest: true,
        missingCount: unrequestedTracks(displayTracks).length,
        onOpenWorkshop: canManage ? onOpenWorkshop : undefined,
        syncBadge:
          canManage && isImported ? (
            <PlaylistSyncToggle syncEnabled={syncEnabled} onToggle={handleSyncToggle} disabled={setSync.isPending} />
          ) : undefined,
      }
    : undefined;

  return (
    <div className={modalLayout()}>
      <DetailHero
        mode="playlist"
        name={playlistName}
        subtitle={subtitle}
        cover={heroCover}
        genres={EMPTY_GENRES}
        requestState={requestState}
        showInLibraryPill={showInLibraryPill}
        onRequest={handleRequest}
        onCustomizeRequest={handleCustomizeRequest}
        showRequest={!loadFailed}
        onPlay={isLibrary && !loadFailed ? handlePlay : undefined}
        onShuffle={isLibrary && !loadFailed ? handleShuffle : undefined}
        onEnqueue={isLibrary && !loadFailed ? handleEnqueue : undefined}
        statsSlot={
          displayTracks.length > 0 ? (
            <StatRow layout="inline" stats={[{ label: t("stats.tracks"), value: displayTracks.length }]} />
          ) : undefined
        }
        requestDisabled={target.requestDisabled || requestLocked}
        requestDisabledTooltip={requestLocked ? t("requestOwnerOnly") : target.requestDisabledTooltip}
        socials={EMPTY_SOCIALS}
        playlistControls={playlistControls}
      />

      <div className={modalScrollArea()}>
        <div className={modalMain()}>
          <DetailSection
            title={t("sections.tracklist")}
            isLoading={isLibrary ? !playlist : isCatalog ? isCatalogLoading : false}
            errorMessage={loadFailed ? t("loadFailed") : null}
            skeletonHeight="h-72"
            count={tracklistCount}
            trailingSlot={
              displayTracks.length > 1 ? (
                <TracklistSort
                  keys={isLibrary ? PLAYLIST_SORT_KEYS : SORT_KEYS}
                  sortKey={sortKey}
                  direction={direction}
                  onSortKeyChange={setSortKey}
                  onDirectionChange={setDirection}
                />
              ) : undefined
            }
          >
            {sortedTracks.length === 0 ? (
              <DetailEmpty message={t("empty.tracklist")} />
            ) : isLibrary ? (
              <PlaylistTracklist playlistId={target.id} tracks={sortedTracks} onArtistNavigate={openTrackArtist} />
            ) : (
              <Tracklist tracks={sortedTracks} showArtist onArtistNavigate={openTrackArtist} />
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

export const PlaylistDetailBody = memo(PlaylistDetailBodyComponent);
