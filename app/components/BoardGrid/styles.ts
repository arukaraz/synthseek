import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import { BOARD_COLUMNS, BOARD_GAP_PX, BOARD_ROW_PX } from "./constants";
import type { BoardDevice } from "./types";

export const boardGrid = cva(
  "grid auto-rows-[var(--board-row)] grid-cols-[repeat(var(--board-cols),minmax(0,1fr))] gap-[var(--board-gap)]"
);

export function boardGridVars(device: BoardDevice): CssVars {
  return {
    "--board-cols": String(BOARD_COLUMNS[device]),
    "--board-row": `${BOARD_ROW_PX}px`,
    "--board-gap": `${BOARD_GAP_PX}px`,
  };
}
