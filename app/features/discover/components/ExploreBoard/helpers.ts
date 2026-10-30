import i18n from "@locale";
import type { MouseEvent } from "react";

import { BOARD_COLUMNS, BOARD_SPANS, type BoardDevice, type BoardHeight, type BoardSpan } from "@components/BoardGrid";
import type { BoardItem, BoardLayout, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";

import {
  BOARD_SCHEMA_VERSION,
  BOARD_SIZE_ORDER,
  BOARD_WIDGETS,
  CUSTOM_BLOCK_HEIGHTS,
  DEFAULT_BOARD,
  EDIT_PASSTHROUGH_SELECTOR,
  FALLBACK_BLOCK_HEIGHT,
  NARROW_TILE_SIZE,
  SPACER_DEFAULT_ROWS,
  SPACER_DEFAULT_SIZE,
  SPACER_MAX_ROWS,
  SPACER_MIN_ROWS,
} from "./constants";
import type {
  BoardBackground,
  BoardCustomWidgets,
  BoardEdge,
  BoardKeyAction,
  BoardTileLayoutActions,
  CustomWidgetsStatus,
  MoveDelta,
  PlacedTile,
  WidgetTile,
} from "./types";

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

export function runBoardKey(
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
  item: BoardItem,
  device: BoardDevice,
  actions: BoardTileLayoutActions
): void {
  const action = boardKeyAction(event);
  if (!action) return;
  event.preventDefault();
  if (action.kind === "remove") actions.remove(item.id);
  else if (action.kind === "move") actions.move(item.id, action.delta);
  else actions.resize(item.id, cycleSize(editableSizesOf(device), item.size, action.delta));
}

export function heightOf(widget: BoardWidgetKey, size: BoardSize): BoardHeight {
  return BOARD_WIDGETS[widget].sizes[size];
}

export function spanOf(widget: BoardWidgetKey, size: BoardSize, device: BoardDevice): BoardSpan {
  return BOARD_SPANS[device][size][heightOf(widget, size)];
}

export function customWidgetsById(widgets: readonly WidgetDocument[] | undefined): BoardCustomWidgets {
  return new Map((widgets ?? []).map((widget) => [widget.id, widget]));
}

export function customStatusOf(query: { isLoading: boolean; isError: boolean }): CustomWidgetsStatus {
  if (query.isLoading) return "loading";
  return query.isError ? "error" : "ready";
}

export function tileNameOf(item: BoardItem, custom: BoardCustomWidgets, status: CustomWidgetsStatus): string {
  if (item.kind === "builtin") return i18n.t(`discover:${BOARD_WIDGETS[item.widget].titleKey}`);
  if (item.kind === "spacer") return i18n.t("discover:board.spacer.name");
  const widget = custom.get(item.widgetId);
  if (widget) return widget.meta.name;
  return i18n.t(status === "ready" ? "discover:customWidget.deletedName" : "discover:customWidget.unresolvedName");
}

export function editableSizesOf(device: BoardDevice): readonly BoardSize[] {
  return device === "narrow" ? [] : BOARD_SIZE_ORDER;
}

export function tileHeightOf(item: WidgetTile, size: BoardSize, custom: BoardCustomWidgets): BoardHeight {
  if (item.kind === "builtin") return heightOf(item.widget, size);
  const block = custom.get(item.widgetId)?.view.block;
  return block ? CUSTOM_BLOCK_HEIGHTS[block][size] : FALLBACK_BLOCK_HEIGHT;
}

export function tileSpanOf(
  item: BoardItem,
  size: BoardSize,
  device: BoardDevice,
  custom: BoardCustomWidgets
): BoardSpan {
  if (item.kind === "spacer") return { cols: BOARD_SPANS[device][size].regular.cols, rows: item.rows };
  return BOARD_SPANS[device][size][tileHeightOf(item, size, custom)];
}

export function sameSlot(a: BoardItem, b: BoardItem, custom: BoardCustomWidgets): boolean {
  const rowsOf = (item: BoardItem) => tileSpanOf(item, item.size, "wide", custom).rows;
  return a.size === b.size && rowsOf(a) === rowsOf(b);
}

export function tileHasBackground(item: BoardItem): boolean {
  return item.background ?? true;
}

export function boardBackgroundOf(items: readonly BoardItem[]): BoardBackground {
  const shown = items.filter(tileHasBackground).length;
  if (shown === items.length) return "on";
  return shown === 0 ? "off" : "mixed";
}

export function withBackgrounds(items: readonly BoardItem[], background: boolean): BoardItem[] {
  return items.map((item) => ({ ...item, background }));
}

export function orderKeyOf(items: readonly BoardItem[]): string {
  return items
    .map((item) =>
      [
        item.id,
        item.size,
        item.newRow ? "row" : "flow",
        tileHasBackground(item) ? "card" : "bare",
        item.kind === "spacer" ? item.rows : "",
      ].join(":")
    )
    .join(",");
}

export function cycleSize(sizes: readonly BoardSize[], current: BoardSize, delta: MoveDelta): BoardSize {
  const index = sizes.indexOf(current);
  const next = (index + delta + sizes.length) % sizes.length;
  return sizes[next] ?? current;
}

export function uniqueTileId(base: string, items: readonly BoardItem[]): string {
  const taken = new Set(items.map((item) => item.id));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

export function boardItemsOf(layout: BoardLayout | null | undefined): BoardItem[] {
  if (!layout) return DEFAULT_BOARD.map((item) => ({ ...item }));
  return [...layout.items];
}

export function layoutOf(items: readonly BoardItem[]): BoardLayout {
  return { schemaVersion: BOARD_SCHEMA_VERSION, items: items.map((item) => ({ ...item })) };
}

export function displayedSize(item: BoardItem, device: BoardDevice): BoardSize {
  return device === "wide" ? item.size : NARROW_TILE_SIZE;
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

export function packBoard(items: readonly BoardItem[], device: BoardDevice, custom: BoardCustomWidgets): PlacedTile[] {
  const columns = BOARD_COLUMNS[device];
  const occupied = new Set<string>();
  const placed: PlacedTile[] = [];
  let row = 0;
  let col = 0;

  for (const item of items) {
    if (item.newRow) {
      row = placed.reduce((bottom, tile) => Math.max(bottom, tile.row + tile.rows), 0);
      col = 0;
    }
    const size = displayedSize(item, device);
    const span = tileSpanOf(item, size, device, custom);
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
  next.splice(target, 0, { ...moved, newRow: undefined });
  return next;
}

export function moveItemToEdge(items: readonly BoardItem[], id: string, edge: BoardEdge): BoardItem[] {
  return moveItem(items, id, edge === "top" ? 0 : items.length - 1);
}

export function resizeItem(items: readonly BoardItem[], id: string, size: BoardSize): BoardItem[] {
  return items.map((item) => (item.id === id ? { ...item, size } : item));
}

export function toggleBackground(items: readonly BoardItem[], id: string): BoardItem[] {
  return items.map((item) => (item.id === id ? { ...item, background: !tileHasBackground(item) } : item));
}

export function resizeSpacer(items: readonly BoardItem[], id: string, delta: MoveDelta): BoardItem[] {
  return items.map((item) =>
    item.id === id && item.kind === "spacer"
      ? { ...item, rows: Math.max(SPACER_MIN_ROWS, Math.min(SPACER_MAX_ROWS, item.rows + delta)) }
      : item
  );
}

export function appendSpacer(items: readonly BoardItem[], id: string): BoardItem[] {
  return [...items, { kind: "spacer", id, size: SPACER_DEFAULT_SIZE, rows: SPACER_DEFAULT_ROWS }];
}

export function shownItems(items: readonly BoardItem[], device: BoardDevice, editing: boolean): BoardItem[] {
  if (device === "wide" || editing) return [...items];
  return items.filter((item) => item.kind !== "spacer" || tileHasBackground(item));
}

export function removeItem(items: readonly BoardItem[], id: string): BoardItem[] {
  return items.filter((item) => item.id !== id);
}

export function appendWidget(items: readonly BoardItem[], widget: BoardWidgetKey, id: string): BoardItem[] {
  return [...items, { kind: "builtin", id, widget, size: BOARD_WIDGETS[widget].defaultSize }];
}

export function appendCustomWidget(items: readonly BoardItem[], widget: WidgetDocument): BoardItem[] {
  return [
    ...items,
    { kind: "custom", id: uniqueTileId(widget.id, items), widgetId: widget.id, size: widget.defaultSize },
  ];
}

export function widgetsOnBoard(items: readonly BoardItem[]): Map<BoardWidgetKey, string> {
  const onBoard = new Map<BoardWidgetKey, string>();
  for (const item of items) if (item.kind === "builtin") onBoard.set(item.widget, item.id);
  return onBoard;
}
