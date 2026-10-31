import { cva } from "class-variance-authority";

export const spotlightBody = cva("@container relative flex min-h-0 flex-1 flex-col");

export const spotlightGrid = cva("grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 @3xl:grid-cols-4 @3xl:gap-4");

export const spotlightCard = cva(
  "group relative h-full min-h-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl"
);

export const spotlightCardMedia = cva("relative h-full");

export const spotlightPlay = cva(
  "bg-primary text-primary-foreground focus-visible:ring-primary-400 absolute top-2 right-2 z-20 flex size-10 items-center justify-center rounded-full opacity-0 shadow-lg transition outline-none group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 focus-visible:ring-2 sm:top-3 sm:right-3 [@media(hover:none)]:opacity-100 [&_svg]:size-5 [&_svg]:fill-current"
);

export const spotlightSkeletonCard = cva("bg-fg/5 h-full animate-pulse rounded-lg");
