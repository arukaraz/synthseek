import type { MouseEvent } from "react";

import { BOARD_COLUMNS, type BoardDevice, FAMILY_SPANS } from "@components/BoardGrid";
import type { BoardItem, BoardLayout, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";

import { BOARD_SCHEMA_VERSION, BOARD_WIDGETS, DEFAULT_BOARD, EDIT_PASSTHROUGH_SELECTOR } from "./constants";
import type { BoardKeyAction, MoveDelta, PlacedTile } from "./types";

export function blockWidgetAction(event: Pick<MouseEvent, "target" | "preventDefault" | "stopPropagation">): void {
  if (event.target instanceof Element && event.target.closest(EDIT_PASSTHROUGH_SELECTOR)) return;
  event.preventDefault();
  event.stopPropagation();
}

export function boardKeyAction(event: Pick<KeyboardEvent, "key" | "shiftKey">): BoardKeyAction | null {
  if (event.key === "Delete" || event.key === "Backspace") return { kind: "remove" };
  const delta: MoveDelta | null =
    event.key === "ArrowLeft" || event.key === "ArrowUp"
      ? -1
      : event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : null;
  if (delta === null) return null;
  return event.shiftKey ? { kind: "resize", delta } : { kind: "move", delta };
}

export function cycleSize(sizes: readonly BoardSize[], current: BoardSize, delta: MoveDelta): BoardSize {
  const index = sizes.indexOf(current);
  const next = (index + delta + sizes.length) % sizes.length;
  return sizes[next] ?? current;
}

export function uniqueTileId(widget: BoardWidgetKey, items: readonly BoardItem[]): string {
  const taken = new Set(items.map((item) => item.id));
  if (!taken.has(widget)) return widget;
  let suffix = 2;
  while (taken.has(`${widget}-${suffix}`)) suffix++;
  return `${widget}-${suffix}`;
}

export function boardItemsOf(layout: BoardLayout | null | undefined): BoardItem[] {
  if (!layout) return DEFAULT_BOARD.map((item) => ({ ...item }));
  return layout.items.map((item) => {
    const definition = BOARD_WIDGETS[item.widget];
    return definition.sizes.includes(item.size) ? item : { ...item, size: definition.defaultSize };
  });
}

export function layoutOf(items: readonly BoardItem[]): BoardLayout {
  return { schemaVersion: BOARD_SCHEMA_VERSION, items: items.map((item) => ({ ...item })) };
}

export function displayedSize(item: BoardItem, device: BoardDevice): BoardSize {
  if (device === "wide") return item.size;
  return BOARD_WIDGETS[item.widget].narrowSizes?.[item.size] ?? item.size;
}

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function fits(occupied: Set<string>, row: number, col: number, cols: number, rows: number): boolean {
  for (let r = row; r < row + rows; r++) {
    for (let c = col; c < col + cols; c++) {
      if (occupied.has(cellKey(r, c))) return false;
    }
  }
  return true;
}

export function packBoard(items: readonly BoardItem[], device: BoardDevice): PlacedTile[] {
  const columns = BOARD_COLUMNS[device];
  const occupied = new Set<string>();
  const placed: PlacedTile[] = [];
  let row = 0;
  let col = 0;

  for (const item of items) {
    const size = displayedSize(item, device);
    const span = FAMILY_SPANS[device][size];
    const cols = Math.min(span.cols, columns);
    let found = false;
    while (!found) {
      for (; col <= columns - cols; col++) {
        if (fits(occupied, row, col, cols, span.rows)) {
          found = true;
          break;
        }
      }
      if (!found) {
        row++;
        col = 0;
      }
    }
    for (let r = row; r < row + span.rows; r++) {
      for (let c = col; c < col + cols; c++) occupied.add(cellKey(r, c));
    }
    placed.push({ item, size, col, row, cols, rows: span.rows });
  }

  return placed;
}

export function placementsById(tiles: readonly PlacedTile[]): Map<string, PlacedTile> {
  return new Map(tiles.map((tile) => [tile.item.id, tile]));
}

export function moveItem(items: readonly BoardItem[], id: string, toIndex: number): BoardItem[] {
  const from = items.findIndex((item) => item.id === id);
  if (from === -1) return [...items];
  const target = Math.max(0, Math.min(items.length - 1, toIndex));
  if (target === from) return [...items];
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

export function resizeItem(items: readonly BoardItem[], id: string, size: BoardSize): BoardItem[] {
  return items.map((item) =>
    item.id === id && BOARD_WIDGETS[item.widget].sizes.includes(size) ? { ...item, size } : item
  );
}

export function removeItem(items: readonly BoardItem[], id: string): BoardItem[] {
  return items.filter((item) => item.id !== id);
}

export function appendWidget(items: readonly BoardItem[], widget: BoardWidgetKey, id: string): BoardItem[] {
  return [...items, { id, widget, size: BOARD_WIDGETS[widget].defaultSize }];
}

export function widgetsOnBoard(items: readonly BoardItem[]): Map<BoardWidgetKey, string> {
  return new Map(items.map((item) => [item.widget, item.id]));
}
