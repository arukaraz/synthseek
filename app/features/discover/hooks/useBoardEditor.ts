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

import { BOARD_SIZE_NAME_KEYS, BOARD_WIDGETS, SPACER_ID } from "../components/ExploreBoard/constants";
import {
  appendCustomWidget,
  appendSpacer,
  appendWidget,
  layoutOf,
  moveItem,
  moveItemToEdge,
  orderKeyOf,
  removeItem,
  resizeItem,
  resizeSpacer,
  sameSlot,
  tileHasBackground,
  tileNameOf,
  toggleBackground,
  uniqueTileId,
  withBackgrounds,
} from "../components/ExploreBoard/helpers";
import type {
  BoardCustomWidgets,
  BoardEdge,
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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [arrangeWidth, setArrangeWidth] = useState<number | null>(null);
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
      commit(resizeItem(items, id, size));
      setAnnouncement(t("board.announce.resized", { name: nameOf(item), size: t(BOARD_SIZE_NAME_KEYS[size]) }));
    },
    [commit, items, nameOf, t]
  );

  const resizeSpacerTile = useCallback(
    (id: string, delta: MoveDelta) => commit(resizeSpacer(items, id, delta)),
    [commit, items]
  );

  const toggleTileBackground = useCallback((id: string) => commit(toggleBackground(items, id)), [commit, items]);

  const setBackgrounds = useCallback(
    (shown: boolean) => {
      if (items.every((item) => tileHasBackground(item) === shown)) return;
      commit(withBackgrounds(items, shown));
      offerUndo(t(shown ? "board.toast.backgroundsOn" : "board.toast.backgroundsOff"), items);
    },
    [commit, items, offerUndo, t]
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

  const addSpacer = useCallback(() => {
    commit(appendSpacer(items, uniqueTileId(SPACER_ID, items)));
    toast.success(t("board.toast.added", { name: t("board.spacer.name") }));
  }, [commit, items, t]);

  const setGalleryOpen = useCallback((open: boolean) => {
    setGalleryOpenState(open);
    if (!open) setGalleryTarget(null);
  }, []);
  const startEditing = useCallback(() => setEditing(true), []);
  const stopEditing = useCallback(() => {
    setEditing(false);
    setGalleryOpen(false);
    setTemplatesOpen(false);
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

  const openArrange = useCallback(() => setArrangeWidth(flip.ref.current?.clientWidth ?? 0), [flip.ref]);
  const closeArrange = useCallback(() => setArrangeWidth(null), []);
  const openTemplates = useCallback(() => {
    setEditing(true);
    setTemplatesOpen(true);
  }, []);
  const closeTemplates = useCallback(() => setTemplatesOpen(false), []);
  const saveArrangement = useCallback(
    (next: BoardItem[]) => {
      setArrangeWidth(null);
      commit(next);
      offerUndo(t("board.toast.moved"), items);
    },
    [commit, items, offerUndo, t]
  );

  useEffect(() => {
    if (!editing || galleryOpen || templatesOpen || arrangeWidth !== null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arrangeWidth, editing, galleryOpen, templatesOpen]);

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
    galleryOpen,
    templatesOpen,
    arrangeWidth,
    announcement,
    displayItems,
    draggingId: drag.draggingId,
    startEditing,
    stopEditing,
    openGallery,
    setGalleryOpen,
    openArrange,
    closeArrange,
    openTemplates,
    closeTemplates,
    saveArrangement,
    galleryTarget,
    add,
    addCustom,
    addSpacer,
    setBackgrounds,
    templateApplied,
    actions,
  };
}
