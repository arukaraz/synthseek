import { cva } from "class-variance-authority";

export const channelPanel = cva("flex flex-col gap-5");

export const channelHelp = cva("text-fg/60 text-sm");

export const fieldGrid = cva("grid grid-cols-1 gap-4 sm:grid-cols-2");

export const toggleRow = cva("border-fg/10 bg-fg/5 flex items-center justify-between gap-3 rounded-lg border p-3");

export const toggleText = cva("flex min-w-0 flex-col gap-0.5");

export const toggleLabel = cva("text-fg text-sm font-medium");

export const toggleHelper = cva("text-fg/60 text-xs");

export const statusLine = cva("text-xs", {
  variants: {
    tone: {
      muted: "text-fg/50",
      ok: "text-success-vivid",
      warning: "text-warning-vivid",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const actionsRow = cva("flex flex-wrap items-center gap-2");

export const checklistHeading = cva("text-fg text-sm font-semibold");

export const checklistGrid = cva("grid grid-cols-1 gap-4 lg:grid-cols-2");

export const checklistGroup = cva("border-fg/10 bg-fg/5 flex flex-col gap-3 rounded-lg border p-3");

export const checklistGroupTitle = cva("text-fg flex items-center gap-2 text-sm font-medium");

export const checklistOptions = cva("flex flex-col gap-2 pl-6");

export const checklistOption = cva("text-fg/80 flex items-center gap-2 text-sm");
