import { cva } from "class-variance-authority";

import type { LogLevelName } from "./types";

export const viewerToolbar = cva("flex flex-wrap items-center gap-3");

export const levelChips = cva("flex flex-wrap items-center gap-1.5");

export const logChip = cva(
  "cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 transition-opacity",
  {
    variants: {
      active: {
        true: "bg-fg/10 ring-fg/20",
        false: "bg-transparent ring-transparent opacity-40 hover:opacity-70",
      },
    },
    defaultVariants: { active: true },
  }
);

export const searchWrap = cva("min-w-0 basis-full sm:min-w-[12rem] sm:flex-1 sm:basis-auto");

export const selectorGroups = cva("flex w-full flex-wrap items-end gap-x-6 gap-y-3");

export const toolbarActions = cva("flex w-full flex-wrap items-center gap-2 sm:w-auto");

export const exportActions = cva("flex flex-wrap items-center gap-3");

export const logTerminal = cva(
  "border-fg/10 mt-1 max-h-[28rem] min-h-[8rem] w-full min-w-0 overflow-auto rounded-lg border bg-black/40 p-3 font-mono text-xs leading-relaxed"
);

export const logLine = cva("whitespace-pre-wrap break-words");

export const logRequestId = cva("text-secondary-300");

export const LOG_LEVEL_DEFAULT_CLASS = "text-fg/70";

export const LOG_LEVEL_STYLES: Record<LogLevelName, string> = {
  DEBUG: "text-fg/50",
  INFO: "text-primary-300",
  WARN: "text-amber-300",
  ERROR: "text-red-400",
  SUCCESS: "text-emerald-300",
  ENGINE: "text-cyan-300",
};
