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
