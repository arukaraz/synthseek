"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { BOARD_TILE_SELECTOR } from "./constants";
import {
  autoscrollDelta,
  createGhost,
  insertsBefore,
  placeGhost,
  reorderAround,
  sameOrder,
  scrollParentOf,
  tileUnderPointer,
  viewportOf,
} from "./helpers";
import type { BoardDragItem, BoardDragState, PointerPoint, UseBoardDragOptions } from "./types";

export function useBoardDrag<T extends BoardDragItem>({ items, onDrop }: UseBoardDragOptions<T>): BoardDragState<T> {
  const [order, setOrder] = useState<T[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const startDrag = useCallback((event: ReactPointerEvent<HTMLElement>, id: string) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const handle = event.currentTarget;
    const tile = handle.closest(BOARD_TILE_SELECTOR);
    if (!(tile instanceof HTMLElement)) return;
    const ghost = createGhost(tile);
    if (!ghost) return;
    event.preventDefault();
    cancelRef.current?.();

    const start = [...itemsRef.current];
    let current = start;
    const tileRect = tile.getBoundingClientRect();
    const offset = { x: event.clientX - tileRect.left, y: event.clientY - tileRect.top };
    const scroller = scrollParentOf(tile);
    const pointerId = event.pointerId;
    let last: PointerPoint = { x: event.clientX, y: event.clientY };
    let frame = 0;

    placeGhost(ghost, last, offset);
    handle.setPointerCapture(pointerId);
    setDraggingId(id);
    setOrder(start);

    const tick = () => {
      frame = 0;
      placeGhost(ghost, last, offset);
      const delta = autoscrollDelta(last.y, viewportOf(scroller));
      if (delta !== 0) {
        const before = scroller.scrollTop;
        scroller.scrollTop += delta;
        if (scroller.scrollTop !== before) frame = requestAnimationFrame(tick);
      }
      const target = tileUnderPointer(last, id);
      const targetId = target?.dataset.boardTile;
      if (!target || !targetId) return;
      const before = insertsBefore(target.getBoundingClientRect(), last, tile.getBoundingClientRect());
      const next = reorderAround(current, id, targetId, before);
      if (sameOrder(next, current)) return;
      current = next;
      setOrder(next);
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      last = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      if (frame) cancelAnimationFrame(frame);
      ghost.remove();
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      cancelRef.current = null;
      if (commit && !sameOrder(current, start)) onDropRef.current(current);
      setOrder(null);
      setDraggingId(null);
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
