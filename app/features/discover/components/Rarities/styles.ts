import { cva } from "class-variance-authority";

export const rarityAside = cva(
  "flex min-w-0 flex-col items-end gap-0.5 sm:flex-row sm:items-baseline sm:gap-1.5 sm:whitespace-nowrap"
);

export const rarityValue = cva("text-primary-400 text-xl leading-none font-semibold tabular-nums");

export const rarityCaption = cva("text-fg/60 max-w-56 text-[11px] leading-snug sm:max-w-none sm:truncate");
