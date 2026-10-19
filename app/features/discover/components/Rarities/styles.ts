import { cva } from "class-variance-authority";

export const rarityScore = cva("flex shrink-0 items-center gap-3 px-1.5 pb-2");

export const rarityValue = cva("text-primary-400 shrink-0 text-3xl leading-none font-semibold tabular-nums");

export const rarityCaption = cva("text-fg/60 text-xs leading-snug");
