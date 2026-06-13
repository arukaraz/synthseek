import { cva } from "class-variance-authority";

export const cardGrid = cva(
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
);

export const cardRoot = cva("group flex min-w-0 flex-col gap-2");

export const cardCover = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br ring-1"
);

export const cardImage = cva("h-full w-full object-cover");

export const cardInitials = cva("text-fg/70 flex h-full w-full items-center justify-center text-2xl font-bold");

export const cardMosaic = cva("grid h-full w-full grid-cols-2 grid-rows-2");

export const cardMosaicTile = cva("relative h-full w-full overflow-hidden");

export const cardStatusBadge = cva(
  "absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm"
);

export const cardStatusDot = cva("size-1.5 shrink-0 rounded-full");

export const cardBody = cva("flex min-w-0 flex-col gap-0.5 px-0.5");

export const cardTitle = cva("text-fg truncate text-sm font-semibold");

export const cardSubtitle = cva("text-fg/60 truncate text-xs");

export const cardMeta = cva("text-fg/45 truncate text-[11px]");

export const infiniteSentinel = cva("h-px w-full");

export const infiniteSpinnerRow = cva("flex w-full items-center justify-center py-6");
