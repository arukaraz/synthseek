import type { PointerEvent as ReactPointerEvent } from "react";

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
}

export interface BoardDragState<T extends BoardDragItem> {
  order: T[] | null;
  draggingId: string | null;
  startDrag: (event: ReactPointerEvent<HTMLElement>, id: string) => void;
}
