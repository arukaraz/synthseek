import { cva } from "class-variance-authority";

export const scheduleRow = cva("text-fg-muted flex min-w-0 items-center gap-1.5 text-[11px]");

export const scheduleFact = cva("min-w-0 truncate whitespace-nowrap");

export const scheduleTrigger = cva(
  "text-fg/40 hover:text-fg/70 focus-visible:text-fg/70 shrink-0 rounded transition-colors outline-none"
);

export const retryNowButton = cva(
  "text-primary-400 hover:bg-fg/10 focus-visible:ring-primary-500 shrink-0 rounded p-0.5 transition-colors outline-none focus-visible:ring-2"
);
