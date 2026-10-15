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

export const actionsCell = cva("flex items-center justify-center");

export const rowKebab = cva(
  "text-fg/55 hover:text-fg hover:bg-fg/5 focus-visible:ring-primary-400 grid size-7 shrink-0 place-items-center rounded-full transition-[color,opacity] focus-visible:ring-2 focus-visible:outline-none data-[state=open]:text-fg"
);

export const pathCellText = cva("text-fg/70 block truncate text-sm");

export const pathCellEmpty = cva("text-fg/45 font-mono text-xs");

export const tableWrap = cva(
  "min-w-0 [&_tr[data-range-preview=clear]]:bg-fg/10 [&_tr[data-range-preview=select]]:bg-primary-500/10"
);

export const primaryCellArtwork = cva("relative size-10 shrink-0 overflow-hidden rounded-md");

export const primaryCellPlay = cva(
  "text-overlay-fg focus-visible:ring-primary-400 absolute inset-0 grid place-items-center rounded-md bg-black/55 opacity-100 transition-opacity focus-visible:ring-2 focus-visible:outline-none sm:opacity-0 sm:hover:opacity-100 sm:focus-visible:opacity-100"
);
