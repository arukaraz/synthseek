"use client";

import { useCallback, useMemo, useState } from "react";

import type { AutoWatchState, LibraryItem } from "../types";

interface DraftState {
  selectedIds: Set<string>;
  focusedId: string | null;
  importOverrides: Map<string, boolean>;
  syncOverrides: Map<string, boolean>;
  autoWatch: AutoWatchState;
}

function emptyDraft(): DraftState {
  return {
    selectedIds: new Set(),
    focusedId: null,
    importOverrides: new Map(),
    syncOverrides: new Map(),
    autoWatch: { playlists: false, savedAlbums: false },
  };
}

export function useLibraryDraftState(initialAutoWatch?: AutoWatchState) {
  const [state, setState] = useState<DraftState>(() => ({
    ...emptyDraft(),
    autoWatch: initialAutoWatch ?? emptyDraft().autoWatch,
  }));

  const isSelected = useCallback((id: string) => state.selectedIds.has(id), [state.selectedIds]);

  const targetImported = useCallback(
    (item: LibraryItem) => state.importOverrides.get(item.id) ?? item.imported,
    [state.importOverrides]
  );

  const targetSyncEnabled = useCallback(
    (item: LibraryItem) => state.syncOverrides.get(item.id) ?? item.syncEnabled,
    [state.syncOverrides]
  );

  const toggleSelect = useCallback((id: string) => {
    setState((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...s, selectedIds: next };
    });
  }, []);

  const setFocus = useCallback((id: string | null) => {
    setState((s) => ({ ...s, focusedId: id }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((s) => ({ ...s, selectedIds: new Set() }));
  }, []);

  const toggleImport = useCallback((item: LibraryItem) => {
    setState((s) => {
      const next = new Map(s.importOverrides);
      const current = next.get(item.id) ?? item.imported;
      next.set(item.id, !current);
      return { ...s, importOverrides: next };
    });
  }, []);

  const toggleSync = useCallback((item: LibraryItem) => {
    setState((s) => {
      const next = new Map(s.syncOverrides);
      const current = next.get(item.id) ?? item.syncEnabled;
      next.set(item.id, !current);
      return { ...s, syncOverrides: next };
    });
  }, []);

  const setSyncForItems = useCallback((items: LibraryItem[], value: boolean) => {
    setState((s) => {
      const next = new Map(s.syncOverrides);
      for (const item of items) next.set(item.id, value);
      return { ...s, syncOverrides: next };
    });
  }, []);

  const setImportForItems = useCallback((items: LibraryItem[], value: boolean) => {
    setState((s) => {
      const next = new Map(s.importOverrides);
      for (const item of items) next.set(item.id, value);
      return { ...s, importOverrides: next };
    });
  }, []);

  const setWatch = useCallback((next: Partial<AutoWatchState>) => {
    setState((s) => ({ ...s, autoWatch: { ...s.autoWatch, ...next } }));
  }, []);

  const reset = useCallback((nextWatch?: AutoWatchState) => {
    setState({
      ...emptyDraft(),
      autoWatch: nextWatch ?? { playlists: false, savedAlbums: false },
    });
  }, []);

  const selectors = useMemo(
    () => ({ isSelected, targetImported, targetSyncEnabled }),
    [isSelected, targetImported, targetSyncEnabled]
  );

  return {
    state,
    selectors,
    toggleSelect,
    setFocus,
    clearSelection,
    toggleImport,
    toggleSync,
    setSyncForItems,
    setImportForItems,
    setWatch,
    reset,
  };
}

export type LibraryDraft = ReturnType<typeof useLibraryDraftState>;
