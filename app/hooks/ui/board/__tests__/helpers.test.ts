import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTOSCROLL_EDGE_PX, AUTOSCROLL_STEP_PX } from "../constants";
import {
  autoscrollDelta,
  createGhost,
  focusBoardTile,
  insertsBefore,
  placeGhost,
  reorderAround,
  sameOrder,
  scrollParentOf,
  tileUnderPointer,
  viewportOf,
} from "../helpers";

const A = { id: "a" };
const B = { id: "b" };
const C = { id: "c" };
const D = { id: "d" };

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

    expect(tileUnderPointer({ x: 1, y: 1 }, "a")?.dataset.boardTile).toBe("b");
    expect(tileUnderPointer({ x: 1, y: 1 }, "z")?.dataset.boardTile).toBe("a");
  });

  it("returns null when no tile is under the point", () => {
    document.elementsFromPoint = vi.fn(() => [document.body]);

    expect(tileUnderPointer({ x: 1, y: 1 }, "a")).toBeNull();
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
    expect(ghost.style.left).toBe("100px");
    expect(ghost.style.top).toBe("50px");
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
