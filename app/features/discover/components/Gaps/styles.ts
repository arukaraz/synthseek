import { cva } from "class-variance-authority";

export const gapsBody = cva("@container flex min-h-0 flex-1 flex-col");

export const gapsGrid = cva("grid gap-4 @3xl:grid-cols-3");

export const gapCard = cva("flex min-w-0 flex-col gap-1");

export const gapHeader = cva(
  "hover:bg-fg/[0.07] has-[:focus-visible]:bg-fg/[0.07] relative flex flex-col gap-2 rounded-lg p-1.5 transition-colors"
);

export const gapHead = cva("flex items-center gap-3");

export const gapCover = cva("bg-surface-sunken relative size-10 shrink-0 overflow-hidden rounded-full");

export const gapCopy = cva("flex min-w-0 flex-1 flex-col");

export const gapArtist = cva(
  "text-fg truncate text-left text-sm font-semibold outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary-400"
);

export const gapCount = cva("text-fg/60 text-[11.5px]");

export const gapPercent = cva("text-primary-400 font-mono text-sm font-semibold tabular-nums");
