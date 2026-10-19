import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { PlacedTile } from "./types";

export const boardRoot = cva("flex flex-col gap-4");

export const boardDock = cva("pointer-events-none sticky bottom-4 z-30 -mt-2 flex justify-end");

export const boardDockPill = cva(
  "border-fg/10 bg-surface/90 pointer-events-auto flex items-center gap-1.5 rounded-full border p-1.5 pl-4 shadow-2xl backdrop-blur-xl"
);

export const boardFab = cva(
  "bg-primary text-primary-foreground shadow-primary-500/40 focus-visible:ring-primary-300 flex size-12 items-center justify-center rounded-full shadow-xl transition-[translate,scale,opacity] duration-200 outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none [&_svg]:size-5",
  {
    variants: {
      revealed: {
        true: "pointer-events-auto",
        false:
          "pointer-events-none translate-y-[calc(100%+1rem)] opacity-0 focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100",
      },
    },
    defaultVariants: { revealed: true },
  }
);

export const boardFabLabel = cva("sr-only");

export const boardHint = cva("text-fg/60 hidden pr-2 text-sm lg:block");

export const boardTile = cva(
  "relative flex min-h-0 min-w-0 rounded-xl outline-none [grid-column:var(--tile-col)] [grid-row:var(--tile-row)]",
  {
    variants: {
      editing: {
        true: "outline-primary-400/50 outline-2 outline-offset-2 outline-dashed focus-visible:outline-primary-400 focus-visible:outline-solid",
        false: "",
      },
      dragging: {
        true: "opacity-30",
        false: "",
      },
    },
    defaultVariants: { editing: false, dragging: false },
  }
);

export const tileBody = cva("flex min-h-0 min-w-0 flex-1 [&>*]:min-h-0 [&>*]:size-full", {
  variants: {
    editing: {
      true: "select-none [&_*]:pointer-events-none [&_[data-info-tooltip]]:pointer-events-auto",
      false: "",
    },
  },
  defaultVariants: { editing: false },
});

export const editControls = cva(
  "border-fg/10 bg-surface/90 absolute top-2 right-2 z-20 flex items-center gap-1 rounded-xl border p-1 shadow-lg backdrop-blur-md"
);

export const sizeGroup = cva("bg-fg/5 flex items-center gap-0.5 rounded-lg p-0.5");

export const sizeChip = cva(
  "focus-visible:ring-primary-400 h-7 min-w-7 rounded-md px-1.5 font-mono text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground shadow-sm",
        false: "text-fg/60 hover:text-fg hover:bg-fg/10",
      },
    },
  }
);

export const controlButton = cva(
  "text-fg/60 hover:text-fg hover:bg-fg/10 focus-visible:ring-primary-400 flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-30",
  {
    variants: {
      tone: {
        neutral: "",
        danger: "hover:text-destructive-vivid hover:bg-destructive-vivid/10",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export const dragHandle = cva(
  "text-fg/60 hover:text-fg bg-fg/5 hover:bg-fg/10 focus-visible:ring-primary-400 flex size-7 cursor-grab touch-none items-center justify-center rounded-md outline-none focus-visible:ring-2 active:cursor-grabbing"
);

export const editIconFrame = cva("relative inline-flex size-4 shrink-0");

export const editIconPen = cva("bg-surface absolute -right-1 -bottom-1 size-2.5 rounded-sm p-px");

export const editIconGlyph = cva("size-4!");

export const editIconPenGlyph = cva("size-full!");

export const emptyBoard = cva("border-fg/10 flex flex-col items-center gap-2 rounded-2xl border border-dashed pb-8");

export const liveRegion = cva("sr-only");

export function tileVars(tile: PlacedTile): CssVars {
  return {
    "--tile-col": `${tile.col + 1} / span ${tile.cols}`,
    "--tile-row": `${tile.row + 1} / span ${tile.rows}`,
  };
}
