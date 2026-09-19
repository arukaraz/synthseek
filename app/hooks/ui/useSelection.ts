"use client";

import { useCallback, useMemo, useState } from "react";

interface Identifiable {
  id: string;
}

interface SelectionAnchor {
  id: string;
  selected: boolean;
}

interface SelectionState {
  ids: Set<string>;
  anchor: SelectionAnchor | null;
}

export interface SelectionRange {
  ids: string[];
  selected: boolean;
}

function toggledState(ids: Set<string>, id: string): SelectionState {
  const next = new Set(ids);
  const selected = !next.has(id);
  if (selected) next.add(id);
  else next.delete(id);
  return { ids: next, anchor: { id, selected } };
}

function rangeBetween(anchor: SelectionAnchor | null, orderedIds: string[], id: string): SelectionRange | null {
  if (!anchor) return null;
  const from = orderedIds.indexOf(anchor.id);
  const to = orderedIds.indexOf(id);
  if (from === -1 || to === -1) return null;
  return {
    ids: orderedIds.slice(Math.min(from, to), Math.max(from, to) + 1),
    selected: anchor.selected,
  };
}

export function useSelection<TItem extends Identifiable>() {
  const [state, setState] = useState<SelectionState>(() => ({ ids: new Set<string>(), anchor: null }));
  const { ids: selectedIds, anchor } = state;

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggle = useCallback((id: string) => {
    setState((current) => toggledState(current.ids, id));
  }, []);

  const extendTo = useCallback((orderedIds: string[], id: string) => {
    setState((current) => {
      const range = rangeBetween(current.anchor, orderedIds, id);
      if (!range) return toggledState(current.ids, id);
      const ids = new Set(current.ids);
      for (const rangeId of range.ids) {
        if (range.selected) ids.add(rangeId);
        else ids.delete(rangeId);
      }
      return { ids, anchor: current.anchor };
    });
  }, []);

  const rangeTo = useCallback((orderedIds: string[], id: string) => rangeBetween(anchor, orderedIds, id), [anchor]);

  const setMany = useCallback((ids: string[], selected: boolean) => {
    setState((current) => {
      const next = new Set(current.ids);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return { ids: next, anchor: current.anchor };
    });
  }, []);

  const clear = useCallback(() => setState({ ids: new Set(), anchor: null }), []);

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
    extendTo,
    rangeTo,
    setMany,
    clear,
    selectors,
  };
}

export type Selection<TItem extends Identifiable> = ReturnType<typeof useSelection<TItem>>;
