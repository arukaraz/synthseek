"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import { useSaveBoardLayout } from "@hooks/api/mutations/board/useSaveBoardLayout";
import type { BoardItem, BoardLayout, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";
import { focusBoardTile } from "@hooks/ui/board/helpers";
import type { BoardFlip } from "@hooks/ui/board/types";
import { useBoardDrag } from "@hooks/ui/board/useBoardDrag";
import { useBoardFlip } from "@hooks/ui/board/useBoardFlip";

import { BOARD_SIZE_NAME_KEYS, BOARD_WIDGETS } from "../components/ExploreBoard/constants";
import {
  appendWidget,
  layoutOf,
  moveItem,
  orderKeyOf,
  removeItem,
  resizeItem,
  sameSlot,
  uniqueTileId,
} from "../components/ExploreBoard/helpers";
import type { BoardEditor, MoveDelta } from "../components/ExploreBoard/types";

export function useBoardEditor(items: BoardItem[], stored: BoardLayout | null | undefined): BoardEditor {
  const { t } = useTranslation("discover");
  const save = useSaveBoardLayout();
  const [editing, setEditing] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const flipRef = useRef<BoardFlip | null>(null);

  const nameOf = useCallback((widget: BoardWidgetKey) => t(BOARD_WIDGETS[widget].titleKey), [t]);
  const commit = useCallback((next: BoardItem[]) => save(layoutOf(next, stored)), [save, stored]);
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
  const drag = useBoardDrag({ items, onDrop: drop, sameSlot, settling });
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
      setAnnouncement(
        t("board.announce.moved", { name: nameOf(item.widget), position: target + 1, total: items.length })
      );
      focusBoardTile(id);
    },
    [commit, items, nameOf, t]
  );

  const resize = useCallback(
    (id: string, size: BoardSize) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item || item.size === size) return;
      commit(resizeItem(items, id, size));
      setAnnouncement(t("board.announce.resized", { name: nameOf(item.widget), size: t(BOARD_SIZE_NAME_KEYS[size]) }));
    },
    [commit, items, nameOf, t]
  );

  const remove = useCallback(
    (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;
      const name = nameOf(item.widget);
      commit(removeItem(items, id));
      setAnnouncement(t("board.announce.removed", { name }));
      offerUndo(t("board.toast.removed", { name }), items);
    },
    [commit, items, nameOf, offerUndo, t]
  );

  const add = useCallback(
    (widget: BoardWidgetKey) => {
      commit(appendWidget(items, widget, uniqueTileId(widget, items)));
      toast.success(t("board.toast.added", { name: nameOf(widget) }));
    },
    [commit, items, nameOf, t]
  );

  const startEditing = useCallback(() => setEditing(true), []);
  const stopEditing = useCallback(() => {
    setEditing(false);
    setGalleryOpen(false);
  }, []);
  const openGallery = useCallback(() => {
    setEditing(true);
    setGalleryOpen(true);
  }, []);

  useEffect(() => {
    if (!editing || galleryOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, galleryOpen]);

  const actions = useMemo(
    () => ({ move, resize, remove, startDrag: drag.startDrag }),
    [move, resize, remove, drag.startDrag]
  );

  return {
    rootRef: flip.ref,
    editing,
    galleryOpen,
    announcement,
    displayItems,
    draggingId: drag.draggingId,
    startEditing,
    stopEditing,
    openGallery,
    setGalleryOpen,
    add,
    actions,
  };
}
