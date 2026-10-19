import { cva } from "class-variance-authority";

import type { CardSize } from "./types";

export const sizeClasses: Record<CardSize, string> = {
  small: "row-span-1",
  medium: "row-span-2",
  large: "row-span-2 sm:col-span-2",
};

export const panelBody = cva("relative flex min-h-0 flex-1 flex-col");

export const mosaicGrid = cva("grid min-h-0 flex-1 grid-flow-dense gap-3", {
  variants: {
    layout: {
      pair: "grid-cols-2 grid-rows-[repeat(6,minmax(0,1fr))]",
      quad: "grid-cols-4 grid-rows-[repeat(3,minmax(0,1fr))]",
    },
  },
  defaultVariants: { layout: "pair" },
});

export const skeletonCard = cva("bg-fg/5 animate-pulse rounded-lg", {
  variants: {
    size: {
      small: "row-span-1",
      medium: "row-span-2",
      large: "row-span-2",
    },
  },
});

export const emptyWrap = cva("flex flex-1 items-center justify-center");
