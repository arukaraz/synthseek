"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useSaveLibraryChanges } from "@hooks/api/mutations/spotify/useSaveLibraryChanges";
import { useLibrarySubscription } from "@hooks/api/queries/spotify/useLibrarySubscription";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { useSpotifyLibraryItems } from "@hooks/api/queries/spotify/useSpotifyLibraryItems";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ModalBottombar } from "./components/ModalBottombar";
import { ModalToolbar } from "./components/ModalToolbar";
import { ModalTopbar } from "./components/ModalTopbar";
import { MasterTable } from "./components/MasterTable";
import { DetailPanel } from "./components/DetailPanel";
import { SpotifyConnectPrompt } from "./components/SpotifyConnectPrompt";
import { DEFAULT_IMPORT_CONFIG } from "./constants";
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

  const handleBulkSync = (enabled: boolean) => {
    const selected = sourceItems.filter((i) => draft.state.selectedIds.has(i.id));
    draft.setSyncForItems(selected, enabled);
  };

  const handleBulkImport = (enabled: boolean) => {
    const selected = sourceItems.filter((i) => draft.state.selectedIds.has(i.id));
    draft.setImportForItems(selected, enabled);
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

    await save.mutateAsync({
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
        {connected ? (
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
            />
            <div className={split()}>
              <MasterTable
                items={filteredItems}
                isLoading={items.isLoading}
                draft={draft}
                hiddenOnMobile={Boolean(focusedItem)}
              />
              <div className={detailPaneWrapper({ hiddenOnMobile: !focusedItem })}>
                <DetailPanel focusedItem={focusedItem} draft={draft} onBack={() => draft.setFocus(null)} />
              </div>
            </div>
            <ModalBottombar
              totalRows={totalRows}
              totalTracks={totalTracks}
              selectedCount={draft.state.selectedIds.size}
              draft={draft}
              onBulkSync={handleBulkSync}
              onBulkImport={handleBulkImport}
              onClearSelection={draft.clearSelection}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
              isSaving={save.isPending}
              hasChanges={hasChanges}
              autoWatch={draft.state.autoWatch}
              onWatchChange={draft.setWatch}
              onRefresh={() => void items.refetch()}
              isRefreshing={items.isFetching}
            />
          </div>
        ) : (
          <SpotifyConnectPrompt pending={status.data?.pending ?? false} statusLoading={status.isLoading} />
        )}
      </DialogContent>
    </Dialog>
  );
}
