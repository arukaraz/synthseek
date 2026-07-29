import { cva } from "class-variance-authority";

export const quarantineListHeader = cva("flex items-center justify-between gap-3");

export const quarantineList = cva("flex max-h-96 flex-col gap-2 overflow-y-auto pr-1");

export const quarantineRow = cva("border-fg/10 bg-fg/[0.03] flex items-start gap-3 rounded-lg border p-3");

export const quarantineRowBody = cva("flex min-w-0 flex-1 flex-col gap-1");

export const quarantineFilename = cva("text-fg font-mono text-xs break-all");

export const quarantineMeta = cva("text-fg/55 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs");

export const quarantineReasonBadge = cva("bg-fg/10 text-fg/70 rounded-full px-2 py-0.5 text-[11px] font-medium");

export const quarantineLink = cva("text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline");

export const quarantineValue = cva("text-fg text-sm font-medium");
