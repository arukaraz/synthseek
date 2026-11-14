import i18n from "@locale";
import type { MouseEvent } from "react";

import {
  BOARD_COLUMNS,
  BOARD_ROW_UNITS,
  BOARD_SIZE_COLS,
  DEFAULT_BOARD_ROW_HEIGHT,
  type BoardDevice,
  type BoardSpan,
} from "@components/BoardGrid";
import type {
  BoardItem,
  BoardLayout,
  BoardList,
  BoardLists,
  BoardRowHeight,
  BoardSize,
  BoardWidgetKey,
} from "@hooks/api/queries/board/types";
import type { WidgetBlock, WidgetDocument } from "@hooks/api/queries/widgets/types";

import {
  BOARD_ROW_FRAME_HEAD,
  BOARD_SCHEMA_VERSION,
  BOARD_SIZE_ORDER,
  BOARD_WIDGETS,
  CUSTOM_BLOCK_LOCKS,
  CUSTOM_BLOCK_ROW_HEIGHTS,
  DEFAULT_BOARD,
  EDIT_PASSTHROUGH_SELECTOR,
  MOBILE_COPY_SIZE,
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
  BoardRow,
  BoardTileLayoutActions,
  CustomWidgetsStatus,
  MoveDelta,
  PackedBoard,
  PlacedTile,
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
  actions: BoardTileLayoutActions,
  custom: BoardCustomWidgets
): void {
  const action = boardKeyAction(event);
  if (!action) return;
  event.preventDefault();
  if (action.kind === "remove") actions.remove(item.id);
  else if (action.kind === "move") actions.move(item.id, action.delta);
  else actions.resize(item.id, cycleSize(allowedSizesOf(item, custom), item.size, action.delta));
}

export function lockedBlockSize(block: WidgetBlock): BoardSize | undefined {
  return CUSTOM_BLOCK_LOCKS[block];
}

function lockedSizeOf(item: BoardItem, custom: BoardCustomWidgets): BoardSize | undefined {
  if (item.kind === "builtin") return BOARD_WIDGETS[item.widget].lockedTo;
  if (item.kind === "spacer") return undefined;
  const block = custom.get(item.widgetId)?.view.block;
  return block ? lockedBlockSize(block) : undefined;
}

export function allowedSizesOf(item: BoardItem, custom: BoardCustomWidgets): readonly BoardSize[] {
  const locked = lockedSizeOf(item, custom);
  return locked ? [locked] : BOARD_SIZE_ORDER;
}

function withAllowedSize(item: BoardItem, custom: BoardCustomWidgets): BoardItem {
  const locked = lockedSizeOf(item, custom);
  return locked === undefined || locked === item.size ? item : { ...item, size: locked };
}

export function colsOf(size: BoardSize, device: BoardDevice): number {
  return Math.min(BOARD_SIZE_COLS[device][size], BOARD_COLUMNS[device]);
}

export function rowHeightOf(item: BoardItem): BoardRowHeight {
  return item.height ?? DEFAULT_BOARD_ROW_HEIGHT;
}

export function spanOf(size: BoardSize, height: BoardRowHeight, device: BoardDevice): BoardSpan {
  return { cols: colsOf(size, device), rows: BOARD_ROW_UNITS[height] };
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

export function sameSlot(a: BoardItem, b: BoardItem): boolean {
  return a.size === b.size;
}

export function tileHasBackground(item: BoardItem): boolean {
  return item.background ?? true;
}

export function boardBackgroundOf(items: readonly BoardItem[]): BoardBackground {
  return items.length > 0 && !items.some(tileHasBackground) ? "off" : "on";
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
        rowHeightOf(item),
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

export function mobileCopyOf(items: readonly BoardItem[], custom: BoardCustomWidgets): BoardItem[] {
  return items
    .filter((item) => item.kind !== "spacer" || tileHasBackground(item))
    .map((item) => withAllowedSize({ ...item, size: MOBILE_COPY_SIZE }, custom));
}

export function boardListsOf(layout: BoardLists | null | undefined, custom: BoardCustomWidgets): BoardLists {
  if (!layout) {
    const items = DEFAULT_BOARD.map((item) => ({ ...item }));
    return { items, mobile: mobileCopyOf(items, custom) };
  }
  return {
    items: layout.items.map((item) => withAllowedSize(item, custom)),
    mobile: layout.mobile.map((item) => withAllowedSize(item, custom)),
  };
}

export function layoutOf(lists: BoardLists): BoardLayout {
  return {
    schemaVersion: BOARD_SCHEMA_VERSION,
    items: lists.items.map((item) => ({ ...item })),
    mobile: lists.mobile.map((item) => ({ ...item })),
  };
}

export function withList(lists: BoardLists, list: BoardList, items: readonly BoardItem[]): BoardLists {
  return { ...lists, [list]: [...items] };
}

function rowGroupsOf(items: readonly BoardItem[], device: BoardDevice): BoardItem[][] {
  const columns = BOARD_COLUMNS[device];
  const groups: BoardItem[][] = [];
  let used = columns;
  for (const item of items) {
    const cols = colsOf(item.size, device);
    if (item.newRow || used + cols > columns) {
      groups.push([]);
      used = 0;
    }
    groups[groups.length - 1]?.push(item);
    used += cols;
  }
  return groups;
}

function rowUnitsOf(group: readonly BoardItem[], height: BoardRowHeight, sizable: boolean): number {
  if (sizable) return BOARD_ROW_UNITS[height];
  return group.reduce((tallest, item) => (item.kind === "spacer" ? Math.max(tallest, item.rows) : tallest), 0);
}

export function layOutBoard(items: readonly BoardItem[], device: BoardDevice): PackedBoard {
  const tiles: PlacedTile[] = [];
  const rows: BoardRow[] = [];
  let top = 0;
  for (const group of rowGroupsOf(items, device)) {
    const lead = group.find((item) => item.kind !== "spacer");
    const first = group[0];
    if (!first) continue;
    const sizable = lead !== undefined;
    const height = rowHeightOf(lead ?? first);
    const units = rowUnitsOf(group, height, sizable);
    let col = 0;
    for (const item of group) {
      const cols = colsOf(item.size, device);
      const rows = item.kind === "spacer" && !sizable ? item.rows : units;
      tiles.push({ item, size: item.size, col, row: top, cols, rows, rowSized: sizable });
      col += cols;
    }
    rows.push({
      id: first.id,
      position: rows.length + 1,
      row: top,
      rows: units,
      height,
      sizable,
      itemIds: group.map((item) => item.id),
    });
    top += units;
  }
  return { tiles, rows };
}

export function frameBoard(board: PackedBoard): PackedBoard {
  const heads = new Map(board.rows.flatMap((row) => row.itemIds.map((id) => [id, row.position] as const)));
  return {
    tiles: board.tiles.map((tile) => ({ ...tile, row: tile.row + (heads.get(tile.item.id) ?? 0) })),
    rows: board.rows.map((row) => ({ ...row, row: row.row + row.position - 1, rows: row.rows + 1 })),
  };
}

export function frameTemplateOf(board: PackedBoard): string {
  return board.rows.map((row) => `${BOARD_ROW_FRAME_HEAD} repeat(${row.rows - 1}, var(--board-row))`).join(" ");
}

export function packBoard(items: readonly BoardItem[], device: BoardDevice): PlacedTile[] {
  return layOutBoard(items, device).tiles;
}

export function setRowHeight(items: readonly BoardItem[], row: BoardRow, height: BoardRowHeight): BoardItem[] {
  const inRow = new Set(row.itemIds);
  return items.map((item) => (inRow.has(item.id) ? { ...item, height } : item));
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

export function resizeItem(
  items: readonly BoardItem[],
  id: string,
  size: BoardSize,
  custom: BoardCustomWidgets
): BoardItem[] {
  return items.map((item) => (item.id === id ? withAllowedSize({ ...item, size }, custom) : item));
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

export function removeItem(items: readonly BoardItem[], id: string): BoardItem[] {
  return items.filter((item) => item.id !== id);
}

export function appendWidget(items: readonly BoardItem[], widget: BoardWidgetKey, id: string): BoardItem[] {
  return [...items, { kind: "builtin", id, widget, size: BOARD_WIDGETS[widget].defaultSize }];
}

export function appendCustomWidget(items: readonly BoardItem[], widget: WidgetDocument): BoardItem[] {
  return [
    ...items,
    {
      kind: "custom",
      id: uniqueTileId(widget.id, items),
      widgetId: widget.id,
      size: lockedBlockSize(widget.view.block) ?? widget.defaultSize,
      height: CUSTOM_BLOCK_ROW_HEIGHTS[widget.view.block],
    },
  ];
}

export function widgetsOnBoard(items: readonly BoardItem[]): Map<BoardWidgetKey, string> {
  const onBoard = new Map<BoardWidgetKey, string>();
  for (const item of items) if (item.kind === "builtin") onBoard.set(item.widget, item.id);
  return onBoard;
}
