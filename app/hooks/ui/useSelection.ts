"use client";

import { useCallback, useMemo, useState } from "react";

interface Identifiable {
  id: string;
}

export function useSelection<TItem extends Identifiable>() {
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
      filterSelected: (items: TItem[], predicate: (item: TItem) => boolean) =>
        items.filter((item) => selectedIds.has(item.id) && predicate(item)).map((item) => item.id),
      allSelectedOnPage: (items: TItem[]) => items.length > 0 && items.every((item) => selectedIds.has(item.id)),
      someSelectedOnPage: (items: TItem[]) => items.some((item) => selectedIds.has(item.id)),
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

export type Selection<TItem extends Identifiable> = ReturnType<typeof useSelection<TItem>>;
