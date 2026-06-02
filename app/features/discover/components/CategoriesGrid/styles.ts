import { cva } from "class-variance-authority";

import type { CardSize } from "./types";

export const sizeClasses: Record<CardSize, string> = {
  small: "row-span-1",
  medium: "row-span-2",
  large: "row-span-2 sm:col-span-2",
};

export const panelBody = cva("relative flex flex-1 flex-col");

export const mosaicGrid = cva("grid flex-1 grid-flow-dense grid-cols-2 grid-rows-[repeat(6,minmax(96px,1fr))] gap-3");

export const emptyWrap = cva("flex flex-1 items-center justify-center");

export const skeletonMosaic = cva(
  "grid flex-1 grid-flow-dense grid-cols-2 grid-rows-[repeat(6,minmax(96px,1fr))] gap-3"
);
