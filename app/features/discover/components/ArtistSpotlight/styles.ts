import { cva } from "class-variance-authority";

export const spotlightBody = cva("@container relative flex min-h-0 flex-1 flex-col");

export const spotlightGrid = cva("grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 @3xl:grid-cols-4 @3xl:gap-4");

export const spotlightCard = cva(
  "group relative h-full min-h-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl"
);

export const spotlightCardMedia = cva("relative h-full");

export const spotlightSlot = cva("relative h-full min-h-0 min-w-0");

export const spotlightDismiss = cva(
  "bg-surface-overlay/80 text-overlay-fg ring-overlay-fg/20 hover:bg-surface-overlay focus-visible:ring-primary-400 absolute top-2 right-2 z-20 flex size-8 items-center justify-center rounded-full opacity-0 shadow-lg ring-1 transition outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 disabled:opacity-40 sm:top-3 sm:right-3 [@media(hover:none)]:opacity-100 [&_svg]:size-4"
);

export const spotlightPlay = cva(
  "bg-primary text-primary-foreground focus-visible:ring-primary-400 absolute top-2 right-12 z-20 flex size-10 items-center justify-center rounded-full opacity-0 shadow-lg transition outline-none group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 focus-visible:ring-2 sm:top-3 sm:right-14 [@media(hover:none)]:opacity-100 [&_svg]:size-5 [&_svg]:fill-current"
);

export const spotlightLoading = cva(
  "bg-veil/60 text-overlay-fg absolute inset-0 z-30 grid place-items-center [&_svg]:size-8 [&_svg]:animate-spin motion-reduce:[&_svg]:animate-none"
);

export const spotlightReroll = cva("", {
  variants: {
    rolling: {
      true: "[&_svg]:animate-spin motion-reduce:[&_svg]:animate-none",
      false: "",
    },
  },
});

export const spotlightListBusy = cva("transition-opacity", {
  variants: {
    busy: {
      true: "animate-pulse opacity-60 motion-reduce:animate-none",
      false: "",
    },
  },
});

export const spotlightSkeletonCard = cva("bg-fg/5 h-full animate-pulse rounded-lg");
