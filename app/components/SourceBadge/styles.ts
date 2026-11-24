import { cva } from "class-variance-authority";

export const sourceBadge = cva(
  "border-fg/10 bg-fg/5 text-fg text-11 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 leading-none font-semibold whitespace-nowrap"
);

export const sourceDot = cva("source-dot size-1.75 shrink-0 rounded-full");
