"use client";

import { BulkActionBar, type BulkAction } from "@components/ui/BulkActionBar";
import { Checkbox } from "@components/ui/Checkbox";
import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { RenamePlaylistDialog } from "@components/RenamePlaylistDialog";
import { useCatalogPlaylistTracks, usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { useRemoveTracksFromPlaylist } from "@hooks/api/mutations/playlists/useRemoveTracksFromPlaylist";
import { useSetPlaylistSync } from "@hooks/api/mutations/playlists/useSetPlaylistSync";
import { useSelection } from "@hooks/ui/useSelection";
import { Trash2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { EMPTY_GENRES, EMPTY_SOCIALS, EMPTY_TRACKS } from "../../constants";
import { catalogPlaylistTracks, isRemovableTrack } from "../../helpers";
import { DetailHero, PlaylistSyncToggle } from "../DetailHero";
import { DetailEmpty, DetailSection } from "../DetailSection";
import { Tracklist } from "../Tracklist";
import { modalLayout, modalMain, modalScrollArea, selectAllControl } from "../../styles";
import type { PlaylistDetailBodyProps } from "./types";

function PlaylistDetailBodyComponent({ target, onClose }: PlaylistDetailBodyProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
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

  const removeTracks = useRemoveTracksFromPlaylist();
  const setSync = useSetPlaylistSync();
  const selection = useSelection<{ id: string }>();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const sourceProvider = playlist?.sourceProvider ?? null;
  const syncEnabled = playlist?.syncEnabled ?? false;
  const isImported = sourceProvider != null;
  const canEdit = isLibrary && !!playlist && (sourceProvider == null || !syncEnabled);

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

  const removableIds = useMemo(
    () => displayTracks.filter(isRemovableTrack).map((track) => track.requestId),
    [displayTracks]
  );
  const allRemovableSelected = removableIds.length > 0 && removableIds.every((id) => selection.isSelected(id));
  const someRemovableSelected = removableIds.some((id) => selection.isSelected(id));

  const handleRemove = useCallback(() => {
    const trackIds = removableIds.filter((id) => selection.isSelected(id));
    if (trackIds.length === 0) return;
    removeTracks.mutate({ playlistId: target.id, trackIds }, { onSuccess: () => selection.clear() });
  }, [removableIds, selection, removeTracks, target.id]);

  const handleSyncToggle = useCallback(
    (next: boolean) => {
      selection.clear();
      setSync.mutate({ playlistId: target.id, enabled: next });
    },
    [selection, setSync, target.id]
  );

  const bulkActions: BulkAction[] = [
    {
      icon: Trash2,
      label: tLibrary("playlists.bulk.removeCount", { count: selection.selectedCount }),
      onClick: handleRemove,
      disabled: removeTracks.isPending,
    },
  ];

  const playlistControls =
    isLibrary && playlist
      ? {
          canEdit,
          disabledTooltip: tLibrary("playlists.syncedReadonly"),
          onRename: () => setRenameOpen(true),
          onDelete: () => setDeleteOpen(true),
          syncSlot: isImported ? (
            <PlaylistSyncToggle syncEnabled={syncEnabled} onToggle={handleSyncToggle} disabled={setSync.isPending} />
          ) : undefined,
        }
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
        playlistControls={playlistControls}
      />

      <div className={modalScrollArea()}>
        <div className={modalMain()}>
          {canEdit && selection.selectedCount > 0 ? (
            <BulkActionBar
              count={selection.selectedCount}
              countLabel={t("selection.selected")}
              actions={bulkActions}
              clearLabel={t("selection.clear")}
              onClear={selection.clear}
            />
          ) : null}

          {isLibrary ? (
            <DetailSection
              title={t("sections.tracklist")}
              isLoading={!playlist}
              skeletonHeight="h-72"
              count={tracklistCount}
              trailingSlot={
                canEdit && removableIds.length > 0 ? (
                  <label className={selectAllControl()}>
                    <Checkbox
                      checked={allRemovableSelected ? true : someRemovableSelected ? "indeterminate" : false}
                      onCheckedChange={(value) => selection.setMany(removableIds, value === true)}
                      aria-label={t("selection.selectAll")}
                    />
                    {t("selection.selectAll")}
                  </label>
                ) : undefined
              }
            >
              {displayTracks.length > 0 ? (
                <Tracklist
                  tracks={displayTracks}
                  showArtist
                  selectable={canEdit}
                  isSelected={selection.isSelected}
                  onToggleSelect={selection.toggle}
                />
              ) : (
                <DetailEmpty message={t("empty.tracklist")} />
              )}
            </DetailSection>
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

      {isLibrary && playlist ? (
        <>
          <RenamePlaylistDialog
            open={renameOpen}
            onOpenChange={setRenameOpen}
            playlistId={target.id}
            currentName={playlist.name}
          />
          <DeletePlaylistDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            playlistId={target.id}
            onDeleted={onClose}
          />
        </>
      ) : null}
    </div>
  );
}

export const PlaylistDetailBody = memo(PlaylistDetailBodyComponent);
