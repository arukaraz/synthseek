import { cva } from "class-variance-authority";

export const weekStats = cva("mb-1 grid w-full grid-cols-[auto_auto_minmax(0,1fr)] items-end gap-x-4");

export const weekStat = cva("flex min-w-0 flex-col-reverse");

export const weekStatValue = cva("text-overlay-fg truncate text-lg leading-tight font-bold tabular-nums");

export const weekStatLabel = cva("text-overlay-fg/70 truncate font-mono text-[10px] tracking-[0.14em] uppercase");

export const weekTopPlays = cva("text-overlay-fg/80 font-mono text-[11px] tabular-nums");
