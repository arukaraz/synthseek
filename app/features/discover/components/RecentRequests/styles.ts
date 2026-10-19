import { cva } from "class-variance-authority";

export const requestsBody = cva("@container -mx-1 flex min-h-0 flex-1 flex-col");

export const requestsList = cva("", {
  variants: {
    layout: {
      tile: "grid auto-rows-max grid-cols-1 gap-1 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-5",
      row: "flex flex-col gap-0.5",
    },
  },
});

export const cardBase = cva("hover:bg-fg/[0.03] grid rounded-lg transition-colors", {
  variants: {
    layout: {
      tile: "grid-cols-[minmax(0,1fr)_auto] gap-2 p-3 [grid-template-areas:'time_badge'_'main_main']",
      row: "grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-2 py-1.5 [grid-template-areas:'main_time_badge']",
    },
  },
});

export const cardTime = cva("text-fg/60 self-center font-mono text-[10px] [grid-area:time]", {
  variants: {
    layout: {
      tile: "",
      row: "hidden @sm:block",
    },
  },
});

export const cardBadge = cva("justify-self-end [grid-area:badge]");

export const cardMain = cva("flex min-w-0 items-center gap-3 [grid-area:main]");

export const cardArt = cva("relative shrink-0 overflow-hidden rounded-md", {
  variants: {
    layout: {
      tile: "size-12",
      row: "size-10",
    },
  },
});

export const cardCopy = cva("min-w-0");

export const cardTitle = cva("text-fg line-clamp-1 text-sm font-medium");

export const cardParent = cva("text-fg/60 line-clamp-1 text-xs");

export const skeletonCell = cva("bg-fg/5 animate-pulse rounded-lg", {
  variants: {
    layout: {
      tile: "h-24",
      row: "h-12",
    },
  },
});
