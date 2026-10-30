import { BOARD_COLUMNS, type BoardDevice, type BoardMetrics } from "@components/BoardGrid";

import type { PlacedTile } from "../ExploreBoard/types";
import type { PreviewFrame } from "../WidgetGallery/types";
import {
  ARRANGE_FRAME_BORDER_PX,
  ARRANGE_FRAME_INSET_PX,
  ARRANGE_MAX_SCALE,
  ARRANGE_MIN_WIDTH_PX,
  ARRANGE_NEW_ROW_SPAN,
} from "./constants";
import type { ArrangeLayout, ArrangeSpace, StartsTileDragEvent } from "./types";

function rowCountOf(tiles: readonly Pick<PlacedTile, "row" | "rows">[]): number {
  return tiles.reduce((rows, tile) => Math.max(rows, tile.row + tile.rows), 0);
}

function scaleToFit(
  space: ArrangeSpace,
  device: BoardDevice,
  boardWidth: number,
  tiles: readonly Pick<PlacedTile, "row" | "rows">[],
  metrics: BoardMetrics
): number {
  const rows = rowCountOf(tiles) + ARRANGE_NEW_ROW_SPAN;
  const frame = ARRANGE_FRAME_INSET_PX * 2 + ARRANGE_FRAME_BORDER_PX * 2;
  const widthFit = (space.width - frame) / boardWidth;
  const boardHeight = rows * metrics.rowPx + (rows - 1) * metrics.gapPx;
  const heightFit = (space.height - frame) / boardHeight;
  const smallest = ARRANGE_MIN_WIDTH_PX[device] / boardWidth;
  return Math.max(0, Math.min(widthFit, ARRANGE_MAX_SCALE, Math.max(smallest, heightFit)));
}

export function arrangeLayoutOf(
  space: ArrangeSpace,
  device: BoardDevice,
  boardWidth: number,
  tiles: readonly Pick<PlacedTile, "row" | "rows">[],
  metrics: BoardMetrics
): ArrangeLayout {
  const scale = boardWidth > 0 ? scaleToFit(space, device, boardWidth, tiles, metrics) : 0;
  return {
    scale,
    width: boardWidth * scale,
    rowPx: metrics.rowPx * scale,
    gapPx: metrics.gapPx * scale,
  };
}

export function arrangeFrameOf(
  tile: Pick<PlacedTile, "cols" | "rows">,
  device: BoardDevice,
  boardWidth: number,
  metrics: BoardMetrics,
  layout: ArrangeLayout
): PreviewFrame {
  const columns = BOARD_COLUMNS[device];
  const column = (boardWidth - (columns - 1) * metrics.gapPx) / columns;
  const stageWidth = tile.cols * column + (tile.cols - 1) * metrics.gapPx;
  const stageHeight = tile.rows * metrics.rowPx + (tile.rows - 1) * metrics.gapPx;
  return {
    stageWidth,
    stageHeight,
    scale: layout.scale,
    width: stageWidth * layout.scale,
    height: stageHeight * layout.scale,
  };
}

export function startsTileDrag(event: StartsTileDragEvent): boolean {
  const { pointerType, target, currentTarget } = event;
  if (pointerType !== "mouse") return false;
  return target instanceof Element && currentTarget.contains(target) && !target.closest("button");
}
