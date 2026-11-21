import { cva } from "class-variance-authority";

export const previewStrip = cva(
  "border-primary-500/30 bg-primary-500/15 sticky top-0 z-30 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5 backdrop-blur"
);

export const previewStripText = cva("text-fg min-w-0 flex-1 basis-60 text-sm");

export const previewStripTitle = cva("font-semibold");
