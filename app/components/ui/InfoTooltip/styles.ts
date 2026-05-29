import { cva } from "class-variance-authority";

export const infoTooltipTrigger = cva(
  "text-fg/40 hover:text-fg/80 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:text-fg/80"
);

export const infoTooltipContent = cva("max-w-xs leading-snug");
