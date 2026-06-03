import { cva } from "class-variance-authority";

export const infoTooltipTrigger = cva(
  "text-fg/40 hover:text-fg/80 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:text-fg/80"
);

export const infoTooltipContent = cva("max-w-xs leading-snug");

export const infoTooltipBody = cva("flex flex-col gap-1");

export const infoTooltipTitle = cva("text-fg text-xs font-semibold");

export const infoTooltipText = cva("text-fg/80 text-xs leading-snug");

export const infoTooltipList = cva("text-fg/70 mt-0.5 list-disc space-y-0.5 pl-4 text-[11px] leading-snug");

export const infoTooltipLink = cva(
  "text-primary-300 hover:text-primary-200 mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium"
);
