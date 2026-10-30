import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

export const chartBody = cva("@container flex min-h-0 flex-1 flex-col gap-2");

export const chartHead = cva("flex min-w-0 items-baseline justify-between gap-3");

export const chartValue = cva("text-fg truncate text-2xl leading-none font-bold tabular-nums");

export const chartCaption = cva("text-fg/60 truncate text-xs");

export const chartAxis = cva("text-fg/60 flex justify-between gap-2 font-mono text-[10px] [&>*]:truncate");

export const barsChart = cva("flex min-h-0 flex-1 items-stretch gap-[2px]");

export const barColumn = cva("flex min-h-0 min-w-0 flex-1 flex-col justify-end gap-1");

export const barTrack = cva("flex min-h-0 flex-1 flex-col justify-end");

export const bar = cva("min-h-0.5 w-full rounded-t-[4px] [height:var(--bar)]", {
  variants: {
    peak: {
      true: "bg-[var(--mix-acc)]",
      false: "bg-[color-mix(in_oklch,var(--mix-acc)_45%,transparent)]",
    },
  },
  defaultVariants: { peak: false },
});

export const barLabel = cva("text-fg/60 truncate text-center font-mono text-[10px]");

export const shareStrip = cva("flex h-3 w-full shrink-0 gap-[2px] overflow-hidden rounded-full");

export const shareTone = cva("", {
  variants: {
    tone: {
      explore: "bg-[var(--mix-explore)]",
      weekly: "bg-[var(--mix-weekly)]",
      cf: "bg-[var(--mix-cf)]",
      daily: "bg-[var(--mix-daily)]",
      other: "bg-fg/25",
    },
  },
  defaultVariants: { tone: "other" },
});

export const shareSegment = cva("h-full [flex-basis:var(--share)] [flex-grow:0] [flex-shrink:1]");

export const shareLegend = cva("flex min-h-0 flex-col gap-1.5 @2xl:grid @2xl:grid-cols-2 @2xl:gap-x-6");

export const shareRow = cva("grid grid-cols-[0.625rem_minmax(0,1fr)_auto] items-center gap-2 text-xs");

export const swatch = cva("size-2.5 rounded-full");

export const legendLabel = cva("text-fg truncate");

export const legendValue = cva("text-fg/70 tabular-nums");

export const compareLegend = cva("text-fg/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]");

export const compareKey = cva("inline-flex items-center gap-1.5");

export const compareSwatch = cva("size-2.5 rounded-full", {
  variants: {
    period: {
      current: "bg-[var(--mix-acc)]",
      previous: "bg-fg/25",
    },
  },
  defaultVariants: { period: "current" },
});

export const compareList = cva("flex min-h-0 flex-col gap-2.5");

export const compareRow = cva(
  "grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-3 @md:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
);

export const compareBars = cva("flex min-w-0 flex-col gap-[2px]");

export const compareLine = cva(
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 [&>span:last-child]:text-right [&>span:last-child]:whitespace-nowrap [&>span:last-child]:text-[11px]"
);

export const compareBar = cva("h-2 min-w-0.5 rounded-r-[4px] [width:var(--bar)]", {
  variants: {
    period: {
      current: "bg-[var(--mix-acc)]",
      previous: "bg-fg/25",
    },
  },
  defaultVariants: { period: "current" },
});

export const yearGrid = cva(
  "grid min-h-0 flex-1 grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] [grid-auto-columns:minmax(0,1fr)] gap-[2px]"
);

export const yearCell = cva("rounded-[2px]", {
  variants: {
    state: {
      blank: "invisible",
      empty: "bg-fg/5",
      filled: "bg-[var(--mix-acc)] [opacity:var(--heat)]",
    },
  },
  defaultVariants: { state: "empty" },
});

export const weekdayList = cva("flex min-h-0 flex-1 flex-col justify-between gap-1");

export const weekdayRow = cva("grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2");

export const weekdayTrack = cva("bg-fg/5 h-2 overflow-hidden rounded-full");

export const weekdayFill = cva("block h-full rounded-full bg-[var(--mix-acc)] [width:var(--bar)]");

export function barVars(share: number): CssVars {
  return { "--bar": `${share * 100}%` };
}

export function shareVars(share: number): CssVars {
  return { "--share": `${share * 100}%` };
}
