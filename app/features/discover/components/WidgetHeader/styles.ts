import { cva } from "class-variance-authority";

export const widgetHeaderRow = cva("mb-4 flex items-center justify-between gap-3");

export const widgetHeaderLead = cva("flex min-w-0 items-center gap-3");

export const widgetHeaderIcon = cva(
  "bg-primary-500/15 text-primary-400 flex size-8 shrink-0 items-center justify-center rounded-lg"
);

export const widgetHeaderTitleStack = cva("flex min-w-0 flex-col");

export const widgetHeaderTitle = cva("text-fg text-base font-semibold sm:text-lg");

export const widgetHeaderSubtitle = cva("text-fg-muted text-xs");

export const widgetHeaderActionLink = cva(
  "text-primary-400 inline-flex shrink-0 items-center gap-1 self-center text-sm font-medium underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
);

export const widgetHeaderSkeletonIcon = cva("bg-fg/10 size-8 shrink-0 animate-pulse rounded-lg");

export const widgetHeaderSkeletonTitle = cva("bg-fg/10 h-5 w-28 animate-pulse rounded");

export const widgetHeaderSkeletonSubtitle = cva("bg-fg/10 mt-1.5 h-3 w-20 animate-pulse rounded");
