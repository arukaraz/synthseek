"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useSaveLibraryChanges } from "@hooks/api/mutations/spotify/useSaveLibraryChanges";
import { buildDockItems, seedDockJob } from "@hooks/api/subscriptions";
import { useInvalidateSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useInvalidateSpotifyConnectionStatus";
import { useLibrarySubscription } from "@hooks/api/queries/spotify/useLibrarySubscription";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { useSpotifyLibraryItems } from "@hooks/api/queries/spotify/useSpotifyLibraryItems";
import { emitFriendlyToast, extractAppCode, resolveFriendlyError } from "@modules/errors";
import { generateUuid } from "@utils/uuid";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ModalBottombar } from "./components/ModalBottombar";
import { ModalToolbar } from "./components/ModalToolbar";
import { ModalTopbar } from "./components/ModalTopbar";
import { MasterTable } from "./components/MasterTable";
import { DetailPanel } from "./components/DetailPanel";
import { SelectionBulkBar } from "./components/SelectionBulkBar";
import { SpotifyConnectPrompt } from "./components/SpotifyConnectPrompt";
import { DEFAULT_IMPORT_CONFIG } from "./constants";
import { aggregateToggleState, resolveToggleTarget } from "./helpers";
import { useFilteredItems } from "./hooks/useFilteredItems";
import { useLibraryDraftState } from "./hooks/useLibraryDraftState";
import { detailPaneWrapper, modalGrid, modalRoot, split } from "./styles";
import type { LibraryFilter, LibrarySort, SpotifyLibraryModalProps } from "./types";

export function SpotifyLibraryModal({ open, onOpenChange }: SpotifyLibraryModalProps) {
  const { t } = useTranslation("library");
  const status = useSpotifyConnectionStatus();
  const connected = status.data?.connected ?? false;
  const items = useSpotifyLibraryItems(open && connected);
  const subscription = useLibrarySubscription();
  const save = useSaveLibraryChanges();
  const invalidateConnectionStatus = useInvalidateSpotifyConnectionStatus();

  const reauthNeeded = items.isError && extractAppCode(items.error) === "LIBRARY_SOURCE_REAUTH_REQUIRED";

  useEffect(() => {
    if (!items.isError) return;
    if (reauthNeeded) {
      emitFriendlyToast(resolveFriendlyError(items.error));
      invalidateConnectionStatus();
      return;
    }
    emitFriendlyToast(
      resolveFriendlyError(items.error, {
        category: "spotify",
        fallback: {
          title: t("spotifyLibrary.loadFailed.title"),
          description: t("spotifyLibrary.loadFailed.description"),
        },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.error, reauthNeeded]);

  const initialWatch = useMemo(
    () => ({
      playlists: subscription.data?.watch_new_playlists ?? false,
      savedAlbums: subscription.data?.watch_saved_albums ?? false,
    }),
    [subscription.data]
  );

  const draft = useLibraryDraftState(initialWatch);

  useEffect(() => {
    if (!open) return;
    draft.reset(initialWatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [sort, setSort] = useState<LibrarySort>("type");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  const sourceItems = useMemo(() => items.data ?? [], [items.data]);
  const filteredItems = useFilteredItems({ items: sourceItems, filter, sort, direction, search });
  const focusedItem = useMemo(
    () => sourceItems.find((i) => i.id === draft.state.focusedId) ?? null,
    [sourceItems, draft.state.focusedId]
  );

  const { setFocus, toggleSelect } = draft;
  const focusedId = draft.state.focusedId;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (filteredItems.length === 0) return;
      const currentIdx = focusedId ? filteredItems.findIndex((i) => i.id === focusedId) : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = currentIdx < 0 ? 0 : Math.min(currentIdx + 1, filteredItems.length - 1);
        setFocus(filteredItems[nextIdx].id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const nextIdx = currentIdx < 0 ? 0 : Math.max(currentIdx - 1, 0);
        setFocus(filteredItems[nextIdx].id);
      } else if (e.key === " " || e.code === "Space") {
        if (focusedId) {
          e.preventDefault();
          toggleSelect(focusedId);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filteredItems, focusedId, setFocus, toggleSelect]);

  useEffect(() => {
    if (!focusedId) return;
    const row = document.querySelector<HTMLElement>(`[data-master-row-id="${focusedId}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  const totalRows = sourceItems.length;
  const totalTracks = sourceItems.reduce((s, i) => s + i.totalTracks, 0);

  const hasChanges = useMemo(() => {
    if (draft.state.importOverrides.size > 0) return true;
    if (draft.state.syncOverrides.size > 0) return true;
    if (
      draft.state.autoWatch.playlists !== initialWatch.playlists ||
      draft.state.autoWatch.savedAlbums !== initialWatch.savedAlbums
    ) {
      return true;
    }
    return false;
  }, [draft.state, initialWatch]);

  const selectedItems = useMemo(
    () => sourceItems.filter((item) => draft.state.selectedIds.has(item.id)),
    [sourceItems, draft.state.selectedIds]
  );
  const selectedPlaylists = useMemo(() => selectedItems.filter((item) => item.type === "playlist"), [selectedItems]);
  const hasPlaylists = selectedPlaylists.length > 0;
  const isMixedType = hasPlaylists && selectedPlaylists.length < selectedItems.length;

  const syncState = useMemo(
    () => aggregateToggleState(selectedPlaylists.map((item) => draft.selectors.targetSyncEnabled(item))),
    [selectedPlaylists, draft.selectors]
  );
  const importState = useMemo(
    () => aggregateToggleState(selectedItems.map((item) => draft.selectors.targetImported(item))),
    [selectedItems, draft.selectors]
  );

  const handleActivateSync = () => {
    draft.setSyncForItems(selectedPlaylists, resolveToggleTarget(syncState));
  };

  const handleActivateImport = () => {
    const target = resolveToggleTarget(importState);
    draft.setImportForItems(selectedItems, target);
    if (!target) draft.setSyncForItems(selectedItems, false);
  };

  const handleSave = async () => {
    const toImport: Array<{ id: string; type: "playlist" | "album" | "liked"; syncEnabled: boolean }> = [];
    const toToggleSync: Array<{ localId: string; syncEnabled: boolean }> = [];

    for (const item of sourceItems) {
      const targetImport = draft.selectors.targetImported(item);
      const targetSync = draft.selectors.targetSyncEnabled(item);

      if (!item.imported && targetImport) {
        toImport.push({ id: item.id, type: item.type, syncEnabled: targetSync });
      } else if (item.imported && targetSync !== item.syncEnabled && item.localId) {
        toToggleSync.push({ localId: item.localId, syncEnabled: targetSync });
      }
    }

    const subscriptionChanged =
      draft.state.autoWatch.playlists !== initialWatch.playlists ||
      draft.state.autoWatch.savedAlbums !== initialWatch.savedAlbums;

    const jobId = generateUuid();

    if (toImport.length > 0) {
      const nameById = new Map(sourceItems.map((item) => [item.id, item.name]));
      seedDockJob({
        id: jobId,
        kind: "library-import",
        provider: "spotify",
        items: buildDockItems(toImport.map((item) => ({ key: item.id, name: nameById.get(item.id) ?? item.id }))),
        status: "running",
      });
    }

    await save.mutateAsync({
      jobId,
      toImport,
      toToggleSync,
      subscription: subscriptionChanged
        ? {
            watch_new_playlists: draft.state.autoWatch.playlists,
            watch_saved_albums: draft.state.autoWatch.savedAlbums,
          }
        : undefined,
      config: DEFAULT_IMPORT_CONFIG,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={modalRoot()}
        onEscapeKeyDown={(e) => {
          if (focusedId) {
            e.preventDefault();
            setFocus(null);
          }
        }}
      >
        <DialogTitle className="sr-only">{t("spotifyLibrary.dialog.title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("spotifyLibrary.dialog.description")}</DialogDescription>
        {connected && !reauthNeeded ? (
          <div className={modalGrid()}>
            <ModalTopbar />
            <ModalToolbar
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              direction={direction}
              onDirectionChange={setDirection}
              search={search}
              onSearchChange={setSearch}
              autoWatch={draft.state.autoWatch}
              onWatchChange={draft.setWatch}
            />
            <div className={split()}>
              <MasterTable
                items={filteredItems}
                isLoading={items.isLoading}
                draft={draft}
                hiddenOnMobile={Boolean(focusedItem)}
                selectionBar={
                  draft.state.selectedIds.size > 0 ? (
                    <SelectionBulkBar
                      selectedCount={draft.state.selectedIds.size}
                      syncState={syncState}
                      importState={importState}
                      hasPlaylists={hasPlaylists}
                      isMixedType={isMixedType}
                      onActivateSync={handleActivateSync}
                      onActivateImport={handleActivateImport}
                      onClear={draft.clearSelection}
                      disabled={save.isPending}
                    />
                  ) : null
                }
              />
              <div className={detailPaneWrapper({ hiddenOnMobile: !focusedItem })}>
                <DetailPanel focusedItem={focusedItem} draft={draft} onBack={() => draft.setFocus(null)} />
              </div>
            </div>
            <ModalBottombar
              totalRows={totalRows}
              totalTracks={totalTracks}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
              isSaving={save.isPending}
              hasChanges={hasChanges}
              onRefresh={() => void items.refetch()}
              isRefreshing={items.isFetching}
            />
          </div>
        ) : (
          <SpotifyConnectPrompt
            pending={status.data?.pending ?? false}
            statusLoading={status.isLoading}
            expired={reauthNeeded}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
