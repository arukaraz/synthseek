import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTOSCROLL_EDGE_PX, AUTOSCROLL_STEP_PX, BOARD_FLIP_MS, BOARD_FLIP_SETTLE_MS } from "../constants";
import {
  autoscrollDelta,
  clipParentOf,
  createGhost,
  focusBoardTile,
  insertsBefore,
  measureTiles,
  moveToNewRow,
  openSpaceTarget,
  placeGhost,
  reorderAround,
  sameOrder,
  sameTarget,
  scrollParentOf,
  slideTiles,
  swapItems,
  tileUnderPointer,
  travelled,
  viewportOf,
} from "../helpers";
import type { BoardDragItem } from "../types";

const A: BoardDragItem = { id: "a" };
const B: BoardDragItem = { id: "b" };
const C: BoardDragItem = { id: "c" };
const D: BoardDragItem = { id: "d" };

function ids(list: readonly { id: string }[]): string {
  return list.map((item) => item.id).join("");
}

describe("reorderAround", () => {
  it("puts the dragged item before the target", () => {
    expect(ids(reorderAround([A, B, C, D], "d", "b", true))).toBe("adbc");
  });

  it("puts the dragged item after the target", () => {
    expect(ids(reorderAround([A, B, C, D], "a", "c", false))).toBe("bcad");
  });

  it("returns an unchanged copy when the item is its own target or unknown", () => {
    const list = [A, B, C];

    expect(ids(reorderAround(list, "b", "b", true))).toBe("abc");
    expect(ids(reorderAround(list, "z", "b", true))).toBe("abc");
    expect(ids(reorderAround(list, "a", "z", true))).toBe("abc");
    expect(reorderAround(list, "z", "b", true)).not.toBe(list);
  });
});

describe("sameOrder", () => {
  it("compares ids position by position", () => {
    expect(sameOrder([A, B], [{ id: "a" }, { id: "b" }])).toBe(true);
    expect(sameOrder([A, B], [B, A])).toBe(false);
    expect(sameOrder([A, B], [A])).toBe(false);
  });
});

describe("insertsBefore", () => {
  const target = { left: 100, top: 0, width: 200, height: 100 };

  it("splits a target in the placeholder's row by its horizontal middle", () => {
    const sameRow = { left: 0, top: 20, width: 50, height: 100 };

    expect(insertsBefore(target, { x: 150, y: 90 }, sameRow)).toBe(true);
    expect(insertsBefore(target, { x: 250, y: 10 }, sameRow)).toBe(false);
  });

  it("splits a target in another row by its vertical middle", () => {
    const otherRow = { left: 0, top: 300, width: 50, height: 100 };

    expect(insertsBefore(target, { x: 290, y: 30 }, otherRow)).toBe(true);
    expect(insertsBefore(target, { x: 110, y: 70 }, otherRow)).toBe(false);
  });
});

describe("autoscrollDelta", () => {
  const viewport = { top: 100, bottom: 900 };

  it("scrolls up near the top edge, down near the bottom edge, and not in between", () => {
    expect(autoscrollDelta(100 + AUTOSCROLL_EDGE_PX - 1, viewport)).toBe(-AUTOSCROLL_STEP_PX);
    expect(autoscrollDelta(900 - AUTOSCROLL_EDGE_PX + 1, viewport)).toBe(AUTOSCROLL_STEP_PX);
    expect(autoscrollDelta(500, viewport)).toBe(0);
  });
});

describe("scrollParentOf and viewportOf", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("bounds a board by its overflow container even while it has nothing to scroll", () => {
    const idle = document.createElement("div");
    idle.style.overflowY = "auto";
    const tile = document.createElement("div");
    idle.appendChild(tile);
    document.body.appendChild(idle);

    expect(clipParentOf(tile)).toBe(idle);
    expect(scrollParentOf(tile)).toBe(document.documentElement);
  });

  it("finds the nearest ancestor that actually scrolls", () => {
    const scroller = document.createElement("div");
    scroller.style.overflowY = "auto";
    Object.defineProperty(scroller, "scrollHeight", { value: 2000 });
    Object.defineProperty(scroller, "clientHeight", { value: 500 });
    const idle = document.createElement("div");
    idle.style.overflowY = "auto";
    const tile = document.createElement("div");
    idle.appendChild(tile);
    scroller.appendChild(idle);
    document.body.appendChild(scroller);

    expect(scrollParentOf(tile)).toBe(scroller);
  });

  it("falls back to the document and measures it by the window", () => {
    const tile = document.createElement("div");
    document.body.appendChild(tile);

    const scroller = scrollParentOf(tile);

    expect(scroller).toBe(document.documentElement);
    expect(viewportOf(scroller)).toEqual({ top: 0, bottom: window.innerHeight });
  });

  it("measures a scrolling element by its own box", () => {
    const scroller = document.createElement("div");
    scroller.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 80, width: 400, height: 600 });

    expect(viewportOf(scroller)).toEqual({ top: 80, bottom: 680 });
  });
});

describe("tileUnderPointer", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("returns the first tile under the point other than the dragged one", () => {
    document.body.innerHTML =
      '<div data-board-tile="a"><span id="inner-a"></span></div><div data-board-tile="b"><span id="inner-b"></span></div>';
    const innerA = document.getElementById("inner-a");
    const innerB = document.getElementById("inner-b");
    if (!innerA || !innerB) throw new Error("fixture missing");
    document.elementsFromPoint = vi.fn(() => [innerA, innerB]);

    expect(tileUnderPointer({ x: 1, y: 1 }, "a", document.body)?.dataset.boardTile).toBe("b");
    expect(tileUnderPointer({ x: 1, y: 1 }, "z", document.body)?.dataset.boardTile).toBe("a");
  });

  it("returns null when no tile is under the point", () => {
    document.elementsFromPoint = vi.fn(() => [document.body]);

    expect(tileUnderPointer({ x: 1, y: 1 }, "a", document.body)).toBeNull();
  });

  it("ignores a tile of another grid under the same point, such as the board behind a dialog", () => {
    document.body.innerHTML =
      '<div id="dialog"><div data-board-tile="a"></div></div><div id="board"><div data-board-tile="b"></div></div>';
    const behind = document.querySelector("#board [data-board-tile]");
    if (!behind) throw new Error("fixture missing");
    document.elementsFromPoint = vi.fn(() => [behind]);

    expect(tileUnderPointer({ x: 1, y: 1 }, "a", document.getElementById("dialog"))).toBeNull();
  });
});

describe("ghost", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("clones the tile into a fixed, hidden, unaddressable copy at the pointer", () => {
    const tile = document.createElement("div");
    tile.setAttribute("data-board-tile", "a");
    tile.tabIndex = 0;
    tile.className = "tile";
    tile.getBoundingClientRect = () => DOMRect.fromRect({ x: 10, y: 20, width: 300, height: 200 });
    document.body.appendChild(tile);

    const ghost = createGhost(tile);
    if (!ghost) throw new Error("no ghost");
    placeGhost(ghost, { x: 110, y: 70 }, { x: 10, y: 20 });

    expect(ghost.parentElement).toBe(document.body);
    expect(ghost.hasAttribute("data-board-tile")).toBe(false);
    expect(ghost.hasAttribute("tabindex")).toBe(false);
    expect(ghost.getAttribute("aria-hidden")).toBe("true");
    expect(ghost.className).toContain("tile");
    expect(ghost.className).toContain("pointer-events-none");
    expect(ghost.style.position).toBe("fixed");
    expect(ghost.style.width).toBe("300px");
    expect(ghost.style.left).toBe("0px");
    expect(ghost.style.top).toBe("0px");
  });
});

describe("swapItems", () => {
  it("exchanges the dragged item and its target, leaving everything else in place", () => {
    expect(ids(swapItems([A, B, C, D], "a", "c"))).toBe("cbad");
    expect(ids(swapItems([A, B, C], "a", "a"))).toBe("abc");
    expect(ids(swapItems([A, B, C], "a", "zz"))).toBe("abc");
  });
});

describe("sameTarget", () => {
  it("is true only for the same tile on the same side", () => {
    const tile = { kind: "tile", id: "b", before: true } as const;

    expect(sameTarget(tile, { kind: "tile", id: "b", before: true })).toBe(true);
    expect(sameTarget(tile, { kind: "tile", id: "b", before: false })).toBe(false);
    expect(sameTarget(tile, { kind: "space", id: "b", before: true })).toBe(false);
    expect(sameTarget(tile, { kind: "newRow" })).toBe(false);
    expect(sameTarget({ kind: "newRow" }, { kind: "newRow" })).toBe(true);
    expect(sameTarget(null, tile)).toBe(false);
  });
});

describe("new rows", () => {
  it("sends the dragged item to the end of the board on a row of its own", () => {
    const next = moveToNewRow([A, B, C], "a");

    expect(ids(next)).toBe("bca");
    expect(next[2]?.newRow).toBe(true);
  });

  it("drops the new row of an item placed beside another one", () => {
    const next = reorderAround([{ ...A, newRow: true }, B, C], "a", "c", true);

    expect(ids(next)).toBe("bac");
    expect(next[1]?.newRow).toBeFalsy();
  });

  it("leaves a new row on its slot when two items swap, so the layout around them holds", () => {
    const next = swapItems([A, { ...B, newRow: true }, C], "a", "b");

    expect(ids(next)).toBe("bac");
    expect(next[0]?.newRow).toBeFalsy();
    expect(next[1]?.newRow).toBe(true);
  });

  it("counts a new row as a change, so a drop that only adds one still saves", () => {
    expect(sameOrder([A, B], [A, { ...B, newRow: true }])).toBe(false);
  });
});

describe("openSpaceTarget", () => {
  const box = (left: number, top: number, width = 100, height = 100) => ({ left, top, width, height });
  const space = {
    tiles: [
      { id: "a", rect: box(0, 0) },
      { id: "b", rect: box(110, 0) },
      { id: "c", rect: box(0, 110) },
    ],
    grid: box(0, 0, 330, 210),
    viewport: { top: 0, bottom: 500 },
    placeholder: box(220, 0),
  };

  it("takes a cell with nothing in it as the place after the tile before it", () => {
    expect(openSpaceTarget({ x: 150, y: 150 }, space)).toEqual({ kind: "space", id: "c", before: false });
  });

  it("starts a new row below the last tile", () => {
    expect(openSpaceTarget({ x: 50, y: 300 }, space)).toEqual({ kind: "newRow" });
  });

  it("does nothing while the pointer is on the dragged tile's own slot", () => {
    expect(openSpaceTarget({ x: 250, y: 50 }, space)).toBeNull();
  });

  it("ignores a pointer beside the board, above it or below what the scroller shows", () => {
    expect(openSpaceTarget({ x: 400, y: 150 }, space)).toBeNull();
    expect(openSpaceTarget({ x: 50, y: -10 }, space)).toBeNull();
    expect(openSpaceTarget({ x: 50, y: 600 }, space)).toBeNull();
  });
});

describe("travelled", () => {
  it("measures the straight-line distance between two pointer positions", () => {
    expect(travelled({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe("slideTiles", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function boardWith(positions: Record<string, number>): HTMLElement {
    document.body.innerHTML = '<div id="board"><div data-board-tile="a"></div><div data-board-tile="b"></div></div>';
    HTMLElement.prototype.animate = vi.fn();
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function leftOf(this: HTMLElement) {
      return positions[this.dataset.boardTile ?? ""] ?? 0;
    });
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(0);
    const board = document.getElementById("board");
    if (!board) throw new Error("board missing");
    return board;
  }

  it("slides every tile that moved from where it was, except the one being dragged, and says when it settles", () => {
    const positions = { a: 0, b: 120 };
    const board = boardWith(positions);
    const before = measureTiles(board);
    positions.a = 120;
    positions.b = 0;
    const animate = vi.spyOn(HTMLElement.prototype, "animate");

    const result = slideTiles(board, before, "a", 1000);

    expect(result.slidUntil).toBe(1000 + BOARD_FLIP_SETTLE_MS);
    expect(result.rects.size).toBe(2);
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.contexts[0]).toBe(board.querySelector('[data-board-tile="b"]'));
    expect(animate.mock.calls[0]?.[0]).toEqual([
      { transform: "translate(120px, 0px)" },
      { transform: "translate(0px, 0px)" },
    ]);
  });

  it("adds a slide to one already running, so a tile sent elsewhere mid-flight never jumps", () => {
    const positions = { a: 0, b: 120 };
    const board = boardWith(positions);
    const before = measureTiles(board);
    positions.b = 0;
    const animate = vi.spyOn(HTMLElement.prototype, "animate");

    slideTiles(board, before, null, 1000);

    expect(animate.mock.calls[0]?.[1]).toMatchObject({ duration: BOARD_FLIP_MS, composite: "add" });
  });

  it("ends at once when nothing moved", () => {
    const board = boardWith({ a: 0, b: 120 });
    const before = measureTiles(board);

    expect(slideTiles(board, before, null, 1000).slidUntil).toBe(1000);
  });
});

describe("focusBoardTile", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("focuses the tile with the id on the next frame", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    document.body.innerHTML = '<div data-board-tile="a b" tabindex="0"></div>';

    focusBoardTile("a b");

    expect(document.activeElement?.getAttribute("data-board-tile")).toBe("a b");
  });
});
