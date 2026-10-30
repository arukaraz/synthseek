"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { REDUCED_MOTION_QUERY } from "../constants";
import { useMediaQuery } from "../useMediaQuery";
import { BOARD_TILE_SELECTOR, DRAG_DWELL_MS, DRAG_REORDER_TRAVEL_PX } from "./constants";
import {
  autoscrollDelta,
  clipParentOf,
  createGhost,
  insertsBefore,
  landGhost,
  liftGhost,
  moveToNewRow,
  openSpaceTarget,
  placeGhost,
  reorderAround,
  sameOrder,
  sameTarget,
  scrollParentOf,
  swapItems,
  tileBoxes,
  tileUnderPointer,
  travelled,
  viewportOf,
} from "./helpers";
import type { BoardDragItem, BoardDragState, DropTarget, PointerPoint, UseBoardDragOptions } from "./types";

function dropInto<T extends BoardDragItem>(
  items: readonly T[],
  id: string,
  intent: DropTarget,
  sameSlot: UseBoardDragOptions<T>["sameSlot"]
): T[] {
  if (intent.kind === "newRow") return moveToNewRow(items, id);
  const dragged = items.find((item) => item.id === id);
  const over = items.find((item) => item.id === intent.id);
  const swap =
    intent.kind === "tile" && dragged !== undefined && over !== undefined && sameSlot?.(dragged, over) === true;
  return swap ? swapItems(items, id, intent.id) : reorderAround(items, id, intent.id, intent.before);
}

export function useBoardDrag<T extends BoardDragItem>(options: UseBoardDragOptions<T>): BoardDragState<T> {
  const [order, setOrder] = useState<T[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const stillnessRef = useRef(false);
  stillnessRef.current = useMediaQuery(REDUCED_MOTION_QUERY);
  const cancelRef = useRef<(() => void) | null>(null);
  const landedRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      cancelRef.current?.();
      landedRef.current?.();
    },
    []
  );

  const startDrag = useCallback((event: ReactPointerEvent<HTMLElement>, id: string) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const handle = event.currentTarget;
    const tile = handle.closest(BOARD_TILE_SELECTOR);
    if (!(tile instanceof HTMLElement)) return;
    const ghost = createGhost(tile);
    if (!ghost) return;
    event.preventDefault();
    cancelRef.current?.();
    landedRef.current?.();

    const start = [...optionsRef.current.items];
    let current = start;
    const tileRect = tile.getBoundingClientRect();
    const offset = { x: event.clientX - tileRect.left, y: event.clientY - tileRect.top };
    const scroller = scrollParentOf(tile);
    const pointerId = event.pointerId;
    let last: PointerPoint = { x: event.clientX, y: event.clientY };
    let settledAt: PointerPoint = last;
    let lastTarget: DropTarget | null = null;
    let pending: DropTarget | null = null;
    let pendingSince = 0;
    let frame = 0;

    placeGhost(ghost, last, offset);
    if (!stillnessRef.current) liftGhost(ghost);
    handle.setPointerCapture(pointerId);
    setDraggingId(id);
    setOrder(start);

    const nextFrame = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const tick = () => {
      frame = 0;
      placeGhost(ghost, last, offset);
      const delta = autoscrollDelta(last.y, viewportOf(scroller));
      if (delta !== 0) {
        const before = scroller.scrollTop;
        scroller.scrollTop += delta;
        if (scroller.scrollTop !== before) nextFrame();
      }
      if (optionsRef.current.settling?.()) {
        if (pending) nextFrame();
        return;
      }
      if (travelled(settledAt, last) < DRAG_REORDER_TRAVEL_PX) return;
      const grid = tile.parentElement;
      if (!grid) return;
      const target = tileUnderPointer(last, id, grid);
      const targetId = target?.dataset.boardTile;
      const intent: DropTarget | null =
        target && targetId
          ? {
              kind: "tile",
              id: targetId,
              before: insertsBefore(target.getBoundingClientRect(), last, tile.getBoundingClientRect()),
            }
          : openSpaceTarget(last, {
              tiles: tileBoxes(
                grid,
                current.filter((item) => item.id !== id).map((item) => item.id)
              ),
              grid: grid.getBoundingClientRect(),
              viewport: viewportOf(clipParentOf(tile)),
              placeholder: tile.getBoundingClientRect(),
            });
      if (!intent || sameTarget(lastTarget, intent)) {
        pending = null;
        return;
      }
      if (!sameTarget(pending, intent)) {
        pending = intent;
        pendingSince = performance.now();
      }
      if (performance.now() - pendingSince < DRAG_DWELL_MS) {
        nextFrame();
        return;
      }
      pending = null;
      lastTarget = intent;
      const next = dropInto(current, id, intent, optionsRef.current.sameSlot);
      if (sameOrder(next, current)) return;
      current = next;
      settledAt = last;
      setOrder(next);
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      last = { x: moveEvent.clientX, y: moveEvent.clientY };
      nextFrame();
    };

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      if (frame) cancelAnimationFrame(frame);
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      cancelRef.current = null;
      if (commit && !sameOrder(current, start)) optionsRef.current.onDrop(current);
      else setOrder(null);

      const landed = () => {
        if (landedRef.current !== landed) return;
        landedRef.current = null;
        ghost.remove();
        setOrder(null);
        setDraggingId(null);
      };
      landedRef.current = landed;
      if (stillnessRef.current) {
        landed();
        return;
      }
      requestAnimationFrame(() => {
        if (landedRef.current !== landed) return;
        if (!tile.isConnected) {
          landed();
          return;
        }
        void landGhost(ghost, tile.getBoundingClientRect()).finished.then(landed, landed);
      });
    };

    const onUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId === pointerId) finish(true);
    };
    const onCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId === pointerId) finish(false);
    };
    const onKey = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== "Escape") return;
      keyEvent.preventDefault();
      keyEvent.stopImmediatePropagation();
      finish(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    cancelRef.current = () => finish(false);
  }, []);

  return { order, draggingId, startDrag };
}
