import { describe, expect, it } from "vitest";

import type { BoardItem } from "@hooks/api/queries/board/types";

import { BOARD_WIDGET_ORDER, BOARD_WIDGETS, DEFAULT_BOARD } from "../constants";
import {
  appendWidget,
  boardItemsOf,
  boardKeyAction,
  cycleSize,
  displayedSize,
  layoutOf,
  moveItem,
  packBoard,
  placementsById,
  removeItem,
  resizeItem,
  uniqueTileId,
  widgetsOnBoard,
} from "../helpers";

describe("BOARD_WIDGET_ORDER", () => {
  it("lists every registered widget exactly once", () => {
    expect([...BOARD_WIDGET_ORDER].sort()).toEqual(Object.keys(BOARD_WIDGETS).sort());
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

describe("cycleSize", () => {
  it("steps through the offered sizes and wraps at both ends", () => {
    expect(cycleSize(["M", "L", "XL"], "M", 1)).toBe("L");
    expect(cycleSize(["M", "L", "XL"], "XL", 1)).toBe("M");
    expect(cycleSize(["M", "L", "XL"], "M", -1)).toBe("XL");
  });
});

describe("uniqueTileId", () => {
  it("uses the widget key while it is free and numbers it after that", () => {
    expect(uniqueTileId("mixes", [])).toBe("mixes");
    expect(uniqueTileId("mixes", [{ id: "mixes", widget: "mixes", size: "L" }])).toBe("mixes-2");
    expect(
      uniqueTileId("mixes", [
        { id: "mixes", widget: "mixes", size: "L" },
        { id: "mixes-2", widget: "mixes", size: "L" },
      ])
    ).toBe("mixes-3");
  });
});

describe("placementsById", () => {
  it("indexes the packed tiles by item id", () => {
    const placed = packBoard(
      [
        { id: "x", widget: "scrobbles", size: "M" },
        { id: "y", widget: "requests", size: "M" },
      ],
      "wide"
    );

    expect(placementsById(placed).get("y")?.col).toBe(6);
  });
});

const TRENDING: BoardItem = { id: "t", widget: "trending", size: "L" };
const SCROBBLES: BoardItem = { id: "s", widget: "scrobbles", size: "M" };
const REQUESTS: BoardItem = { id: "r", widget: "requests", size: "M" };
const GENRES: BoardItem = { id: "g", widget: "genres", size: "XL" };

describe("boardItemsOf", () => {
  it("returns a fresh copy of the default board when nothing is saved", () => {
    const items = boardItemsOf(null);

    expect(items).toEqual(DEFAULT_BOARD);
    expect(items[0]).not.toBe(DEFAULT_BOARD[0]);
  });

  it("keeps a saved size the widget offers", () => {
    expect(boardItemsOf({ schemaVersion: 1, items: [SCROBBLES] })).toEqual([SCROBBLES]);
  });

  it("falls back to the default size when the saved size is not offered by the widget", () => {
    const items = boardItemsOf({ schemaVersion: 1, items: [{ id: "s", widget: "scrobbles", size: "XL" }] });

    expect(items).toEqual([{ id: "s", widget: "scrobbles", size: "L" }]);
  });

  it("keeps an empty saved board empty", () => {
    expect(boardItemsOf({ schemaVersion: 1, items: [] })).toEqual([]);
  });
});

describe("layoutOf", () => {
  it("wraps the items with the schema version and copies them", () => {
    const layout = layoutOf([SCROBBLES]);

    expect(layout).toEqual({ schemaVersion: 1, items: [SCROBBLES] });
    expect(layout.items[0]).not.toBe(SCROBBLES);
  });
});

describe("displayedSize", () => {
  it("shows the saved size on a wide board", () => {
    expect(displayedSize(GENRES, "wide")).toBe("XL");
  });

  it("applies the narrow override of the widget on a narrow board", () => {
    expect(displayedSize(GENRES, "narrow")).toBe("M+");
    expect(displayedSize({ ...SCROBBLES, size: "L" }, "narrow")).toBe("M");
  });

  it("keeps the saved size on a narrow board when the widget has no override for it", () => {
    expect(displayedSize(TRENDING, "narrow")).toBe("L");
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

  it("drops a full-row tile below the tiles before it", () => {
    const tiles = packBoard([SCROBBLES, TRENDING], "wide");

    expect(tiles[1]).toMatchObject({ col: 0, row: 4, cols: 12, rows: 4 });
  });

  it("never places a later tile before an earlier one in reading order", () => {
    const tiles = packBoard([SCROBBLES, TRENDING, REQUESTS], "wide");

    expect(tiles[2]).toMatchObject({ col: 0, row: 8 });
  });

  it("stacks every tile full width on a narrow board and applies narrow overrides", () => {
    const tiles = packBoard([SCROBBLES, GENRES], "narrow");

    expect(tiles[0]).toMatchObject({ col: 0, row: 0, cols: 4, rows: 4, size: "M" });
    expect(tiles[1]).toMatchObject({ col: 0, row: 4, cols: 4, rows: 7, size: "M+" });
  });

  it("returns no tiles for an empty board", () => {
    expect(packBoard([], "wide")).toEqual([]);
  });
});

describe("moveItem", () => {
  const items = [TRENDING, SCROBBLES, REQUESTS];

  it("moves an item to the requested index", () => {
    expect(moveItem(items, "t", 2).map((item) => item.id)).toEqual(["s", "r", "t"]);
    expect(moveItem(items, "r", 0).map((item) => item.id)).toEqual(["r", "t", "s"]);
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
  it("changes the size when the widget offers it", () => {
    expect(resizeItem([SCROBBLES], "s", "L")).toEqual([{ ...SCROBBLES, size: "L" }]);
  });

  it("ignores a size the widget does not offer", () => {
    expect(resizeItem([SCROBBLES], "s", "XL")).toEqual([SCROBBLES]);
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
    expect(appendWidget([SCROBBLES], "mixes", "m")).toEqual([SCROBBLES, { id: "m", widget: "mixes", size: "XL" }]);
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
