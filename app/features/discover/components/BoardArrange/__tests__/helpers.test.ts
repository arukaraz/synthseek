import { describe, expect, it } from "vitest";

import { ARRANGE_BAR_PX, ARRANGE_BOARD_WIDTH, ARRANGE_MAX_SCALE, ARRANGE_MIN_SCALE } from "../constants";
import { arrangeFrameOf, arrangeLayoutOf, startsTileDrag } from "../helpers";

const METRICS = { rowPx: 72, gapPx: 16 };
const SPACE = { width: 1100, height: 700 };

function stacked(...heights: number[]) {
  let row = 0;
  return heights.map((rows) => {
    const tile = { row, rows };
    row += rows;
    return tile;
  });
}

function heightOf(layout: ReturnType<typeof arrangeLayoutOf>): number {
  const rows = layout.rowHeights.length;
  return layout.rowHeights.reduce((total, height) => total + height, 0) + (rows - 1) * layout.gapPx;
}

describe("arrangeLayoutOf", () => {
  it("shrinks a tall board until every row and every bar fits the space", () => {
    const layout = arrangeLayoutOf(SPACE, "wide", stacked(4, 4, 4), METRICS);

    expect(heightOf(layout)).toBeCloseTo(SPACE.height);
    expect(layout.scale).toBeGreaterThan(ARRANGE_MIN_SCALE.wide);
    expect(layout.scale).toBeLessThan(ARRANGE_MAX_SCALE);
  });

  it("reserves a bar once per tile start, not once per row", () => {
    const { rowHeights, scale } = arrangeLayoutOf(SPACE, "wide", stacked(7, 2), METRICS);
    const plain = METRICS.rowPx * scale;

    expect(rowHeights[0]).toBeCloseTo(plain + ARRANGE_BAR_PX);
    expect(rowHeights.slice(1, 7).every((height) => Math.abs(height - plain) < 0.001)).toBe(true);
    expect(rowHeights[7]).toBeCloseTo(plain + ARRANGE_BAR_PX);
  });

  it("does not go below the scale a tile stays usable at, and lets the rest scroll", () => {
    expect(arrangeLayoutOf(SPACE, "wide", stacked(30, 30), METRICS).scale).toBe(ARRANGE_MIN_SCALE.wide);
  });

  it("never grows past the largest scale on a short board", () => {
    expect(arrangeLayoutOf(SPACE, "wide", stacked(4), METRICS).scale).toBe(ARRANGE_MAX_SCALE);
  });

  it("never draws wider than the space it was given", () => {
    const width = ARRANGE_BOARD_WIDTH.narrow * (ARRANGE_MIN_SCALE.narrow / 2);

    expect(arrangeLayoutOf({ width, height: 700 }, "narrow", stacked(40), METRICS).width).toBeCloseTo(width);
  });

  it("waits for a measured space and copes with an empty board", () => {
    expect(arrangeLayoutOf({ width: 0, height: 0 }, "wide", stacked(4), METRICS).scale).toBe(0);
    expect(arrangeLayoutOf(SPACE, "wide", [], METRICS).rowHeights).toEqual([]);
  });
});

describe("arrangeFrameOf", () => {
  it("draws the widget at its board width and fits it under the tile's bar", () => {
    const tile = { cols: 6, row: 0, rows: 4 };
    const layout = arrangeLayoutOf(SPACE, "wide", [tile], METRICS);
    const frame = arrangeFrameOf(tile, "wide", METRICS, layout);
    const column = (1200 - 11 * 16) / 12;

    expect(frame.stageWidth).toBeCloseTo(6 * column + 5 * 16);
    expect(frame.width).toBeCloseTo(frame.stageWidth * layout.scale);
    expect(frame.stageHeight * frame.scale).toBeCloseTo(frame.height);
  });

  it("gives every tile at least its board height, a short one included", () => {
    const tile = { cols: 3, row: 0, rows: 2 };
    const layout = arrangeLayoutOf(SPACE, "wide", [tile], METRICS);

    expect(arrangeFrameOf(tile, "wide", METRICS, layout).stageHeight).toBeCloseTo(2 * 72 + 16);
  });
});

describe("startsTileDrag", () => {
  it("takes a mouse press on the tile but leaves its buttons and touch scrolling alone", () => {
    const tile = document.createElement("div");
    const button = document.createElement("button");
    tile.append(button);

    expect(startsTileDrag({ pointerType: "mouse", target: tile })).toBe(true);
    expect(startsTileDrag({ pointerType: "mouse", target: button })).toBe(false);
    expect(startsTileDrag({ pointerType: "touch", target: tile })).toBe(false);
  });
});
