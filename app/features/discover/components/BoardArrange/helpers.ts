import { BOARD_COLUMNS, type BoardDevice, type BoardMetrics } from "@components/BoardGrid";

import type { PlacedTile } from "../ExploreBoard/types";
import type { PreviewFrame } from "../WidgetGallery/types";
import { ARRANGE_BAR_PX, ARRANGE_BOARD_WIDTH, ARRANGE_MAX_SCALE, ARRANGE_MIN_SCALE } from "./constants";
import type { ArrangeLayout, ArrangeSpace, StartsTileDragEvent } from "./types";

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function rowCountOf(tiles: readonly Pick<PlacedTile, "row" | "rows">[]): number {
  return tiles.reduce((rows, tile) => Math.max(rows, tile.row + tile.rows), 0);
}

function barsOf(tiles: readonly Pick<PlacedTile, "row">[]): Set<number> {
  return new Set(tiles.map((tile) => tile.row));
}

function scaleToFit(
  space: ArrangeSpace,
  device: BoardDevice,
  tiles: readonly Pick<PlacedTile, "row" | "rows">[],
  metrics: BoardMetrics
): number {
  const rows = rowCountOf(tiles);
  const widthFit = space.width / ARRANGE_BOARD_WIDTH[device];
  const boardHeight = rows * metrics.rowPx + Math.max(0, rows - 1) * metrics.gapPx;
  const heightFit =
    boardHeight > 0 ? (space.height - barsOf(tiles).size * ARRANGE_BAR_PX) / boardHeight : ARRANGE_MAX_SCALE;
  return Math.min(widthFit, ARRANGE_MAX_SCALE, Math.max(ARRANGE_MIN_SCALE[device], heightFit));
}

export function arrangeLayoutOf(
  space: ArrangeSpace,
  device: BoardDevice,
  tiles: readonly Pick<PlacedTile, "row" | "rows">[],
  metrics: BoardMetrics
): ArrangeLayout {
  const scale = scaleToFit(space, device, tiles, metrics);
  const bars = barsOf(tiles);
  return {
    scale,
    width: ARRANGE_BOARD_WIDTH[device] * scale,
    gapPx: metrics.gapPx * scale,
    rowHeights: Array.from(
      { length: rowCountOf(tiles) },
      (_, row) => metrics.rowPx * scale + (bars.has(row) ? ARRANGE_BAR_PX : 0)
    ),
  };
}

export function arrangeFrameOf(
  tile: Pick<PlacedTile, "cols" | "row" | "rows">,
  device: BoardDevice,
  metrics: BoardMetrics,
  layout: ArrangeLayout
): PreviewFrame {
  const columns = BOARD_COLUMNS[device];
  const column = (ARRANGE_BOARD_WIDTH[device] - (columns - 1) * metrics.gapPx) / columns;
  const stageWidth = tile.cols * column + (tile.cols - 1) * metrics.gapPx;
  const tileHeight = sum(layout.rowHeights.slice(tile.row, tile.row + tile.rows)) + (tile.rows - 1) * layout.gapPx;
  const height = tileHeight - ARRANGE_BAR_PX;
  return {
    stageWidth,
    stageHeight: height / layout.scale,
    scale: layout.scale,
    width: stageWidth * layout.scale,
    height,
  };
}

export function startsTileDrag(event: StartsTileDragEvent): boolean {
  if (event.pointerType !== "mouse") return false;
  return !(event.target instanceof Element && event.target.closest("button"));
}
