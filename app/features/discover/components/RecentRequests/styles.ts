import { cva } from "class-variance-authority";

export const sectionFrame = cva("flex min-w-0 flex-col gap-4");

export const headerRow = cva("flex items-end justify-between");

export const headerLink = cva(
  "text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
);

export const stripFrame = cva("border-fg/10 bg-surface/40 relative overflow-hidden rounded-xl border");

export const stripScroller = cva(
  "no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const stripCard = cva("w-full shrink-0 snap-start sm:w-1/2 md:w-1/3 xl:w-1/5");

export const stripEdgeBase = cva(
  "pointer-events-none absolute inset-y-0 z-10 flex w-16 items-center justify-center transition-opacity duration-200",
  {
    variants: {
      side: {
        left: "left-0 from-surface bg-linear-to-r via-surface/80 to-transparent",
        right: "right-0 from-surface bg-linear-to-l via-surface/80 to-transparent",
      },
      visible: {
        true: "opacity-100",
        false: "opacity-0",
      },
    },
  }
);

export const stripEdgeButton = cva(
  "text-fg/80 hover:text-fg pointer-events-auto rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg/40 disabled:pointer-events-none"
);

export const skeletonStrip = cva("border-fg/10 bg-surface/40 flex animate-pulse overflow-hidden rounded-xl border");

export const skeletonCell = cva(
  "border-fg/5 flex w-full shrink-0 flex-col gap-2 border-r p-4 sm:w-1/2 md:w-1/3 xl:w-1/5 last:border-r-0"
);

export const cardBase = cva(
  "border-fg/5 relative flex flex-col gap-2 border-r p-4 transition-colors last:border-r-0 hover:bg-white/[0.02]"
);
