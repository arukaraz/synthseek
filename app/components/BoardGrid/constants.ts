import type { BoardDensity, BoardSize, BoardTextScale } from "@hooks/api/queries/board/types";

import type { BoardDevice, BoardHeight, BoardMetrics, BoardSpan } from "./types";

export const BOARD_WIDE_QUERY = "(min-width: 64rem)";

export const BOARD_COLUMNS: Record<BoardDevice, number> = { wide: 12, narrow: 4 };

export const BOARD_ROW_PX = 72;

export const BOARD_GAP_PX = 16;

export const BOARD_DENSITY_METRICS: Record<BoardDensity, BoardMetrics> = {
  compact: { rowPx: 64, gapPx: 12 },
  comfortable: { rowPx: BOARD_ROW_PX, gapPx: BOARD_GAP_PX },
  spacious: { rowPx: 80, gapPx: 24 },
};

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

export const BOARD_SPANS: Record<BoardDevice, Record<BoardSize, Record<BoardHeight, BoardSpan>>> = {
  wide: {
    S: { short: { cols: 3, rows: 2 }, regular: { cols: 3, rows: 4 }, tall: { cols: 3, rows: 7 } },
    M: { short: { cols: 6, rows: 2 }, regular: { cols: 6, rows: 4 }, tall: { cols: 6, rows: 7 } },
    L: { short: { cols: 12, rows: 2 }, regular: { cols: 12, rows: 4 }, tall: { cols: 12, rows: 7 } },
  },
  narrow: {
    S: { short: { cols: 2, rows: 2 }, regular: { cols: 2, rows: 4 }, tall: { cols: 2, rows: 5 } },
    M: { short: { cols: 4, rows: 2 }, regular: { cols: 4, rows: 4 }, tall: { cols: 4, rows: 7 } },
    L: { short: { cols: 4, rows: 2 }, regular: { cols: 4, rows: 5 }, tall: { cols: 4, rows: 7 } },
  },
};
