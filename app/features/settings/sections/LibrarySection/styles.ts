import { cva } from "class-variance-authority";

export const previewTemplate = cva(
  "bg-fg/5 text-fg/80 truncate rounded-md px-3 py-2 font-mono text-xs tabular-nums select-all"
);

export const previewToolbar = cva("flex w-full min-w-0 flex-wrap items-center gap-2");

export const previewSearchBox = cva("relative min-w-40 flex-1");

export const previewSearch = cva(
  "bg-fg/5 focus:ring-accent/40 placeholder:text-fg/40 h-8 w-full rounded-md pr-2 pl-8 text-sm outline-none focus:ring-2"
);

export const previewTable = cva(
  "border-fg/10 flex max-h-[38vh] w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto rounded-md border"
);

export const previewHead = cva(
  "border-fg/10 bg-fg/5 text-fg/50 sticky top-0 z-10 flex w-full min-w-0 items-center gap-2 border-b px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase"
);

export const previewRow = cva(
  "border-fg/5 flex w-full min-w-0 items-center gap-2 border-b px-3 py-2 text-xs last:border-b-0"
);

export const previewFrom = cva("text-fg/50 w-0 min-w-0 flex-1 truncate");

export const previewTo = cva("text-fg/90 w-0 min-w-0 flex-1 truncate");

export const previewScopeNote = cva("text-fg/60 text-xs");

export const sampleList = cva("border-fg/10 flex flex-col gap-1.5 rounded-md border p-3");

export const sampleRow = cva("flex flex-col gap-0.5");

export const sampleLabel = cva("text-fg/50 text-[11px]");

export const samplePath = cva("text-fg/80 truncate font-mono text-xs");

export const statStrip = cva("flex flex-wrap items-center gap-x-6 gap-y-1 text-sm");

export const statPair = cva("flex items-baseline gap-1.5");

export const statNumber = cva("text-fg font-semibold tabular-nums");

export const statWord = cva("text-fg/60");
