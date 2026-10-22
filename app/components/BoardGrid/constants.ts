import type { BoardSize } from "@hooks/api/queries/board/types";

import type { BoardDevice, BoardHeight, BoardSpan } from "./types";

export const BOARD_WIDE_QUERY = "(min-width: 64rem)";

export const BOARD_COLUMNS: Record<BoardDevice, number> = { wide: 12, narrow: 4 };

export const BOARD_ROW_PX = 72;

export const BOARD_GAP_PX = 16;

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
