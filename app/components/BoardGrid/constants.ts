import type { BoardDensity, BoardRowHeight, BoardSize, BoardTextScale } from "@hooks/api/queries/board/types";

import type { BoardDevice, BoardMetrics } from "./types";

export const BOARD_WIDE_QUERY = "(min-width: 48rem)";

export const BOARD_COLUMNS: Record<BoardDevice, number> = { wide: 12, narrow: 4 };

export const BOARD_ROW_PX = 72;

export const BOARD_GAP_PX = 16;

export const BOARD_DENSITY_METRICS: Record<BoardDensity, BoardMetrics> = {
  compact: { rowPx: 64, gapPx: 12 },
  comfortable: { rowPx: BOARD_ROW_PX, gapPx: BOARD_GAP_PX },
  spacious: { rowPx: 80, gapPx: 24 },
};

export const BOARD_ROW_UNITS: Record<BoardRowHeight, number> = { short: 3, regular: 4, tall: 6 };

export const DEFAULT_BOARD_ROW_HEIGHT: BoardRowHeight = "regular";

export const BOARD_TEXT_SCALE: Record<BoardTextScale, number> = { small: 0.92, default: 1, large: 1.08 };
export const BOARD_TYPE_STEPS_REM = {
  xs: 0.75,
  sm: 0.875,
  base: 1,
  lg: 1.125,
  xl: 1.25,
  "2xl": 1.5,
  "3xl": 1.875,
  "4xl": 2.25,
} as const;

export const BOARD_SIZE_COLS: Record<BoardDevice, Record<BoardSize, number>> = {
  wide: { S: 3, M: 6, L: 9, XL: 12 },
  narrow: { S: 2, M: 4, L: 4, XL: 4 },
};
