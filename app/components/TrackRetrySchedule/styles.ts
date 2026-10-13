import { cva } from "class-variance-authority";

export const scheduleRow = cva("text-fg-muted flex min-w-0 items-center gap-1.5 text-[11px]");

export const scheduleFact = cva("min-w-0 truncate whitespace-nowrap");

export const scheduleIcon = cva("inline-flex shrink-0");

export const scheduleTrigger = cva(
  "text-fg/40 hover:text-fg/70 focus-visible:text-fg/70 shrink-0 rounded transition-colors outline-none"
);
