import { cva } from "class-variance-authority";

export const scheduleRow = cva("text-fg-muted flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px]");

export const scheduleFacts = cva("inline-flex min-w-0 items-center gap-1");

export const scheduleSeparator = cva("text-fg-muted/60 px-0.5");

export const retryNowButton = cva(
  "text-primary-400 border-fg/15 hover:bg-fg/5 hover:border-fg/30 focus-visible:ring-primary-500 inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-medium transition-colors outline-none focus-visible:ring-2"
);
