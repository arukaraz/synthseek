import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { PlacedTile } from "./types";

export const boardRoot = cva("flex flex-col gap-4", {
  variants: {
    editing: {
      true: "pb-36",
      false: "pb-20",
    },
  },
  defaultVariants: { editing: false },
});

export const boardDock = cva(
  "player-metrics pointer-events-none fixed inset-x-0 bottom-[var(--toast-offset-mobile)] z-30 flex px-4 sm:bottom-[var(--toast-offset-wide)] sm:px-8",
  {
    variants: {
      editing: {
        true: "justify-center",
        false: "justify-end",
      },
    },
    defaultVariants: { editing: false },
  }
);

export const boardMenu = cva(
  "border-fg/15 bg-surface/95 pointer-events-auto flex max-w-full min-w-0 flex-col rounded-xl border p-1 shadow-2xl backdrop-blur-xl"
);

export const boardMenuRow = cva("flex min-w-0 items-center gap-1");

export const boardMenuActions = cva("flex w-max items-center gap-1");

export const boardMenuToggle = cva(
  "aria-expanded:bg-primary-500/15 aria-expanded:text-primary-400 aria-expanded:hover:bg-primary-500/20 aria-expanded:hover:text-primary-400"
);

export const boardMenuDivider = cva("bg-fg/15 mx-1 h-6 w-px shrink-0");

export const boardMenuDone = cva("shrink-0");

export const boardFab = cva(
  "from-primary-600 to-accent-600 text-primary-foreground shadow-primary-500/40 hover:from-primary-500 hover:to-accent-500 focus-visible:ring-primary-300 pointer-events-auto flex size-14 items-center justify-center rounded-full bg-linear-to-r shadow-xl transition-all duration-200 outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
);

export const boardFabLabel = cva("sr-only");

export const boardTile = cva(
  "relative flex min-h-0 min-w-0 flex-col rounded-xl outline-none [grid-column:var(--tile-col)] [grid-row:var(--tile-row)]",
  {
    variants: {
      editing: {
        true: "outline-primary-400/50 overflow-hidden outline-2 outline-offset-2 outline-dashed focus-visible:outline-primary-400 focus-visible:outline-solid",
        false: "",
      },
      dragging: {
        true: "bg-primary-500/10 outline-primary-400 outline-2 outline-offset-2 outline-dashed",
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
    dragging: {
      true: "invisible",
      false: "",
    },
  },
  defaultVariants: { editing: false, dragging: false },
});

export const tileSurface = cva("flex min-h-0 min-w-0 flex-1 [&>*]:min-h-0 [&>*]:size-full", {
  variants: {
    bare: {
      true: "[&>*]:border-transparent! [&>*]:bg-transparent! [&>*]:bg-none! [&>*]:shadow-none!",
      false: "",
    },
  },
  defaultVariants: { bare: false },
});

export const tileSlot = cva(
  "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center"
);

export const tileSlotName = cva("text-primary-300 max-w-full truncate text-sm font-semibold");

export const tileSlotSize = cva("text-primary-400/80 font-mono text-[11px] tracking-[0.14em] uppercase");

export const tileBar = cva(
  "border-fg/10 bg-surface/90 flex shrink-0 flex-wrap items-center gap-1 border-b p-1 backdrop-blur-md"
);

export const tileBarName = cva(
  "text-fg/60 min-w-0 flex-1 truncate font-mono text-[10.5px] tracking-[0.08em] uppercase"
);

export const tileBarTools = cva("ml-auto flex min-w-0 flex-wrap items-center justify-end gap-0.5");

export const sizeGroup = cva("bg-fg/5 flex items-center gap-0.5 rounded-lg p-0.5");

export const sizeChip = cva(
  "focus-visible:ring-primary-400 rounded-md px-1.5 font-mono text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground shadow-sm",
        false: "text-fg/60 hover:text-fg hover:bg-fg/10",
      },
      dense: {
        true: "h-5 min-w-5 px-1 text-[10px]",
        false: "h-7 min-w-7",
      },
    },
    defaultVariants: { dense: false },
  }
);

export const controlButton = cva(
  "text-fg/60 hover:text-fg hover:bg-fg/10 focus-visible:ring-primary-400 aria-pressed:text-primary-400 flex shrink-0 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-30",
  {
    variants: {
      tone: {
        neutral: "",
        danger: "hover:text-destructive-vivid hover:bg-destructive-vivid/10",
      },
      dense: {
        true: "size-5 [&_svg]:size-3.5",
        false: "size-7 [&_svg]:size-4",
      },
    },
    defaultVariants: { tone: "neutral", dense: false },
  }
);

export const dragHandle = cva(
  "text-fg/60 hover:text-fg bg-fg/5 hover:bg-fg/10 focus-visible:ring-primary-400 flex size-7 cursor-grab touch-none items-center justify-center rounded-md outline-none focus-visible:ring-2 active:cursor-grabbing"
);

export const editIcon = cva("size-7 shrink-0");

export const emptyBoard = cva("border-fg/10 flex flex-col items-center gap-2 rounded-2xl border border-dashed pb-8");

export const liveRegion = cva("sr-only");

export function tileVars(tile: PlacedTile): CssVars {
  return {
    "--tile-col": `${tile.col + 1} / span ${tile.cols}`,
    "--tile-row": `${tile.row + 1} / span ${tile.rows}`,
  };
}
