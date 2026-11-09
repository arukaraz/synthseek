import { cva } from "class-variance-authority";

export const resumeAside = cva("flex min-h-0 min-w-0 flex-1 flex-col gap-2");

export const resumeLeaderProgress = cva("w-full");

export const resumeLeaderFoot = cva("flex w-full items-center justify-between gap-3 pt-1");

export const resumeLeaderTime = cva("text-overlay-fg/80 font-mono text-[11px] tabular-nums");
