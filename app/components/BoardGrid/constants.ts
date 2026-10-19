import type { BoardSize } from "@hooks/api/queries/board/types";

import type { BoardDevice, BoardSpan } from "./types";

export const BOARD_WIDE_QUERY = "(min-width: 64rem)";

export const BOARD_COLUMNS: Record<BoardDevice, number> = { wide: 12, narrow: 4 };

export const BOARD_ROW_PX = 72;

export const BOARD_GAP_PX = 16;

export const FAMILY_SPANS: Record<BoardDevice, Record<BoardSize, BoardSpan>> = {
  wide: {
    S: { cols: 3, rows: 2 },
    C: { cols: 3, rows: 7 },
    M: { cols: 6, rows: 4 },
    "M+": { cols: 6, rows: 7 },
    L: { cols: 12, rows: 4 },
    XL: { cols: 12, rows: 7 },
  },
  narrow: {
    S: { cols: 2, rows: 2 },
    C: { cols: 2, rows: 5 },
    M: { cols: 4, rows: 4 },
    "M+": { cols: 4, rows: 7 },
    L: { cols: 4, rows: 5 },
    XL: { cols: 4, rows: 7 },
  },
};
