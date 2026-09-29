import { cva } from "class-variance-authority";

export const bannerRoot = cva("border-warning-vivid/30 bg-warning-vivid/15 shrink-0 border-b px-4 py-2.5");

export const bannerRow = cva("flex items-start gap-2.5");

export const bannerIcon = cva("text-warning-vivid mt-0.5 size-4 shrink-0");

export const bannerBody = cva(
  "flex min-w-0 flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
);

export const bannerMessage = cva("text-fg min-w-0 break-words");

export const bannerTitle = cva("font-medium");

export const bannerMore = cva("text-fg-muted");

export const bannerLink = cva(
  "text-warning-vivid focus-visible:ring-warning-vivid/60 w-fit shrink-0 rounded-sm font-medium underline underline-offset-2 outline-none hover:no-underline focus-visible:ring-2"
);
