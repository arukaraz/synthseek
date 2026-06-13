import { cva } from "class-variance-authority";

export const indicatorRow = cva("flex items-center gap-2");

export const indicatorLabel = cva("truncate text-xs font-medium");

export const reasonButton = cva(
  "text-fg/40 hover:text-fg/70 focus-visible:text-fg/70 shrink-0 rounded transition-colors outline-none"
);
