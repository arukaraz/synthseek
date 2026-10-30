import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import { boardGridVars, type BoardDevice } from "@components/BoardGrid";
import type { BoardAppearance } from "@hooks/api/queries/board/types";

import { ARRANGE_FRAME_BORDER_PX, ARRANGE_FRAME_INSET_PX, ARRANGE_NEW_ROW_SPAN } from "./constants";
import type { ArrangeLayout } from "./types";

export const arrangeHeader = cva("flex flex-col gap-1 px-4 pt-4 pr-14 pb-3 outline-none sm:pt-6 sm:pr-16 sm:pl-6");

export const arrangeHint = cva("text-fg/60 text-sm");

export const arrangeFrame = cva("min-h-0 flex-1 px-4 pb-4 sm:px-6");

export const arrangeViewport = cva("h-full overflow-y-auto");

export const arrangeRoot = cva("flex justify-center");

export const arrangeBoard = cva(
  "border-fg/15 bg-background/50 relative flex w-[calc(var(--arrange-w)+var(--arrange-inset)*2+var(--arrange-border)*2)] shrink-0 flex-col gap-[var(--board-gap)] rounded-2xl border p-[var(--arrange-inset)] shadow-inner"
);

export const arrangeGuides = cva(
  "pointer-events-none absolute inset-[var(--arrange-inset)] grid grid-cols-[repeat(var(--board-cols),minmax(0,1fr))] gap-[var(--board-gap)]"
);

export const arrangeGuide = cva("bg-fg/[0.03] rounded-sm");

export const arrangeGrid = cva(
  "relative grid w-full auto-rows-[var(--board-row)] grid-cols-[repeat(var(--board-cols),minmax(0,1fr))] gap-[var(--board-gap)]"
);

export const arrangeNewRow = cva(
  "border-fg/20 text-fg/50 relative flex h-[calc(var(--board-row)*var(--arrange-new-row)+var(--board-gap)*(var(--arrange-new-row)-1))] items-center justify-center rounded-lg border border-dashed font-mono text-[10px] tracking-[0.12em] uppercase"
);

export const arrangeEmpty = cva("text-fg/60 py-12 text-center text-sm");

export const arrangeTile = cva(
  "relative min-h-0 min-w-0 cursor-grab overflow-hidden rounded-lg outline-none select-none [grid-column:var(--tile-col)] [grid-row:var(--tile-row)] focus-visible:ring-primary-400 focus-visible:ring-2",
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

export const arrangeBar = cva(
  "@container border-fg/10 bg-surface/90 absolute inset-x-0 top-0 z-10 flex min-h-7 flex-wrap items-center gap-0.5 border-b px-0.5"
);

export const arrangeName = cva(
  "@max-arrange-bar:basis-[calc(100%-2.75rem)] text-fg/60 min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.08em] uppercase"
);

export const arrangeTools = cva(
  "@max-arrange-bar:order-1 @max-arrange-bar:w-full @max-arrange-bar:justify-between flex items-center gap-0.5"
);

export const arrangeHandle = cva(
  "text-fg/60 hover:text-fg flex size-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md outline-none active:cursor-grabbing"
);

export const arrangeButton = cva(
  "text-fg/60 hover:text-destructive-vivid hover:bg-destructive-vivid/10 focus-visible:ring-primary-400 flex size-5 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2"
);

export const arrangeTileBody = cva("size-full overflow-hidden");

export function arrangeBoardVars(
  device: BoardDevice,
  appearance: BoardAppearance | undefined,
  layout: ArrangeLayout
): CssVars {
  return {
    ...boardGridVars(device, appearance, { rowPx: layout.rowPx, gapPx: layout.gapPx }),
    "--arrange-w": `${layout.width}px`,
    "--arrange-inset": `${ARRANGE_FRAME_INSET_PX}px`,
    "--arrange-border": `${ARRANGE_FRAME_BORDER_PX}px`,
    "--arrange-new-row": String(ARRANGE_NEW_ROW_SPAN),
  };
}
