import { cva } from "class-variance-authority";

export const gapsBody = cva("@container flex min-h-0 flex-1 flex-col");

export const gapsGrid = cva(
  "grid min-h-0 flex-1 gap-4 overflow-y-auto [scrollbar-width:none] @3xl:grid-cols-3 [&::-webkit-scrollbar]:hidden"
);

export const gapCard = cva("flex min-h-0 min-w-0 flex-col gap-2");

export const gapHead = cva("flex items-center gap-3");

export const gapCover = cva("bg-surface-sunken relative size-10 shrink-0 overflow-hidden rounded-full");

export const gapCopy = cva("flex min-w-0 flex-1 flex-col");

export const gapArtist = cva("text-fg truncate text-sm font-semibold");

export const gapCount = cva("text-fg/60 text-[11.5px]");

export const gapPercent = cva("text-primary-400 font-mono text-sm font-semibold tabular-nums");
