import { cva } from "class-variance-authority";

export const widgetHeader = cva("mb-4 flex items-start justify-between gap-3");

export const headerTitleStack = cva("flex flex-col gap-0.5");

export const headerTitleRow = cva("flex items-center gap-2");

export const widgetTitle = cva("text-fg text-base font-semibold sm:text-lg");

export const widgetSub = cva("text-fg/55 text-xs mt-2");

export const sectionIcon = cva(
  "bg-primary-500/15 text-primary-400 flex size-7 items-center justify-center rounded-lg border border-primary-500/25"
);

export const seeMoreLink = cva(
  "text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 self-center text-sm font-medium transition-colors"
);

export const railWrap = cva("relative");

export const rail = cva(
  "relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 pt-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const axisLine = cva(
  "pointer-events-none absolute left-3 right-3 top-[36px] z-0 h-[2px] bg-linear-to-r from-primary-400 via-fg/15 to-fg/15"
);

export const railEdge = cva(
  "pointer-events-none absolute inset-y-0 z-10 flex w-12 items-center justify-center transition-opacity duration-200",
  {
    variants: {
      side: {
        left: "left-0 from-surface bg-linear-to-r via-surface/45 to-transparent",
        right: "right-0 from-surface bg-linear-to-l via-surface/45 to-transparent",
      },
      visible: {
        true: "opacity-100",
        false: "opacity-0",
      },
    },
    defaultVariants: { visible: false },
  }
);

export const railEdgeButton = cva(
  "text-fg/80 hover:text-fg bg-surface/80 pointer-events-auto flex size-7 items-center justify-center rounded-full border border-fg/10 shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg/40"
);

export const node = cva("relative flex w-[112px] shrink-0 snap-start flex-col items-stretch px-2 sm:w-[120px]");

export const nodeTime = cva(
  "text-fg/45 pointer-events-none absolute -top-5 left-2 whitespace-nowrap font-mono text-[10px] leading-none"
);

export const nodeDot = cva(
  "border-fg/25 bg-surface relative z-10 mb-3 mt-[3px] size-[11px] shrink-0 self-start rounded-full border-2"
);

export const nodeCover = cva("bg-surface-sunken relative aspect-square w-full overflow-hidden rounded-lg");

export const nodeFallback = cva("size-full");

export const nodeTitle = cva("text-fg mt-2 truncate text-[12.5px] font-medium");

export const nodeArtist = cva("text-fg/60 truncate text-[11.5px]");

export const emptyPanel = cva(
  "border-fg/10 bg-fg/[0.02] flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center"
);

export const emptyText = cva("text-fg/60 text-sm");

export const emptyLink = cva("text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors");

export const skeletonNode = cva("bg-fg/5 h-[152px] w-[112px] shrink-0 animate-pulse rounded-lg sm:w-[120px]");
