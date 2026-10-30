"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import { useSaveBoardLayout } from "@hooks/api/mutations/board/useSaveBoardLayout";
import { useUndoBoardTemplate } from "@hooks/api/mutations/board/useUndoBoardTemplate";
import type { BoardItem, BoardSize, BoardTemplateApplied, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";
import { focusBoardTile } from "@hooks/ui/board/helpers";
import type { BoardFlip } from "@hooks/ui/board/types";
import { useBoardDrag } from "@hooks/ui/board/useBoardDrag";
import { useBoardFlip } from "@hooks/ui/board/useBoardFlip";

import { BOARD_SIZE_NAME_KEYS, BOARD_WIDGETS } from "../components/ExploreBoard/constants";
import {
  appendCustomWidget,
  appendWidget,
  layoutOf,
  moveItem,
  orderKeyOf,
  removeItem,
  resizeItem,
  sameSlot,
  tileNameOf,
  uniqueTileId,
} from "../components/ExploreBoard/helpers";
import type {
  BoardCustomWidgets,
  BoardEditor,
  BoardGalleryTarget,
  CustomWidgetsStatus,
  MoveDelta,
} from "../components/ExploreBoard/types";

export function useBoardEditor(
  items: BoardItem[],
  custom: BoardCustomWidgets,
  customStatus: CustomWidgetsStatus
): BoardEditor {
  const { t } = useTranslation(["discover", "widgets"]);
  const save = useSaveBoardLayout();
  const [editing, setEditing] = useState(false);
  const [galleryOpen, setGalleryOpenState] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<BoardGalleryTarget | null>(null);
  const [arrangeOpen, setArrangeOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const flipRef = useRef<BoardFlip | null>(null);

  const undoTemplate = useUndoBoardTemplate();
  const templateApplied = useCallback(
    (applied: BoardTemplateApplied) => {
      toast.success(t("widgets:board.templates.applied"), {
        duration: TOAST_ACTION_DURATION_MS,
        action: {
          label: t("widgets:board.templates.undo"),
          onClick: () =>
            undoTemplate.mutate(applied.undo, {
              onSuccess: () => toast.success(t("widgets:board.templates.undone")),
            }),
        },
      });
    },
    [t, undoTemplate]
  );

  const nameOf = useCallback((item: BoardItem) => tileNameOf(item, custom, customStatus), [custom, customStatus]);
  const commit = useCallback((next: BoardItem[]) => save(layoutOf(next)), [save]);
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

  const resize = useCallback(
    (id: string, size: BoardSize) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item || item.size === size) return;
      commit(resizeItem(items, id, size));
      setAnnouncement(t("board.announce.resized", { name: nameOf(item), size: t(BOARD_SIZE_NAME_KEYS[size]) }));
    },
    [commit, items, nameOf, t]
  );

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

  const add = useCallback(
    (widget: BoardWidgetKey) => {
      commit(appendWidget(items, widget, uniqueTileId(widget, items)));
      toast.success(t("board.toast.added", { name: t(BOARD_WIDGETS[widget].titleKey) }));
    },
    [commit, items, t]
  );

  const addCustom = useCallback(
    (widget: WidgetDocument) => {
      commit(appendCustomWidget(items, widget));
      toast.success(t("widgets:mine.added", { name: widget.meta.name }));
    },
    [commit, items, t]
  );

  const setGalleryOpen = useCallback((open: boolean) => {
    setGalleryOpenState(open);
    if (!open) setGalleryTarget(null);
  }, []);
  const startEditing = useCallback(() => setEditing(true), []);
  const stopEditing = useCallback(() => {
    setEditing(false);
    setGalleryOpen(false);
  }, [setGalleryOpen]);
  const openGallery = useCallback(() => {
    setEditing(true);
    setGalleryOpen(true);
  }, [setGalleryOpen]);
  const openTarget = useCallback(
    (target: BoardGalleryTarget) => {
      setGalleryTarget(target);
      setGalleryOpen(true);
    },
    [setGalleryOpen]
  );
  const customize = useCallback((widget: BoardWidgetKey) => openTarget({ kind: "builtin", widget }), [openTarget]);
  const edit = useCallback((widgetId: string) => openTarget({ kind: "custom", widgetId }), [openTarget]);

  const openArrange = useCallback(() => setArrangeOpen(true), []);
  const closeArrange = useCallback(() => setArrangeOpen(false), []);
  const saveArrangement = useCallback(
    (next: BoardItem[]) => {
      setArrangeOpen(false);
      commit(next);
      offerUndo(t("board.toast.moved"), items);
    },
    [commit, items, offerUndo, t]
  );

  useEffect(() => {
    if (!editing || galleryOpen || arrangeOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arrangeOpen, editing, galleryOpen]);

  const actions = useMemo(
    () => ({ move, resize, remove, startDrag: drag.startDrag, customize, edit }),
    [move, resize, remove, drag.startDrag, customize, edit]
  );

  return {
    rootRef: flip.ref,
    editing,
    galleryOpen,
    arrangeOpen,
    announcement,
    displayItems,
    draggingId: drag.draggingId,
    startEditing,
    stopEditing,
    openGallery,
    setGalleryOpen,
    openArrange,
    closeArrange,
    saveArrangement,
    galleryTarget,
    add,
    addCustom,
    templateApplied,
    actions,
  };
}
