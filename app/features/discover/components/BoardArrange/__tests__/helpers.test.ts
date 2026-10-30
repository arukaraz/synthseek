import { describe, expect, it } from "vitest";

import {
  ARRANGE_FRAME_BORDER_PX,
  ARRANGE_FRAME_INSET_PX,
  ARRANGE_MAX_SCALE,
  ARRANGE_MIN_WIDTH_PX,
  ARRANGE_NEW_ROW_SPAN,
} from "../constants";
import { arrangeFrameOf, arrangeLayoutOf, startsTileDrag } from "../helpers";

const METRICS = { rowPx: 72, gapPx: 16 };
const SPACE = { width: 1100, height: 700 };
const BOARD = 1200;
const NARROW_BOARD = 390;
const FRAME = ARRANGE_FRAME_INSET_PX * 2 + ARRANGE_FRAME_BORDER_PX * 2;

function stacked(...heights: number[]) {
  let row = 0;
  return heights.map((rows) => {
    const tile = { row, rows };
    row += rows;
    return tile;
  });
}

function heightOf(layout: ReturnType<typeof arrangeLayoutOf>, rows: number): number {
  return rows * layout.rowPx + (rows - 1) * layout.gapPx;
}

describe("arrangeLayoutOf", () => {
  it("shrinks a tall board until every row and the new-row zone fit the framed space", () => {
    const layout = arrangeLayoutOf(SPACE, "wide", BOARD, stacked(4, 4, 4), METRICS);

    expect(heightOf(layout, 12 + ARRANGE_NEW_ROW_SPAN)).toBeCloseTo(SPACE.height - FRAME);
    expect(layout.width).toBeGreaterThan(ARRANGE_MIN_WIDTH_PX.wide);
    expect(layout.scale).toBeLessThan(ARRANGE_MAX_SCALE);
  });

  it("scales rows and gaps by one factor, so the rows stay as even as on the board", () => {
    const layout = arrangeLayoutOf(SPACE, "wide", BOARD, stacked(7, 2), METRICS);

    expect(layout.rowPx).toBeCloseTo(METRICS.rowPx * layout.scale);
    expect(layout.gapPx).toBeCloseTo(METRICS.gapPx * layout.scale);
  });

  it("does not go below the width a tile stays usable at, and lets the rest scroll", () => {
    expect(arrangeLayoutOf(SPACE, "wide", BOARD, stacked(30, 30), METRICS).width).toBeCloseTo(
      ARRANGE_MIN_WIDTH_PX.wide
    );
  });

  it("never grows past the largest scale on a short board", () => {
    expect(arrangeLayoutOf(SPACE, "wide", BOARD, stacked(2), METRICS).scale).toBe(ARRANGE_MAX_SCALE);
  });

  it("never draws wider than the space it was given", () => {
    const width = ARRANGE_MIN_WIDTH_PX.narrow / 2 + FRAME;
    const layout = arrangeLayoutOf({ width, height: 700 }, "narrow", NARROW_BOARD, stacked(40), METRICS);

    expect(layout.width).toBeCloseTo(width - FRAME);
  });

  it("waits for a measured space and a measured board", () => {
    expect(arrangeLayoutOf({ width: 0, height: 0 }, "wide", BOARD, stacked(4), METRICS).scale).toBe(0);
    expect(arrangeLayoutOf(SPACE, "wide", 0, stacked(4), METRICS).scale).toBe(0);
  });

  it("copes with an empty board", () => {
    expect(arrangeLayoutOf(SPACE, "wide", BOARD, [], METRICS).scale).toBeGreaterThan(0);
  });
});

describe("arrangeFrameOf", () => {
  it("draws the widget at its real board size, scaled to the whole tile", () => {
    const tile = { cols: 6, rows: 4 };
    const layout = arrangeLayoutOf(SPACE, "wide", BOARD, [{ row: 0, rows: 4 }], METRICS);
    const frame = arrangeFrameOf(tile, "wide", BOARD, METRICS, layout);
    const column = (BOARD - 11 * 16) / 12;

    expect(frame.stageWidth).toBeCloseTo(6 * column + 5 * 16);
    expect(frame.stageHeight).toBeCloseTo(4 * 72 + 3 * 16);
    expect(frame.width).toBeCloseTo(frame.stageWidth * layout.scale);
    expect(frame.height).toBeCloseTo(frame.stageHeight * layout.scale);
  });
});

describe("startsTileDrag", () => {
  it("takes a mouse press on the tile but leaves its buttons and touch scrolling alone", () => {
    const tile = document.createElement("div");
    const button = document.createElement("button");
    tile.append(button);

    expect(startsTileDrag({ pointerType: "mouse", target: tile, currentTarget: tile })).toBe(true);
    expect(startsTileDrag({ pointerType: "mouse", target: button, currentTarget: tile })).toBe(false);
    expect(startsTileDrag({ pointerType: "touch", target: tile, currentTarget: tile })).toBe(false);
  });

  it("ignores a press that reached the tile from a menu portalled out of it", () => {
    const tile = document.createElement("div");
    const menuItem = document.createElement("div");

    expect(startsTileDrag({ pointerType: "mouse", target: menuItem, currentTarget: tile })).toBe(false);
  });
});
