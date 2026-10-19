import { cva } from "class-variance-authority";

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

export const nodeTitle = cva("text-fg mt-2 truncate text-[12.5px] font-medium");

export const nodeArtist = cva("text-fg/60 truncate text-[11.5px]");

export const timeline = cva(
  "-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const timelineRow = cva(
  "group/row hover:bg-fg/[0.04] grid grid-cols-[3rem_1rem_2.25rem_minmax(0,1fr)] items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors"
);

export const timelineTime = cva("text-fg/45 truncate font-mono text-[10.5px]");

export const timelineNode = cva(
  "before:bg-fg/10 relative grid w-4 place-items-center self-stretch before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] group-first/row:before:top-1/2 group-last/row:before:bottom-1/2"
);

export const timelineDot = cva(
  "border-fg/25 bg-surface group-first/row:border-primary-400 relative z-10 size-[11px] rounded-full border-2"
);

export const timelineCover = cva("bg-surface-sunken relative size-9 overflow-hidden rounded-md");

export const timelineCopy = cva("flex min-w-0 flex-col");

export const timelineTitle = cva("text-fg truncate text-[13px] font-medium");

export const timelineArtist = cva("text-fg/60 truncate text-[11.5px]");

export const skeletonRow = cva("bg-fg/5 h-12 w-full shrink-0 animate-pulse rounded-lg");

export const skeletonNode = cva("bg-fg/5 h-[152px] w-[112px] shrink-0 animate-pulse rounded-lg sm:w-[120px]");
