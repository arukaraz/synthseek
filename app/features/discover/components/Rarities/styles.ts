import { cva } from "class-variance-authority";

export const rarityScore = cva("flex shrink-0 items-baseline gap-3");

export const rarityValue = cva("text-primary-400 text-3xl leading-none font-semibold tabular-nums");

export const rarityCaption = cva("text-fg/60 text-xs");
