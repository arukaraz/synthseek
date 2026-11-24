import { cva } from "class-variance-authority";

export const figureButton = cva(
  "hover:border-fg/10 hover:bg-fg/5 aria-expanded:border-fg/10 aria-expanded:bg-fg/5 focus-visible:ring-primary-400 -mx-2 -my-1 flex min-h-11 cursor-pointer flex-col items-center rounded-xl border border-transparent px-2 py-1 transition-colors outline-none focus-visible:ring-2 sm:items-start @2xl:items-end"
);

export const figureLabel = cva("text-fg/50 group-aria-expanded:text-fg inline-flex items-center gap-0.5 text-xs");

export const figureChevron = cva("size-3 shrink-0 transition-transform group-aria-expanded:rotate-180");

export const figurePanel = cva("max-w-none min-w-52 rounded-xl px-3.5 py-3");

export const figurePanelTitle = cva("text-fg/50 mb-2.5 text-xs");

export const figureRows = cva("grid grid-cols-[auto_auto] items-center gap-x-5 gap-y-2");

export const figureRowValue = cva(
  "text-fg text-right text-base leading-tight font-bold whitespace-nowrap tabular-nums"
);

export const figureRowUnit = cva("text-fg/50 text-11 mr-1.5 font-medium");
