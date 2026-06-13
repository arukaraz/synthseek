import { cva } from "class-variance-authority";

export const primaryCellRow = cva("flex items-center gap-3");
export const primaryCellText = cva("min-w-0");
export const primaryCellTitle = cva("text-fg truncate text-sm font-medium");

export const metaRow = cva("flex min-w-0 items-center gap-1.5 text-sm");
export const metaArtist = cva("text-fg/70 truncate");
export const metaAlbum = cva("text-fg/45 truncate");
export const metaDot = cva("bg-fg/25 size-1 shrink-0 rounded-full");

export const durationText = cva("text-fg/45 font-mono text-xs tabular-nums");

export const selectCell = cva("flex items-center justify-center");

export const tableWrap = cva("min-w-0");

export const selectionBar = cva(
  "border-fg/10 bg-surface/95 sticky top-0 z-10 mb-2 flex w-full min-w-0 flex-nowrap items-center gap-1.5 rounded-xl border px-3 py-2 sm:gap-2 sm:bg-surface/85 sm:backdrop-blur-md"
);

export const selectionChip = cva(
  "border-primary-500/30 bg-primary-500/15 text-fg inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
);

export const selectionChipDot = cva("bg-primary-300 size-1.5 rounded-full");
export const selectionChipNum = cva("text-primary-300 font-mono font-semibold");

export const selectionAction = cva(
  "border-fg/10 bg-fg/[0.03] text-fg/70 hover:bg-fg/[0.06] hover:text-fg inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5"
);

export const selectionActionLabel = cva("hidden sm:inline");
export const selectionActionCount = cva("font-mono font-semibold sm:hidden");

export const selectionClear = cva(
  "text-fg/60 hover:bg-fg/5 hover:text-fg ml-auto inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
);
