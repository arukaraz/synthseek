"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import { useSaveBoardLayout } from "@hooks/api/mutations/board/useSaveBoardLayout";
import type { BoardItem, BoardList, BoardLists, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";
import { focusBoardTile } from "@hooks/ui/board/helpers";
import type { BoardFlip } from "@hooks/ui/board/types";
import { useBoardDrag } from "@hooks/ui/board/useBoardDrag";
import { useBoardFlip } from "@hooks/ui/board/useBoardFlip";

import { BOARD_SIZE_NAME_KEYS, SPACER_ID } from "../components/ExploreBoard/constants";
import {
  appendSpacer,
  layoutOf,
  moveItem,
  moveItemToEdge,
  orderKeyOf,
  removeItem,
  resizeItem,
  resizeSpacer,
  sameSlot,
  tileNameOf,
  toggleBackground,
  uniqueTileId,
  withList,
} from "../components/ExploreBoard/helpers";
import type {
  BoardCustomWidgets,
  BoardEdge,
  BoardEditor,
  BoardGalleryTarget,
  BoardSave,
  CustomWidgetsStatus,
  MoveDelta,
  WidgetsDialogOpening,
} from "../components/ExploreBoard/types";
import { useBoardSave } from "./useBoardSave";

export function useBoardEditor(
  lists: BoardLists,
  list: BoardList,
  custom: BoardCustomWidgets,
  customStatus: CustomWidgetsStatus
): BoardEditor {
  const { t } = useTranslation(["discover", "widgets"]);
  const save = useSaveBoardLayout();
  const board = useBoardSave(lists);
  const [editing, setEditing] = useState(false);
  const [widgets, setWidgets] = useState<WidgetsDialogOpening | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const flipRef = useRef<BoardFlip | null>(null);
  const items = lists[list];

  const nameOf = useCallback((item: BoardItem) => tileNameOf(item, custom, customStatus), [custom, customStatus]);
  const commit = useCallback((next: BoardItem[]) => save(layoutOf(withList(lists, list, next))), [save, lists, list]);
  const offerUndo = useCallback(
    (message: string, previous: BoardItem[]) => {
      toast.success(message, {
        duration: TOAST_ACTION_DURATION_MS,
        action: { label: t("board.toast.undo"), onClick: () => commit(previous) },
      });
    },
    [commit, t]
  );

  const drop = useCallback(
    (order: BoardItem[]) => {
      commit(order);
      offerUndo(t("board.toast.moved"), items);
    },
    [commit, offerUndo, items, t]
  );
  const settling = useCallback(() => flipRef.current?.settling() ?? false, []);
  const sameSlotOn = useCallback((a: BoardItem, b: BoardItem) => sameSlot(a, b, custom), [custom]);
  const drag = useBoardDrag({ items, onDrop: drop, sameSlot: sameSlotOn, settling });
  const displayItems = drag.order ?? items;
  const flip = useBoardFlip({ orderKey: orderKeyOf(displayItems), skipId: drag.draggingId });
  flipRef.current = flip;

  const move = useCallback(
    (id: string, delta: MoveDelta) => {
      const from = items.findIndex((item) => item.id === id);
      const target = from + delta;
      const item = items[from];
      if (!item || target < 0 || target >= items.length) return;
      commit(moveItem(items, id, target));
      setAnnouncement(t("board.announce.moved", { name: nameOf(item), position: target + 1, total: items.length }));
      focusBoardTile(id);
    },
    [commit, items, nameOf, t]
  );

  const moveToEdge = useCallback(
    (id: string, edge: BoardEdge) => {
      const from = items.findIndex((item) => item.id === id);
      const target = edge === "top" ? 0 : items.length - 1;
      const item = items[from];
      if (!item || target === from) return;
      commit(moveItemToEdge(items, id, edge));
      setAnnouncement(t("board.announce.moved", { name: nameOf(item), position: target + 1, total: items.length }));
      focusBoardTile(id);
    },
    [commit, items, nameOf, t]
  );

  const resize = useCallback(
    (id: string, size: BoardSize) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item || item.size === size) return;
      commit(resizeItem(items, id, size, custom));
      setAnnouncement(t("board.announce.resized", { name: nameOf(item), size: t(BOARD_SIZE_NAME_KEYS[size]) }));
    },
    [commit, custom, items, nameOf, t]
  );

  const resizeSpacerTile = useCallback(
    (id: string, delta: MoveDelta) => commit(resizeSpacer(items, id, delta)),
    [commit, items]
  );

  const toggleTileBackground = useCallback((id: string) => commit(toggleBackground(items, id)), [commit, items]);

  const remove = useCallback(
    (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;
      const name = nameOf(item);
      commit(removeItem(items, id));
      setAnnouncement(t("board.announce.removed", { name }));
      offerUndo(t("board.toast.removed", { name }), items);
    },
    [commit, items, nameOf, offerUndo, t]
  );

  const addSpacer = useCallback(() => {
    commit(appendSpacer(items, uniqueTileId(SPACER_ID, items)));
    toast.success(t("board.toast.added", { name: t("board.spacer.name") }));
  }, [commit, items, t]);

  const open = useCallback((target: BoardGalleryTarget | null) => {
    setEditing(true);
    setWidgets({ target });
  }, []);
  const openWidgets = useCallback(() => open(null), [open]);
  const closeWidgets = useCallback(() => setWidgets(null), []);
  const startEditing = useCallback(() => setEditing(true), []);
  const stopEditing = useCallback(() => {
    setEditing(false);
    setWidgets(null);
  }, []);
  const customize = useCallback((widget: BoardWidgetKey) => open({ kind: "builtin", widget }), [open]);
  const edit = useCallback((widgetId: string) => open({ kind: "custom", widgetId }), [open]);

  const saveBoard = useCallback(
    (changes: BoardSave) => {
      setWidgets(null);
      void board.saveChanges(changes);
    },
    [board]
  );

  useEffect(() => {
    if (!editing || widgets !== null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, widgets]);

  const actions = useMemo(
    () => ({
      move,
      moveToEdge,
      resize,
      resizeSpacer: resizeSpacerTile,
      toggleBackground: toggleTileBackground,
      remove,
      startDrag: drag.startDrag,
      customize,
      edit,
    }),
    [move, moveToEdge, resize, resizeSpacerTile, toggleTileBackground, remove, drag.startDrag, customize, edit]
  );

  return {
    rootRef: flip.ref,
    editing,
    widgets,
    announcement,
    displayItems,
    draggingId: drag.draggingId,
    startEditing,
    stopEditing,
    openWidgets,
    closeWidgets,
    saveBoard,
    addSpacer,
    actions,
  };
}
