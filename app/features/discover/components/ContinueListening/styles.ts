import { cva } from "class-variance-authority";

export const resumeCard = cva("bg-fg/[0.04] flex shrink-0 items-center gap-4 rounded-xl p-3");

export const resumeCover = cva("bg-surface-sunken relative size-16 shrink-0 overflow-hidden rounded-lg");

export const resumeBody = cva("flex min-w-0 flex-1 flex-col gap-1.5");

export const resumeTitle = cva("text-fg truncate text-sm font-semibold");

export const resumeMeta = cva("text-fg/60 truncate text-xs");

export const resumeFoot = cva("flex items-center justify-between gap-3");

export const resumeTime = cva("text-fg/60 font-mono text-[11px] tabular-nums");
