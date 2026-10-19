import { cva } from "class-variance-authority";

export const widgetFrame = cva("min-h-0 overflow-hidden");

export const widgetFrameBody = cva("flex min-h-0 flex-1 flex-col gap-2");

export const widgetFrameSkeleton = cva("bg-fg/5 min-h-0 flex-1 animate-pulse rounded-lg");

export const widgetFrameNote = cva(
  "border-fg/10 bg-fg/[0.02] text-fg/60 flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed px-4 py-3 text-center text-sm"
);
