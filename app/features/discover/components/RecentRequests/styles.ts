import { cva } from "class-variance-authority";

export const requestsBody = cva("@container -mx-1 flex min-h-0 flex-1 flex-col");

export const requestsList = cva("flex flex-col gap-0.5");

export const cardBase = cva(
  "hover:bg-fg/[0.03] grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors [grid-template-areas:'main_time_badge']"
);

export const cardTime = cva("text-fg/60 hidden self-center font-mono text-[10px] [grid-area:time] @sm:block");

export const cardBadge = cva("justify-self-end [grid-area:badge]");

export const cardMain = cva("flex min-w-0 items-center gap-3 [grid-area:main]");

export const cardArt = cva("relative size-10 shrink-0 overflow-hidden rounded-md");

export const cardCopy = cva("min-w-0");

export const cardTitle = cva("text-fg line-clamp-1 text-sm font-medium");

export const cardParent = cva("text-fg/60 line-clamp-1 text-xs");

export const skeletonCell = cva("bg-fg/5 h-12 animate-pulse rounded-lg");
