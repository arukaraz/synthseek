"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { BoardItem, BoardSize } from "@hooks/api/queries/board/types";
import { focusBoardTile } from "@hooks/ui/board/helpers";
import type { BoardFlip } from "@hooks/ui/board/types";
import { useBoardDrag } from "@hooks/ui/board/useBoardDrag";
import { useBoardFlip } from "@hooks/ui/board/useBoardFlip";

import type { UseBoardArrangeOptions } from "../components/BoardArrange/types";
import {
  moveItem,
  moveItemToEdge,
  orderKeyOf,
  removeItem,
  resizeItem,
  resizeSpacer,
  sameSlot,
  toggleBackground,
} from "../components/ExploreBoard/helpers";
import type { BoardEdge, MoveDelta } from "../components/ExploreBoard/types";

export function useBoardArrange({ items, custom }: UseBoardArrangeOptions) {
  const [draft, setDraft] = useState<BoardItem[]>(() => [...items]);
  const flipRef = useRef<BoardFlip | null>(null);

  const settling = useCallback(() => flipRef.current?.settling() ?? false, []);
  const sameSlotOn = useCallback((a: BoardItem, b: BoardItem) => sameSlot(a, b, custom), [custom]);
  const drag = useBoardDrag({ items: draft, onDrop: setDraft, sameSlot: sameSlotOn, settling });
  const displayItems = drag.order ?? draft;
  const flip = useBoardFlip({ orderKey: orderKeyOf(displayItems), skipId: drag.draggingId });
  flipRef.current = flip;

  const move = useCallback(
    (id: string, delta: MoveDelta) => {
      setDraft((current) => moveItem(current, id, current.findIndex((item) => item.id === id) + delta));
      focusBoardTile(id, flip.ref.current ?? document);
    },
    [flip.ref]
  );
  const moveToEdge = useCallback(
    (id: string, edge: BoardEdge) => {
      setDraft((current) => moveItemToEdge(current, id, edge));
      focusBoardTile(id, flip.ref.current ?? document);
    },
    [flip.ref]
  );
  const resize = useCallback((id: string, size: BoardSize) => setDraft((current) => resizeItem(current, id, size)), []);
  const resizeSpacerTile = useCallback(
    (id: string, delta: MoveDelta) => setDraft((current) => resizeSpacer(current, id, delta)),
    []
  );
  const toggleTileBackground = useCallback((id: string) => setDraft((current) => toggleBackground(current, id)), []);
  const remove = useCallback((id: string) => setDraft((current) => removeItem(current, id)), []);

  const actions = useMemo(
    () => ({
      move,
      moveToEdge,
      resize,
      resizeSpacer: resizeSpacerTile,
      toggleBackground: toggleTileBackground,
      remove,
      startDrag: drag.startDrag,
    }),
    [move, moveToEdge, resize, resizeSpacerTile, toggleTileBackground, remove, drag.startDrag]
  );

  return {
    rootRef: flip.ref,
    draft,
    displayItems,
    draggingId: drag.draggingId,
    dirty: orderKeyOf(draft) !== orderKeyOf(items),
    actions,
  };
}
