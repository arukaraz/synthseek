import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

export interface BoardDragItem {
  id: string;
}

export interface PointerPoint {
  x: number;
  y: number;
}

export interface BoxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ScrollViewport {
  top: number;
  bottom: number;
}

export interface UseBoardDragOptions<T extends BoardDragItem> {
  items: readonly T[];
  onDrop: (order: T[]) => void;
  sameSlot?: (dragged: T, target: T) => boolean;
  settling?: () => boolean;
}

export interface DropTarget {
  id: string;
  before: boolean;
}

export interface SlideResult {
  rects: Map<HTMLElement, DOMRect>;
  slidUntil: number;
}

export interface UseBoardFlipOptions {
  orderKey: string;
  skipId: string | null;
}

export interface BoardFlip {
  ref: RefObject<HTMLElement | null>;
  settling: () => boolean;
}

export interface BoardDragState<T extends BoardDragItem> {
  order: T[] | null;
  draggingId: string | null;
  startDrag: (event: ReactPointerEvent<HTMLElement>, id: string) => void;
}
