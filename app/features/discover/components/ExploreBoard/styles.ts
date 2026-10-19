import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import { BOARD_COLUMNS } from "./constants";
import type { BoardDevice, PlacedTile } from "./types";

export const boardRoot = cva("flex flex-col gap-4");

export const boardToolbar = cva("flex min-h-9 items-center justify-end gap-2");

export const boardHint = cva("text-fg/60 mr-auto text-xs sm:text-sm");

export const boardGrid = cva("grid auto-rows-[4.5rem] grid-cols-[repeat(var(--board-cols),minmax(0,1fr))] gap-4");

export const boardTile = cva(
  "relative flex min-h-0 min-w-0 rounded-xl [grid-column:var(--tile-col)] [grid-row:var(--tile-row)] [&>*]:min-h-0 [&>*]:size-full",
  {
    variants: {
      editing: {
        true: "outline-primary-400/50 outline-2 outline-offset-2 outline-dashed",
        false: "",
      },
    },
    defaultVariants: { editing: false },
  }
);

export const editIconFrame = cva("relative inline-flex size-4 shrink-0");

export const editIconPen = cva("bg-surface absolute -right-1 -bottom-1 size-2.5 rounded-sm");

export function boardGridVars(device: BoardDevice): CssVars {
  return { "--board-cols": String(BOARD_COLUMNS[device]) };
}

export function tileVars(tile: PlacedTile): CssVars {
  return {
    "--tile-col": `${tile.col + 1} / span ${tile.cols}`,
    "--tile-row": `${tile.row + 1} / span ${tile.rows}`,
  };
}
