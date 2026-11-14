import { cva } from "class-variance-authority";

import type { CardSize } from "./types";

export const sizeClasses: Record<CardSize, string> = {
  small: "row-span-1",
  medium: "row-span-2",
  large: "row-span-2 sm:col-span-2",
};

export const mosaicSlotClasses: readonly string[] = [
  "",
  "",
  "",
  "",
  "@xl:row-span-2",
  "@xl:row-span-2",
  "@max-xl:hidden",
  "@max-xl:hidden",
];

export const panelBody = cva("@container relative flex min-h-0 flex-1 flex-col");

export const mosaicGrid = cva(
  "grid min-h-0 flex-1 grid-flow-dense auto-rows-[minmax(0,1fr)] grid-cols-2 gap-3 @xl:grid-cols-4"
);

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
