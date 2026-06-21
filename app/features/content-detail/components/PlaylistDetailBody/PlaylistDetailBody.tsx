"use client";

import { BulkActionBar, type BulkAction } from "@components/ui/BulkActionBar";
import { Checkbox } from "@components/ui/Checkbox";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { DeletePlaylistDialog } from "@components/DeletePlaylistDialog";
import { useCatalogPlaylistTracks, usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { useRemoveTracksFromPlaylist } from "@hooks/api/mutations/playlists/useRemoveTracksFromPlaylist";
import { useRenamePlaylist } from "@hooks/api/mutations/playlists/useRenamePlaylist";
import { useSetPlaylistSync } from "@hooks/api/mutations/playlists/useSetPlaylistSync";
import { useRetryPlexPlaylist } from "@hooks/api/mutations/requests/useRetryPlexPlaylist";
import { useInlineRename } from "@hooks/ui/useInlineRename";
import { useSelection } from "@hooks/ui/useSelection";
import { playlistOriginLabel } from "@utils/playlist";
import { Trash2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { EMPTY_GENRES, EMPTY_SOCIALS, EMPTY_TRACKS } from "../../constants";
import { catalogPlaylistTracks, computeRequestState, deriveTrackStatusCounts, isRemovableTrack } from "../../helpers";
import { DetailHero, PlaylistSyncToggle } from "../DetailHero";
import { DetailEmpty, DetailSection } from "../DetailSection";
import { Tracklist } from "../Tracklist";
import { modalLayout, modalMain, modalScrollArea, selectAllControl } from "../../styles";
import { DEFAULT_SORT_KEY } from "./constants";
import { sortTracklist } from "./helpers";
import { TracklistSort } from "./TracklistSort";
import type { PlaylistDetailBodyProps, SortDirection, TracklistSortKey } from "./types";

function PlaylistDetailBodyComponent({ target, onClose, showInLibraryPill = true }: PlaylistDetailBodyProps) {
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
  const renamePlaylist = useRenamePlaylist();
  const setSync = useSetPlaylistSync();
  const syncToPlex = useRetryPlexPlaylist();
  const selection = useSelection<{ id: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [sortKey, setSortKey] = useState<TracklistSortKey>(DEFAULT_SORT_KEY);
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

  const sortedTracks = useMemo(
    () => sortTracklist(displayTracks, sortKey, direction),
    [displayTracks, sortKey, direction]
  );

  const totalTracks = isLibrary ? (playlist?.totalTracks ?? 0) : displayTracks.length;
  const hasMeta = isLibrary ? !!playlist : true;
  const sourceProvider = playlist?.sourceProvider ?? null;
  const subtitle = !hasMeta
    ? null
    : isLibrary
      ? playlistOriginLabel(sourceProvider, tLibrary, { withProvider: true })
      : t("playlistTrackCount", { count: totalTracks });
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
  const canEdit = isLibrary && !!playlist && (sourceProvider == null || !syncEnabled);
  const playlistName = isLibrary && playlist ? playlist.name : target.name;

  const handleSaveName = useCallback(
    (nextName: string) => {
      renamePlaylist.mutate({ playlistId: target.id, name: nextName });
    },
    [renamePlaylist, target.id]
  );

  const rename = useInlineRename({ value: playlistName, onSave: handleSaveName });

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

  const tracklistCount =
    displayTracks.length > 0
      ? t("tracklistCount", { inLibrary: counts.completeCount, total: displayTracks.length })
      : undefined;

  const removableIds = useMemo(
    () => displayTracks.filter(isRemovableTrack).map((track) => track.requestId),
    [displayTracks]
  );
  const allRemovableSelected = removableIds.length > 0 && removableIds.every((id) => selection.isSelected(id));
  const someRemovableSelected = removableIds.some((id) => selection.isSelected(id));

  const handleConfirmRemove = useCallback(() => {
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

  const handleSyncToPlex = useCallback(() => {
    syncToPlex.mutate({ playlistId: target.id });
  }, [syncToPlex, target.id]);

  const bulkActions: BulkAction[] = [
    {
      icon: Trash2,
      label: tLibrary("playlists.bulk.removeCount", { count: selection.selectedCount }),
      onClick: () => setConfirmRemoveOpen(true),
      disabled: removeTracks.isPending,
    },
  ];

  const removeDialogTitle = tLibrary("playlists.removeDialog.title", { count: selection.selectedCount });

  const playlistControls =
    isLibrary && playlist
      ? {
          canEdit,
          onRename: rename.start,
          onDelete: () => setDeleteOpen(true),
          onSyncToPlex: handleSyncToPlex,
          isSyncing: syncToPlex.isPending,
          isEditing: rename.isEditing,
          editValue: rename.draft,
          onEditChange: rename.setDraft,
          onEditSave: rename.save,
          onEditCancel: rename.cancel,
          labels: {
            menu: tLibrary("playlists.actions.menu", { name: playlistName }),
            rename: tLibrary("playlists.actions.rename"),
            delete: tLibrary("playlists.actions.delete"),
            nameField: tLibrary("playlists.renameDialog.placeholder"),
            save: tLibrary("playlists.renameDialog.confirm"),
            syncToPlex: tLibrary("playlists.actions.syncToPlex"),
            syncing: tLibrary("playlists.actions.syncing"),
          },
          syncBadge: isImported ? (
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

          <DetailSection
            title={t("sections.tracklist")}
            isLoading={isLibrary ? !playlist : isCatalog ? isCatalogLoading : false}
            skeletonHeight="h-72"
            count={tracklistCount}
            trailingSlot={
              <div className="flex items-center gap-2">
                {displayTracks.length > 1 ? (
                  <TracklistSort
                    sortKey={sortKey}
                    direction={direction}
                    onSortKeyChange={setSortKey}
                    onDirectionChange={setDirection}
                  />
                ) : null}
                {isLibrary && canEdit && removableIds.length > 0 ? (
                  <label className={selectAllControl()}>
                    <Checkbox
                      checked={allRemovableSelected ? true : someRemovableSelected ? "indeterminate" : false}
                      onCheckedChange={(value) => selection.setMany(removableIds, value === true)}
                      aria-label={t("selection.selectAll")}
                    />
                    {t("selection.selectAll")}
                  </label>
                ) : null}
              </div>
            }
          >
            {sortedTracks.length > 0 ? (
              <Tracklist
                tracks={sortedTracks}
                showArtist
                selectable={isLibrary && canEdit}
                isSelected={selection.isSelected}
                onToggleSelect={selection.toggle}
              />
            ) : (
              <DetailEmpty message={t("empty.tracklist")} />
            )}
          </DetailSection>
        </div>
      </div>

      {isLibrary && playlist ? (
        <>
          <ConfirmationModal
            isOpen={confirmRemoveOpen}
            onClose={() => setConfirmRemoveOpen(false)}
            onConfirm={handleConfirmRemove}
            title={removeDialogTitle}
            message={tLibrary("playlists.removeDialog.description")}
            confirmText={tLibrary("playlists.removeDialog.confirm")}
            variant="danger"
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
