import { cva } from "class-variance-authority";

export const degradedChip = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:text-fg/80 inline-flex shrink-0 cursor-default items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
);

export const degradedTooltipIntro = cva("text-fg/60 mb-1");

export const degradedTooltipList = cva("flex flex-col gap-0.5");
