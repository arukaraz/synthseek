"use client";

import { RequestStatus } from "@api/__generated__/types";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { useCallback, useMemo, useState } from "react";

export function useLibrarySelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setMany = useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const selectors = useMemo(
    () => ({
      selectedFailedIds: (items: LibraryTrackItem[]) =>
        items.filter((item) => selectedIds.has(item.id) && item.status === RequestStatus.enum.failed).map((i) => i.id),
      allSelectedOnPage: (items: LibraryTrackItem[]) =>
        items.length > 0 && items.every((item) => selectedIds.has(item.id)),
      someSelectedOnPage: (items: LibraryTrackItem[]) => items.some((item) => selectedIds.has(item.id)),
    }),
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggle,
    setMany,
    clear,
    selectors,
  };
}

export type LibrarySelection = ReturnType<typeof useLibrarySelection>;
