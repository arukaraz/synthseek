import { describe, expect, it } from "vitest";

import type { BoardItem, BoardSize } from "@hooks/api/queries/board/types";
import { createWidget } from "@test/factories";

import { BOARD_WIDGET_ORDER, BOARD_WIDGETS, DEFAULT_BOARD } from "../constants";
import {
  appendSpacer,
  appendWidget,
  boardBackgroundOf,
  boardItemsOf,
  boardKeyAction,
  customStatusOf,
  customWidgetsById,
  cycleSize,
  editableSizesOf,
  displayedSize,
  heightOf,
  layoutOf,
  moveItem,
  moveItemToEdge,
  orderKeyOf,
  packBoard,
  placementsById,
  removeItem,
  resizeItem,
  resizeSpacer,
  sameSlot,
  shownItems,
  spanOf,
  tileHasBackground,
  tileHeightOf,
  tileNameOf,
  tileSpanOf,
  toggleBackground,
  uniqueTileId,
  widgetsOnBoard,
  withBackgrounds,
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

  it("names a spacer and sizes it by its own rows, whatever the widget heights", () => {
    expect(tileNameOf(SPACER, NO_CUSTOM, "ready")).toBe("Spacer");
    expect(tileSpanOf(SPACER, "S", "wide", NO_CUSTOM)).toEqual({ cols: 3, rows: 3 });
    expect(tileSpanOf(SPACER, "L", "wide", NO_CUSTOM)).toEqual({ cols: 12, rows: 3 });
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

  it("reads the board as on, off or mixed, an absent background counting as on", () => {
    const off: BoardItem = { ...WIDGET, background: false };

    expect(boardBackgroundOf([WIDGET, { ...SPACER, background: true }])).toBe("on");
    expect(boardBackgroundOf([off, { ...SPACER, background: false }])).toBe("off");
    expect(boardBackgroundOf([off, SPACER])).toBe("mixed");
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

  it("treats a spacer and a widget of the same width and rows as the same slot", () => {
    const regular: BoardItem = { kind: "builtin", id: "o", widget: "rarities", size: "S" };

    expect(sameSlot(regular, { ...SPACER, rows: tileSpanOf(regular, "S", "wide", NO_CUSTOM).rows }, NO_CUSTOM)).toBe(
      true
    );
    expect(sameSlot(regular, { ...SPACER, rows: 1 }, NO_CUSTOM)).toBe(false);
  });

  it("drops a bare spacer on a phone, where it would only leave a hole, except while editing", () => {
    const bare: BoardItem = { ...SPACER, background: false };

    expect(shownItems([WIDGET, bare], "narrow", false)).toEqual([WIDGET]);
    expect(shownItems([WIDGET, SPACER], "narrow", false)).toEqual([WIDGET, SPACER]);
    expect(shownItems([WIDGET, bare], "narrow", true)).toEqual([WIDGET, bare]);
    expect(shownItems([WIDGET, bare], "wide", false)).toEqual([WIDGET, bare]);
  });
});

const EVERY_SIZE: readonly BoardSize[] = ["S", "M", "L"];

describe("BOARD_WIDGET_ORDER", () => {
  it("lists every registered widget exactly once", () => {
    expect([...BOARD_WIDGET_ORDER].sort()).toEqual(Object.keys(BOARD_WIDGETS).sort());
  });
});

describe("BOARD_WIDGETS", () => {
  it.each(BOARD_WIDGET_ORDER)("offers %s in exactly S, M and L, each with a height", (widget) => {
    const { sizes } = BOARD_WIDGETS[widget];
    expect(Object.keys(sizes).sort()).toEqual(["L", "M", "S"]);
    for (const size of EVERY_SIZE) expect(["short", "regular", "tall"]).toContain(sizes[size]);
  });

  it("packs the default board without leaving a hole on a wide screen", () => {
    const tiles = packBoard(DEFAULT_BOARD, "wide", NO_CUSTOM);
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

describe("editableSizesOf", () => {
  it("offers the three sizes from narrowest to widest on a wide board", () => {
    expect(editableSizesOf("wide")).toEqual(["S", "M", "L"]);
  });

  it("offers nothing to resize on a narrow board, where every size shows as M", () => {
    expect(editableSizesOf("narrow")).toEqual([]);
    expect(cycleSize(editableSizesOf("narrow"), "S", 1)).toBe("S");
  });
});

describe("heightOf and spanOf", () => {
  it("reads the height a widget declares for a width", () => {
    expect(heightOf("mixes", "M")).toBe("tall");
    expect(heightOf("mixes", "L")).toBe("regular");
    expect(heightOf("onRepeat", "S")).toBe("tall");
    expect(heightOf("onRepeat", "M")).toBe("regular");
    expect(heightOf("onRepeat", "L")).toBe("short");
  });

  it("turns width and height into column and row spans per device", () => {
    expect(spanOf("onRepeat", "S", "wide")).toEqual({ cols: 3, rows: 7 });
    expect(spanOf("onRepeat", "L", "wide")).toEqual({ cols: 12, rows: 2 });
    expect(spanOf("mixes", "L", "wide")).toEqual({ cols: 12, rows: 4 });
    expect(spanOf("mixes", "M", "narrow")).toEqual({ cols: 4, rows: 7 });
  });
});

describe("cycleSize", () => {
  it("steps through the offered sizes and wraps at both ends", () => {
    expect(cycleSize(["S", "M", "L"], "S", 1)).toBe("M");
    expect(cycleSize(["S", "M", "L"], "L", 1)).toBe("S");
    expect(cycleSize(["S", "M", "L"], "S", -1)).toBe("L");
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
      "wide",
      NO_CUSTOM
    );
    expect(placementsById(placed).get("y")?.col).toBe(6);
  });
});

const TRENDING: BoardItem = { kind: "builtin", id: "t", widget: "trending", size: "L" };
const SCROBBLES: BoardItem = { kind: "builtin", id: "s", widget: "scrobbles", size: "M" };
const REQUESTS: BoardItem = { kind: "builtin", id: "r", widget: "requests", size: "M" };
const GENRES: BoardItem = { kind: "builtin", id: "g", widget: "genres", size: "L" };
const CUSTOM: BoardItem = { kind: "custom", id: "c", widgetId: "w_1", size: "M" };

describe("boardItemsOf", () => {
  it("returns a fresh copy of the default board when nothing is saved", () => {
    const items = boardItemsOf(null);
    expect(items).toEqual(DEFAULT_BOARD);
    expect(items[0]).not.toBe(DEFAULT_BOARD[0]);
  });

  it("keeps a saved size the widget offers", () => {
    expect(boardItemsOf({ schemaVersion: 3, items: [SCROBBLES] })).toEqual([SCROBBLES]);
  });

  it("keeps a size saved outside the widget's default, since every widget offers all three", () => {
    const saved: BoardItem = { kind: "builtin", id: "o", widget: "onRepeat", size: "L" };
    expect(boardItemsOf({ schemaVersion: 3, items: [saved] })).toEqual([saved]);
  });

  it("keeps an empty saved board empty", () => {
    expect(boardItemsOf({ schemaVersion: 3, items: [] })).toEqual([]);
  });

  it("keeps a custom tile in its saved place and size", () => {
    expect(boardItemsOf({ schemaVersion: 3, items: [SCROBBLES, CUSTOM] })).toEqual([SCROBBLES, CUSTOM]);
  });
});

describe("layoutOf", () => {
  it("wraps the items with the schema version and copies them", () => {
    const layout = layoutOf([SCROBBLES]);
    expect(layout).toEqual({ schemaVersion: 3, items: [SCROBBLES] });
    expect(layout.items[0]).not.toBe(SCROBBLES);
  });

  it("saves a custom tile at the position it holds on the board", () => {
    expect(layoutOf([CUSTOM, SCROBBLES]).items).toEqual([CUSTOM, SCROBBLES]);
  });
});

describe("displayedSize", () => {
  it("shows the saved size on a wide board", () => {
    expect(displayedSize(GENRES, "wide")).toBe("L");
  });

  it("shows every builtin tile at M on a narrow board, whatever size it saved", () => {
    expect(displayedSize(GENRES, "narrow")).toBe("M");
    expect(displayedSize(TRENDING, "narrow")).toBe("M");
    expect(displayedSize({ ...SCROBBLES, size: "S" }, "narrow")).toBe("M");
    expect(displayedSize({ kind: "builtin", id: "o", widget: "onRepeat", size: "S" }, "narrow")).toBe("M");
  });
});

describe("packBoard", () => {
  it("places two half-width tiles side by side on one row", () => {
    const tiles = packBoard([SCROBBLES, REQUESTS], "wide", NO_CUSTOM);
    expect(tiles.map(({ col, row, cols, rows }) => ({ col, row, cols, rows }))).toEqual([
      { col: 0, row: 0, cols: 6, rows: 4 },
      { col: 6, row: 0, cols: 6, rows: 4 },
    ]);
  });

  it("drops a full-row tile below the tiles before it", () => {
    const tiles = packBoard([SCROBBLES, TRENDING], "wide", NO_CUSTOM);
    expect(tiles[1]).toMatchObject({ col: 0, row: 4, cols: 12, rows: 4 });
  });

  it("never places a later tile before an earlier one in reading order", () => {
    const tiles = packBoard([SCROBBLES, TRENDING, REQUESTS], "wide", NO_CUSTOM);
    expect(tiles[2]).toMatchObject({ col: 0, row: 8 });
  });

  it("starts a marked tile on a row of its own even where it would fit beside the last one", () => {
    const beside = packBoard([SCROBBLES, REQUESTS], "wide", NO_CUSTOM);
    const below = packBoard([SCROBBLES, { ...REQUESTS, newRow: true }], "wide", NO_CUSTOM);

    expect(beside[1]).toMatchObject({ col: 6, row: 0 });
    expect(below[1]).toMatchObject({ col: 0, row: 4 });
  });

  it("clears the tallest tile above when it starts a new row", () => {
    const tiles = packBoard(
      [{ kind: "builtin", id: "o", widget: "onRepeat", size: "S" }, SCROBBLES, { ...REQUESTS, newRow: true }],
      "wide",
      NO_CUSTOM
    );

    expect(tiles[2]).toMatchObject({ col: 0, row: 7 });
  });

  it("gives a tall tile the rows its widget asks for", () => {
    const tiles = packBoard(
      [{ kind: "builtin", id: "o", widget: "onRepeat", size: "S" }, SCROBBLES],
      "wide",
      NO_CUSTOM
    );
    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 3, rows: 7 });
    expect(tiles[1]).toMatchObject({ col: 3, row: 0, cols: 6, rows: 4 });
  });

  it("stacks every tile full width at M on a narrow board", () => {
    const onRepeat: BoardItem = { kind: "builtin", id: "o", widget: "onRepeat", size: "S" };
    const tiles = packBoard([SCROBBLES, GENRES, onRepeat, TRENDING], "narrow", NO_CUSTOM);
    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 4, rows: 4, size: "M" });
    expect(tiles[1]).toMatchObject({ col: 0, row: 4, cols: 4, rows: 7, size: "M" });
    expect(tiles[2]).toMatchObject({ col: 0, row: 11, cols: 4, rows: 4, size: "M" });
    expect(tiles[3]).toMatchObject({ col: 0, row: 15, cols: 4, rows: 4, size: "M" });
  });

  it.each(EVERY_SIZE)("places every widget saved at %s as M across the whole narrow board", (size) => {
    const items: BoardItem[] = [
      ...BOARD_WIDGET_ORDER.map((widget): BoardItem => ({ kind: "builtin", id: widget, widget, size })),
      { ...CUSTOM, size },
    ];
    for (const tile of packBoard(items, "narrow", NO_CUSTOM)) {
      const { rows } = tileSpanOf(tile.item, "M", "narrow", NO_CUSTOM);
      expect(tile).toMatchObject({ size: "M", col: 0, cols: 4, rows });
    }
  });

  it("returns no tiles for an empty board", () => {
    expect(packBoard([], "wide", NO_CUSTOM)).toEqual([]);
  });

  it("gives a custom tile the height its block asks for at the tile's size", () => {
    const leader = customWidgetsById([createWidget({ view: { block: "leader", action: "play" } })]);
    const tiles = packBoard(
      [
        { ...CUSTOM, size: "L" },
        { ...CUSTOM, id: "c2", size: "S" },
      ],
      "wide",
      leader
    );
    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 12, rows: 7 });
    expect(tiles[1]).toMatchObject({ col: 0, row: 7, cols: 3, rows: 4 });
  });

  it("packs a custom tile whose widget is unknown at the fallback height", () => {
    expect(packBoard([CUSTOM], "wide", NO_CUSTOM)[0]).toMatchObject({ cols: 6, rows: 4 });
  });
});

describe("custom tiles", () => {
  const stat = customWidgetsById([createWidget({ view: { block: "stat", action: "none" } })]);

  it("resizes a custom tile to any size", () => {
    expect(resizeItem([CUSTOM], "c", "L")).toEqual([{ ...CUSTOM, size: "L" }]);
    expect(resizeItem([CUSTOM], "c", "S")).toEqual([{ ...CUSTOM, size: "S" }]);
  });

  it("reads the height from the block of the widget the tile shows", () => {
    expect(tileHeightOf(CUSTOM, "M", stat)).toBe("short");
    expect(tileSpanOf(CUSTOM, "M", "narrow", stat)).toEqual({ cols: 4, rows: 2 });
  });

  it("shows every custom tile at M, full width, on a narrow board", () => {
    expect(displayedSize({ ...CUSTOM, size: "S" }, "narrow")).toBe("M");
    expect(displayedSize({ ...CUSTOM, size: "L" }, "narrow")).toBe("M");
    expect(displayedSize({ ...CUSTOM, size: "S" }, "wide")).toBe("S");
    expect(displayedSize({ ...CUSTOM, size: "L" }, "wide")).toBe("L");
  });

  it("treats two tiles as the same slot only when size and block height agree", () => {
    const both = customWidgetsById([
      createWidget({ id: "w_1", view: { block: "stat", action: "none" } }),
      createWidget({ id: "w_2" }),
    ]);
    expect(sameSlot(CUSTOM, { ...CUSTOM, id: "c2", widgetId: "w_2" }, both)).toBe(false);
    expect(sameSlot(CUSTOM, { ...CUSTOM, id: "c2" }, both)).toBe(true);
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
    expect(resizeItem([SCROBBLES], "s", "L")).toEqual([{ ...SCROBBLES, size: "L" }]);
  });

  it("resizes any builtin tile to the full row", () => {
    expect(resizeItem([REQUESTS], "r", "L")).toEqual([{ ...REQUESTS, size: "L" }]);
  });

  it("leaves other items untouched", () => {
    const next = resizeItem([SCROBBLES, REQUESTS], "s", "L");
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
      { kind: "builtin", id: "m", widget: "mixes", size: "L" },
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
