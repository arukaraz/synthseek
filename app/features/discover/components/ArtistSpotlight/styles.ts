import { cva } from "class-variance-authority";

export const spotlightBody = cva("@container relative flex min-h-0 flex-1 flex-col");

export const spotlightGrid = cva("grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 @3xl:grid-cols-4 @3xl:gap-4");

export const spotlightCard = cva(
  "group relative h-full min-h-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl"
);

export const spotlightCardMedia = cva("relative h-full");

export const spotlightSkeletonCard = cva("bg-fg/5 h-full animate-pulse rounded-lg");
