import { describe, expect, it, vi } from "vitest";

import type { BoardItem, BoardSize } from "@hooks/api/queries/board/types";
import { createWidget } from "@test/factories";

import { BOARD_WIDGET_ORDER, BOARD_WIDGETS, DEFAULT_BOARD } from "../constants";
import {
  allowedSizesOf,
  appendCustomWidget,
  appendSpacer,
  appendWidget,
  boardBackgroundOf,
  boardKeyAction,
  boardListsOf,
  colsOf,
  customStatusOf,
  customWidgetsById,
  cycleSize,
  frameBoard,
  frameTemplateOf,
  layOutBoard,
  layoutOf,
  mobileCopyOf,
  moveItem,
  moveItemToEdge,
  orderKeyOf,
  packBoard,
  placementsById,
  removeItem,
  resizeItem,
  resizeSpacer,
  rowHeightOf,
  runBoardKey,
  sameSlot,
  setRowHeight,
  spanOf,
  tileHasBackground,
  tileNameOf,
  toggleBackground,
  uniqueTileId,
  widgetsOnBoard,
  withBackgrounds,
  withList,
} from "../helpers";

const NO_CUSTOM = customWidgetsById([]);

describe("spacers and backgrounds", () => {
  const WIDGET: BoardItem = { kind: "builtin", id: "w", widget: "trending", size: "L" };
  const SPACER: BoardItem = { kind: "spacer", id: "s", size: "S", rows: 3 };

  it("adds a small spacer at the end, with its background on", () => {
    const [, added] = appendSpacer([WIDGET], "spacer");

    expect(added).toMatchObject({ kind: "spacer", id: "spacer", size: "S", rows: 4 });
    expect(added && tileHasBackground(added)).toBe(true);
  });

  it("names a spacer and, alone on its row, sizes it by its own rows", () => {
    expect(tileNameOf(SPACER, NO_CUSTOM, "ready")).toBe("Spacer");
    expect(packBoard([SPACER], "wide")[0]).toMatchObject({ cols: 3, rows: 3 });
    expect(packBoard([{ ...SPACER, size: "XL" }], "wide")[0]).toMatchObject({ cols: 12, rows: 3 });
  });

  it("keeps a spacer's rows between one and seven", () => {
    expect(resizeSpacer([{ ...SPACER, rows: 1 }], "s", -1)[0]).toMatchObject({ rows: 1 });
    expect(resizeSpacer([{ ...SPACER, rows: 7 }], "s", 1)[0]).toMatchObject({ rows: 7 });
    expect(resizeSpacer([SPACER], "s", 1)[0]).toMatchObject({ rows: 4 });
  });

  it("leaves a widget's height alone when a spacer's is changed", () => {
    expect(resizeSpacer([WIDGET], "w", 1)).toEqual([WIDGET]);
  });

  it("switches a tile's background off and back on", () => {
    const off = toggleBackground([WIDGET], "w");
    expect(off[0]).toMatchObject({ background: false });
    expect(toggleBackground(off, "w")[0]).toMatchObject({ background: true });
  });

  it("sets the background of every tile, spacers too", () => {
    const shown = withBackgrounds([WIDGET, SPACER], false).map((item) => item.background);

    expect(shown).toEqual([false, false]);
  });

  it("reads the board as off only when every tile hides its background, an absent background counting as on", () => {
    const off: BoardItem = { ...WIDGET, background: false };

    expect(boardBackgroundOf([WIDGET, { ...SPACER, background: true }])).toBe("on");
    expect(boardBackgroundOf([off, { ...SPACER, background: false }])).toBe("off");
    expect(boardBackgroundOf([off, SPACER])).toBe("on");
    expect(boardBackgroundOf([])).toBe("on");
  });

  it("sends a tile to either end and clears its new row", () => {
    const list: BoardItem[] = [WIDGET, SPACER, { ...WIDGET, id: "x", newRow: true }];

    expect(moveItemToEdge(list, "x", "top").map((item) => item.id)).toEqual(["x", "w", "s"]);
    expect(moveItemToEdge(list, "x", "top")[0]?.newRow).toBeUndefined();
    expect(moveItemToEdge(list, "w", "bottom").map((item) => item.id)).toEqual(["s", "x", "w"]);
  });

  it("counts a change of background or spacer height as a change to the board", () => {
    expect(orderKeyOf(toggleBackground([WIDGET], "w"))).not.toBe(orderKeyOf([WIDGET]));
    expect(orderKeyOf(resizeSpacer([SPACER], "s", 1))).not.toBe(orderKeyOf([SPACER]));
  });

  it("treats two tiles of the same width as the same slot, whatever they show, since the row owns the height", () => {
    const regular: BoardItem = { kind: "builtin", id: "o", widget: "rarities", size: "S" };

    expect(sameSlot(regular, { ...SPACER, rows: 1 })).toBe(true);
    expect(sameSlot(regular, { ...regular, id: "t", height: "tall" })).toBe(true);
    expect(sameSlot(regular, WIDGET)).toBe(false);
  });

  it("leaves a bare spacer out of the mobile copy, where it would only leave a hole, and keeps one with a background", () => {
    const bare: BoardItem = { ...SPACER, background: false };

    expect(mobileCopyOf([WIDGET, bare, SPACER], NO_CUSTOM).map((item) => item.id)).toEqual(["w", "s"]);
  });
});

const EVERY_SIZE: readonly BoardSize[] = ["S", "M", "L", "XL"];

describe("BOARD_WIDGET_ORDER", () => {
  it("lists every registered widget exactly once", () => {
    expect([...BOARD_WIDGET_ORDER].sort()).toEqual(Object.keys(BOARD_WIDGETS).sort());
  });
});

describe("BOARD_WIDGETS", () => {
  it("packs the default board without leaving a hole on a wide screen", () => {
    const tiles = packBoard(DEFAULT_BOARD, "wide");
    const bottom = Math.max(...tiles.map((tile) => tile.row + tile.rows));
    const covered = tiles.reduce((sum, tile) => sum + tile.cols * tile.rows, 0);
    expect(covered).toBe(bottom * 12);
  });
});

describe("boardKeyAction", () => {
  it("maps arrows to moves, shifted arrows to resizes and Delete or Backspace to removal", () => {
    expect(boardKeyAction({ key: "ArrowLeft", shiftKey: false })).toEqual({ kind: "move", delta: -1 });
    expect(boardKeyAction({ key: "ArrowUp", shiftKey: false })).toEqual({ kind: "move", delta: -1 });
    expect(boardKeyAction({ key: "ArrowRight", shiftKey: false })).toEqual({ kind: "move", delta: 1 });
    expect(boardKeyAction({ key: "ArrowDown", shiftKey: false })).toEqual({ kind: "move", delta: 1 });
    expect(boardKeyAction({ key: "ArrowLeft", shiftKey: true })).toEqual({ kind: "resize", delta: -1 });
    expect(boardKeyAction({ key: "ArrowDown", shiftKey: true })).toEqual({ kind: "resize", delta: 1 });
    expect(boardKeyAction({ key: "Delete", shiftKey: false })).toEqual({ kind: "remove" });
    expect(boardKeyAction({ key: "Backspace", shiftKey: false })).toEqual({ kind: "remove" });
  });

  it("ignores every other key", () => {
    expect(boardKeyAction({ key: "Enter", shiftKey: false })).toBeNull();
    expect(boardKeyAction({ key: "a", shiftKey: true })).toBeNull();
  });
});

describe("size locks", () => {
  const MIX: BoardItem = { kind: "builtin", id: "o", widget: "onRepeat", size: "S" };

  const MIX_LOOK = customWidgetsById([createWidget({ id: "w_mix", view: { block: "mix", action: "play" } })]);
  const CUSTOM_MIX: BoardItem = { kind: "custom", id: "cm", widgetId: "w_mix", size: "M" };

  it("offers a history mix only its small size and every other tile all four", () => {
    expect(allowedSizesOf(MIX, NO_CUSTOM)).toEqual(["S"]);
    expect(allowedSizesOf(SCROBBLES, NO_CUSTOM)).toEqual(["S", "M", "L", "XL"]);
    expect(allowedSizesOf(CUSTOM, NO_CUSTOM)).toEqual(["S", "M", "L", "XL"]);
  });

  it("locks a custom widget by its look, so any mix a member builds is small too", () => {
    expect(allowedSizesOf(CUSTOM_MIX, MIX_LOOK)).toEqual(["S"]);
    expect(allowedSizesOf(CUSTOM_MIX, NO_CUSTOM)).toEqual(["S", "M", "L", "XL"]);
    expect(boardListsOf({ items: [CUSTOM_MIX], mobile: [] }, MIX_LOOK).items[0]?.size).toBe("S");
  });

  it("reads a saved mix back at small whatever size it was stored at, on both lists", () => {
    const lists = boardListsOf({ items: [{ ...MIX, size: "L" }], mobile: [{ ...MIX, size: "M" }] }, NO_CUSTOM);
    expect(lists.items[0]?.size).toBe("S");
    expect(lists.mobile[0]?.size).toBe("S");
  });

  it("keeps a mix small in the phone copy where everything else turns medium", () => {
    expect(mobileCopyOf([MIX, SCROBBLES], NO_CUSTOM).map((item) => item.size)).toEqual(["S", "M"]);
  });

  it("refuses to resize a locked tile, by action or by keyboard", () => {
    expect(resizeItem([MIX], "o", "L", NO_CUSTOM)[0]?.size).toBe("S");
    const resize = vi.fn();
    runBoardKey(
      { key: "ArrowRight", shiftKey: true, preventDefault: () => {} },
      MIX,
      {
        resize,
        move: vi.fn(),
        moveToEdge: vi.fn(),
        resizeSpacer: vi.fn(),
        toggleBackground: vi.fn(),
        remove: vi.fn(),
        startDrag: vi.fn(),
      },
      NO_CUSTOM
    );
    expect(resize).toHaveBeenCalledWith("o", "S");
  });
});

describe("colsOf, rowHeightOf and spanOf", () => {
  it("gives the four widths a quarter, a half, three quarters and the whole wide board", () => {
    expect(EVERY_SIZE.map((size) => colsOf(size, "wide"))).toEqual([3, 6, 9, 12]);
  });

  it("takes four of the narrow board's columns for M, L and XL, and two for S", () => {
    expect(EVERY_SIZE.map((size) => colsOf(size, "narrow"))).toEqual([2, 4, 4, 4]);
  });

  it("reads a tile that carries no height as regular", () => {
    expect(rowHeightOf(SCROBBLES)).toBe("regular");
    expect(rowHeightOf({ ...SCROBBLES, height: "tall" })).toBe("tall");
  });

  it("turns a width and a row height into column and row spans, the same rows on both devices", () => {
    expect(spanOf("S", "short", "wide")).toEqual({ cols: 3, rows: 3 });
    expect(spanOf("M", "regular", "wide")).toEqual({ cols: 6, rows: 4 });
    expect(spanOf("L", "tall", "wide")).toEqual({ cols: 9, rows: 6 });
    expect(spanOf("M", "tall", "narrow")).toEqual({ cols: 4, rows: 6 });
  });
});

describe("cycleSize", () => {
  it("steps through the offered sizes and wraps at both ends", () => {
    expect(cycleSize(["S", "M", "L", "XL"], "S", 1)).toBe("M");
    expect(cycleSize(["S", "M", "L", "XL"], "L", 1)).toBe("XL");
    expect(cycleSize(["S", "M", "L", "XL"], "XL", 1)).toBe("S");
    expect(cycleSize(["S", "M", "L", "XL"], "S", -1)).toBe("XL");
  });
});

describe("uniqueTileId", () => {
  it("uses the widget key while it is free and numbers it after that", () => {
    expect(uniqueTileId("mixes", [])).toBe("mixes");
    expect(uniqueTileId("mixes", [{ kind: "builtin", id: "mixes", widget: "mixes", size: "L" }])).toBe("mixes-2");
    expect(
      uniqueTileId("mixes", [
        { kind: "builtin", id: "mixes", widget: "mixes", size: "L" },
        { kind: "builtin", id: "mixes-2", widget: "mixes", size: "L" },
      ])
    ).toBe("mixes-3");
  });
});

describe("placementsById", () => {
  it("indexes the packed tiles by item id", () => {
    const placed = packBoard(
      [
        { kind: "builtin", id: "x", widget: "scrobbles", size: "M" },
        { kind: "builtin", id: "y", widget: "requests", size: "M" },
      ],
      "wide"
    );
    expect(placementsById(placed).get("y")?.col).toBe(6);
  });
});

const TRENDING: BoardItem = { kind: "builtin", id: "t", widget: "trending", size: "XL" };
const SMALL: BoardItem = { kind: "builtin", id: "g", widget: "requests", size: "S" };
const SCROBBLES: BoardItem = { kind: "builtin", id: "s", widget: "scrobbles", size: "M" };
const REQUESTS: BoardItem = { kind: "builtin", id: "r", widget: "requests", size: "M" };
const GENRES: BoardItem = { kind: "builtin", id: "g", widget: "genres", size: "L" };
const CUSTOM: BoardItem = { kind: "custom", id: "c", widgetId: "w_1", size: "M" };

describe("boardListsOf", () => {
  it("returns a fresh copy of the default board and its mobile copy when nothing is saved", () => {
    const lists = boardListsOf(null, NO_CUSTOM);
    expect(lists.items).toEqual(DEFAULT_BOARD);
    expect(lists.items[0]).not.toBe(DEFAULT_BOARD[0]);
    expect(lists.mobile).toEqual(mobileCopyOf(DEFAULT_BOARD, NO_CUSTOM));
  });

  it("keeps each saved arrangement apart, sizes and custom tiles included", () => {
    const saved: BoardItem = { ...SCROBBLES, size: "L" };
    expect(boardListsOf({ items: [SCROBBLES, CUSTOM], mobile: [saved] }, NO_CUSTOM)).toEqual({
      items: [SCROBBLES, CUSTOM],
      mobile: [saved],
    });
  });

  it("keeps an empty saved board empty on both devices", () => {
    expect(boardListsOf({ items: [], mobile: [] }, NO_CUSTOM)).toEqual({ items: [], mobile: [] });
  });
});

describe("mobileCopyOf", () => {
  it("copies every tile at M in the same order, without touching the originals", () => {
    const copy = mobileCopyOf([GENRES, { ...CUSTOM, size: "S" }], NO_CUSTOM);
    expect(copy).toEqual([
      { ...GENRES, size: "M" },
      { ...CUSTOM, size: "M" },
    ]);
    expect(GENRES.size).toBe("L");
  });
});

describe("layoutOf", () => {
  it("wraps both arrangements with the schema version and copies them", () => {
    const layout = layoutOf({ items: [SCROBBLES], mobile: [GENRES] });
    expect(layout).toEqual({ schemaVersion: 5, items: [SCROBBLES], mobile: [GENRES] });
    expect(layout.items[0]).not.toBe(SCROBBLES);
    expect(layout.mobile[0]).not.toBe(GENRES);
  });

  it("saves a custom tile at the position it holds on the board", () => {
    expect(layoutOf({ items: [CUSTOM, SCROBBLES], mobile: [] }).items).toEqual([CUSTOM, SCROBBLES]);
  });
});

describe("withList", () => {
  it("replaces one arrangement and leaves the other as it was", () => {
    const lists = { items: [SCROBBLES], mobile: [GENRES] };
    expect(withList(lists, "mobile", [CUSTOM])).toEqual({ items: [SCROBBLES], mobile: [CUSTOM] });
    expect(withList(lists, "items", [CUSTOM])).toEqual({ items: [CUSTOM], mobile: [GENRES] });
  });
});

describe("packBoard", () => {
  it("places two half-width tiles side by side on one row", () => {
    const tiles = packBoard([SCROBBLES, REQUESTS], "wide");
    expect(tiles.map(({ col, row, cols, rows }) => ({ col, row, cols, rows }))).toEqual([
      { col: 0, row: 0, cols: 6, rows: 4 },
      { col: 6, row: 0, cols: 6, rows: 4 },
    ]);
  });

  it("gives an L tile nine columns and lets a small tile share its row in the three left over", () => {
    const wide: BoardItem = { kind: "builtin", id: "l", widget: "requests", size: "L" };
    const small: BoardItem = { kind: "builtin", id: "s2", widget: "requests", size: "S" };
    const tiles = packBoard([wide, small], "wide");

    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 9, rows: 4 });
    expect(tiles[1]).toMatchObject({ col: 9, row: 0, cols: 3, rows: 4 });
  });

  it("gives an XL tile all twelve columns, so the next tile starts below it", () => {
    const full: BoardItem = { kind: "builtin", id: "x", widget: "requests", size: "XL" };
    const small: BoardItem = { kind: "builtin", id: "s2", widget: "requests", size: "S" };
    const tiles = packBoard([full, small], "wide");

    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 12, rows: 4 });
    expect(tiles[1]).toMatchObject({ col: 0, row: 4, cols: 3 });
  });

  it("drops a full-row tile below the tiles before it", () => {
    const tiles = packBoard([SCROBBLES, TRENDING], "wide");
    expect(tiles[1]).toMatchObject({ col: 0, row: 4, cols: 12, rows: 4 });
  });

  it("never places a later tile before an earlier one in reading order", () => {
    const tiles = packBoard([SCROBBLES, TRENDING, REQUESTS], "wide");
    expect(tiles[2]).toMatchObject({ col: 0, row: 8 });
  });

  it("starts a marked tile on a row of its own even where it would fit beside the last one", () => {
    const beside = packBoard([SCROBBLES, REQUESTS], "wide");
    const below = packBoard([SCROBBLES, { ...REQUESTS, newRow: true }], "wide");

    expect(beside[1]).toMatchObject({ col: 6, row: 0 });
    expect(below[1]).toMatchObject({ col: 0, row: 4 });
  });

  it("makes every tile on a row as high as the row, which takes its height from its first widget", () => {
    const tall: BoardItem = { ...SMALL, id: "o", height: "tall" };
    const tiles = packBoard([tall, { ...SCROBBLES, height: "short" }, { ...REQUESTS, newRow: true }], "wide");

    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 3, rows: 6 });
    expect(tiles[1]).toMatchObject({ col: 3, row: 0, cols: 6, rows: 6 });
    expect(tiles[2]).toMatchObject({ col: 0, row: 6, rows: 4 });
  });

  it("gives each row its own height: short is three units, regular four and tall six", () => {
    const tiles = packBoard(
      [
        { ...TRENDING, height: "short" },
        { ...TRENDING, id: "t2" },
        { ...TRENDING, id: "t3", height: "tall" },
      ],
      "wide"
    );

    expect(tiles.map(({ row, rows }) => ({ row, rows }))).toEqual([
      { row: 0, rows: 3 },
      { row: 3, rows: 4 },
      { row: 7, rows: 6 },
    ]);
  });

  it("stretches a spacer to the row of the widget it sits beside", () => {
    const spacer: BoardItem = { kind: "spacer", id: "sp", size: "S", rows: 2 };
    const tiles = packBoard([spacer, { ...SMALL, height: "tall" }], "wide");

    expect(tiles[0]).toMatchObject({ col: 0, row: 0, rows: 6, rowSized: true });
    expect(tiles[1]).toMatchObject({ col: 3, row: 0, rows: 6, rowSized: true });
  });

  it("leaves each spacer its own rows on a row of nothing but spacers, the row as high as the tallest", () => {
    const spacer: BoardItem = { kind: "spacer", id: "sp", size: "M", rows: 2 };
    const tiles = packBoard([spacer, { ...spacer, id: "sp2", rows: 5 }, { ...TRENDING, newRow: true }], "wide");

    expect(tiles[0]).toMatchObject({ row: 0, rows: 2, rowSized: false });
    expect(tiles[1]).toMatchObject({ row: 0, rows: 5, rowSized: false });
    expect(tiles[2]).toMatchObject({ row: 5 });
  });

  it("honours the saved size on a narrow board: two small tiles share a row, M, L and XL take it whole", () => {
    const small: BoardItem = { kind: "builtin", id: "o", widget: "onRepeat", size: "S" };
    const tiles = packBoard(
      [small, { ...small, id: "o2" }, SCROBBLES, GENRES, { ...GENRES, id: "g2", size: "XL" }],
      "narrow"
    );
    expect(tiles.map(({ col, cols, size }) => ({ col, cols, size }))).toEqual([
      { col: 0, cols: 2, size: "S" },
      { col: 2, cols: 2, size: "S" },
      { col: 0, cols: 4, size: "M" },
      { col: 0, cols: 4, size: "L" },
      { col: 0, cols: 4, size: "XL" },
    ]);
    expect(tiles[1]?.row).toBe(0);
  });

  it.each(EVERY_SIZE)("places every widget saved at %s at that size on the narrow board", (size) => {
    const items: BoardItem[] = [
      ...BOARD_WIDGET_ORDER.map((widget): BoardItem => ({ kind: "builtin", id: widget, widget, size })),
      { ...CUSTOM, size },
    ];
    for (const tile of packBoard(items, "narrow")) {
      expect(tile).toMatchObject({ size, cols: colsOf(size, "narrow"), rows: 4 });
    }
  });

  it("returns no tiles for an empty board", () => {
    expect(packBoard([], "wide")).toEqual([]);
  });

  it("packs a custom tile like any other, at the regular height until its row is given one", () => {
    expect(packBoard([CUSTOM], "wide")[0]).toMatchObject({ cols: 6, rows: 4 });
    expect(packBoard([{ ...CUSTOM, height: "short" }], "wide")[0]).toMatchObject({ cols: 6, rows: 3 });
  });
});

describe("layOutBoard", () => {
  const spacer: BoardItem = { kind: "spacer", id: "sp", size: "XL", rows: 2 };

  it("reports each row with its position, its first tile's id, its height and the tiles on it", () => {
    const { rows } = layOutBoard([{ ...SCROBBLES, height: "short" }, REQUESTS, spacer, TRENDING], "wide");

    expect(rows).toEqual([
      { id: "s", position: 1, row: 0, rows: 3, height: "short", sizable: true, itemIds: ["s", "r"] },
      { id: "sp", position: 2, row: 3, rows: 2, height: "regular", sizable: false, itemIds: ["sp"] },
      { id: "t", position: 3, row: 5, rows: 4, height: "regular", sizable: true, itemIds: ["t"] },
    ]);
  });

  it("reads the height of a row from its first widget, past a spacer that leads it", () => {
    const lead: BoardItem = { kind: "spacer", id: "sp", size: "S", rows: 1 };
    const { rows } = layOutBoard([lead, { ...SMALL, height: "tall" }, { ...SMALL, id: "o2" }], "wide");

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ height: "tall", rows: 6, sizable: true });
  });

  it("returns no rows for an empty board", () => {
    expect(layOutBoard([], "narrow")).toEqual({ tiles: [], rows: [] });
  });
});

describe("setRowHeight", () => {
  it("writes the height on every tile of the row and on no other", () => {
    const items = [SCROBBLES, REQUESTS, TRENDING];
    const [row] = layOutBoard(items, "wide").rows;
    const next = row ? setRowHeight(items, row, "tall") : [];

    expect(next.map((item) => item.height)).toEqual(["tall", "tall", undefined]);
    expect(next[2]).toBe(TRENDING);
    expect(packBoard(next, "wide").map((tile) => tile.rows)).toEqual([6, 6, 4]);
  });

  it("counts a change of row height as a change to the board", () => {
    const items = [SCROBBLES];
    const [row] = layOutBoard(items, "wide").rows;

    expect(orderKeyOf(row ? setRowHeight(items, row, "short") : items)).not.toBe(orderKeyOf(items));
  });
});

describe("frameBoard and frameTemplateOf", () => {
  const board = layOutBoard([{ ...SCROBBLES, height: "short" }, REQUESTS, TRENDING], "wide");
  const framed = frameBoard(board);

  it("opens one head track above every row, pushing each tile down by the heads above it", () => {
    expect(framed.tiles.map(({ row, rows }) => ({ row, rows }))).toEqual([
      { row: 1, rows: 3 },
      { row: 1, rows: 3 },
      { row: 5, rows: 4 },
    ]);
  });

  it("stretches each row over its head and its tiles", () => {
    expect(framed.rows.map(({ row, rows }) => ({ row, rows }))).toEqual([
      { row: 0, rows: 4 },
      { row: 4, rows: 5 },
    ]);
  });

  it("writes the grid's rows as a head followed by the row's units, row after row", () => {
    expect(frameTemplateOf(framed)).toBe("2rem repeat(3, var(--board-row)) 2rem repeat(4, var(--board-row))");
  });
});

describe("custom tiles", () => {
  it("resizes a custom tile to any size", () => {
    expect(resizeItem([CUSTOM], "c", "L", NO_CUSTOM)).toEqual([{ ...CUSTOM, size: "L" }]);
    expect(resizeItem([CUSTOM], "c", "S", NO_CUSTOM)).toEqual([{ ...CUSTOM, size: "S" }]);
  });

  it("adds a figure look on a short row and every other look with no height of its own", () => {
    const figure = createWidget({ id: "w_stat", view: { block: "stat", action: "none" } });
    const list = createWidget({ id: "w_list" });

    expect(appendCustomWidget([], figure)[0]).toMatchObject({ kind: "custom", widgetId: "w_stat", height: "short" });
    expect(appendCustomWidget([], list)[0]?.height).toBeUndefined();
  });

  it("names a custom tile after its widget, or as deleted when the widget is gone", () => {
    expect(tileNameOf(CUSTOM, customWidgetsById([createWidget()]), "ready")).toBe("Most played");
    expect(tileNameOf(CUSTOM, NO_CUSTOM, "ready")).toBe("Deleted widget");
  });

  it("never names a tile deleted while the widget list is loading or failed", () => {
    expect(tileNameOf(CUSTOM, NO_CUSTOM, "loading")).toBe("Custom widget");
    expect(tileNameOf(CUSTOM, NO_CUSTOM, "error")).toBe("Custom widget");
  });

  it("reads the list status from the query, loading first", () => {
    expect(customStatusOf({ isLoading: true, isError: true })).toBe("loading");
    expect(customStatusOf({ isLoading: false, isError: true })).toBe("error");
    expect(customStatusOf({ isLoading: false, isError: false })).toBe("ready");
  });

  it("leaves custom tiles out of the gallery's on-board map", () => {
    expect(widgetsOnBoard([CUSTOM, SCROBBLES])).toEqual(new Map([["scrobbles", "s"]]));
  });
});

describe("moveItem", () => {
  const items = [TRENDING, SCROBBLES, REQUESTS];

  it("moves an item to the requested index", () => {
    expect(moveItem(items, "t", 2).map((item) => item.id)).toEqual(["s", "r", "t"]);
    expect(moveItem(items, "r", 0).map((item) => item.id)).toEqual(["r", "t", "s"]);
  });

  it("lets a moved tile rejoin the flow instead of keeping its own row", () => {
    const moved = moveItem([TRENDING, { ...SCROBBLES, newRow: true }, REQUESTS], "s", 0);

    expect(moved[0]?.newRow).toBeFalsy();
  });

  it("clamps the target index to the list bounds", () => {
    expect(moveItem(items, "s", 99).map((item) => item.id)).toEqual(["t", "r", "s"]);
    expect(moveItem(items, "s", -1).map((item) => item.id)).toEqual(["s", "t", "r"]);
  });

  it("returns an unchanged copy for an unknown id or the same index", () => {
    const unknown = moveItem(items, "nope", 0);
    const same = moveItem(items, "s", 1);
    expect(unknown).toEqual(items);
    expect(unknown).not.toBe(items);
    expect(same).toEqual(items);
  });
});

describe("resizeItem", () => {
  it("changes the size of the tile with the id", () => {
    expect(resizeItem([SCROBBLES], "s", "L", NO_CUSTOM)).toEqual([{ ...SCROBBLES, size: "L" }]);
  });

  it("resizes any builtin tile to three quarters of the row or the full row", () => {
    expect(resizeItem([REQUESTS], "r", "L", NO_CUSTOM)).toEqual([{ ...REQUESTS, size: "L" }]);
    expect(resizeItem([REQUESTS], "r", "XL", NO_CUSTOM)).toEqual([{ ...REQUESTS, size: "XL" }]);
  });

  it("leaves other items untouched", () => {
    const next = resizeItem([SCROBBLES, REQUESTS], "s", "L", NO_CUSTOM);
    expect(next[1]).toBe(REQUESTS);
  });
});

describe("removeItem", () => {
  it("removes only the item with the id", () => {
    expect(removeItem([SCROBBLES, REQUESTS], "s")).toEqual([REQUESTS]);
  });
});

describe("appendWidget", () => {
  it("appends the widget at its default size under the given id", () => {
    expect(appendWidget([SCROBBLES], "mixes", "m")).toEqual([
      SCROBBLES,
      { kind: "builtin", id: "m", widget: "mixes", size: "XL" },
    ]);
  });
});

describe("widgetsOnBoard", () => {
  it("maps each widget on the board to its tile id", () => {
    const onBoard = widgetsOnBoard([SCROBBLES, REQUESTS]);
    expect(onBoard.get("scrobbles")).toBe("s");
    expect(onBoard.get("requests")).toBe("r");
    expect(onBoard.has("mixes")).toBe(false);
  });
});
