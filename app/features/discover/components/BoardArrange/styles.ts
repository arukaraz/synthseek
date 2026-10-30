import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import { boardGridVars, type BoardDevice } from "@components/BoardGrid";
import type { BoardAppearance } from "@hooks/api/queries/board/types";

import type { ArrangeLayout } from "./types";

export const arrangeHeader = cva("flex flex-col gap-1 px-4 pt-4 pr-14 pb-3 outline-none sm:pt-6 sm:pr-16 sm:pl-6");

export const arrangeHint = cva("text-fg/60 text-sm");

export const arrangeFrame = cva("min-h-0 flex-1 px-4 pb-4 sm:px-6");

export const arrangeViewport = cva("h-full overflow-y-auto");

export const arrangeRoot = cva("flex justify-center");

export const arrangeGrid = cva(
  "grid w-[var(--arrange-w)] [grid-template-rows:var(--arrange-rows)] grid-cols-[repeat(var(--board-cols),minmax(0,1fr))] gap-[var(--board-gap)]"
);

export const arrangeEmpty = cva("text-fg/60 py-12 text-center text-sm");

export const arrangeTile = cva(
  "relative flex min-h-0 min-w-0 cursor-grab flex-col overflow-hidden rounded-lg outline-none select-none [grid-column:var(--tile-col)] [grid-row:var(--tile-row)] focus-visible:ring-primary-400 focus-visible:ring-2",
  {
    variants: {
      dragging: {
        true: "bg-primary-500/10 outline-primary-400 outline-2 outline-dashed",
        false: "border-fg/10 border",
      },
    },
    defaultVariants: { dragging: false },
  }
);

export const arrangeBar = cva("border-fg/10 bg-surface/90 flex h-7 shrink-0 items-center gap-0.5 border-b px-0.5");

export const arrangeName = cva("text-fg/60 min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.08em] uppercase");

export const arrangeHandle = cva(
  "text-fg/60 hover:text-fg flex size-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md outline-none active:cursor-grabbing"
);

export const arrangeButton = cva(
  "text-fg/60 hover:text-destructive-vivid hover:bg-destructive-vivid/10 focus-visible:ring-primary-400 flex size-5 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2",
  {
    variants: {
      end: {
        true: "ml-auto",
        false: "",
      },
    },
    defaultVariants: { end: false },
  }
);

export const arrangeTileBody = cva("min-h-0 flex-1 overflow-hidden");

export function arrangeGridVars(
  device: BoardDevice,
  appearance: BoardAppearance | undefined,
  layout: ArrangeLayout
): CssVars {
  return {
    ...boardGridVars(device, appearance, { rowPx: 0, gapPx: layout.gapPx }),
    "--arrange-w": `${layout.width}px`,
    "--arrange-rows": layout.rowHeights.map((height) => `${height}px`).join(" "),
  };
}
