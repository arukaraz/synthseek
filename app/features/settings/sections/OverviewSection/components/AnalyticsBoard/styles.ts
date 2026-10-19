import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { BoardSpan } from "@components/BoardGrid";

export const analyticsCell = cva(
  "flex min-h-0 min-w-0 [grid-column:span_var(--cell-cols)/span_var(--cell-cols)] [grid-row:span_var(--cell-rows)/span_var(--cell-rows)] [&>*]:min-h-0 [&>*]:min-w-0 [&>*]:flex-1"
);

export const metricRow = cva("flex flex-wrap items-center gap-x-2 gap-y-1");

export const metricValue = cva("text-fg text-2xl leading-none font-semibold tabular-nums");

export const metricUnit = cva("text-fg/60 text-xs");

export const spark = cva("block w-full overflow-visible", {
  variants: {
    fill: {
      true: "min-h-0 flex-1",
      false: "h-7 shrink-0",
    },
  },
  defaultVariants: { fill: false },
});

export const sparkLine = cva(
  "stroke-primary-400 fill-none [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]"
);

export const sparkArea = cva("fill-primary-400/15");

export const sparkBar = cva("", {
  variants: {
    last: {
      true: "fill-primary-400",
      false: "fill-primary-400/50",
    },
  },
  defaultVariants: { last: false },
});

export const caption = cva("text-fg/60 truncate text-xs");

export const splitBar = cva("bg-destructive-vivid/60 flex h-1.5 shrink-0 overflow-hidden rounded-full");

export const splitFill = cva("bg-success-vivid h-full [width:var(--share)]");

export const axisRow = cva("text-fg/60 flex justify-between font-mono text-[10px]");

export const decadeChart = cva("flex min-h-0 flex-1 items-stretch gap-1.5");

export const decadeColumn = cva("flex min-w-0 flex-1 flex-col items-center gap-1");

export const decadeTrack = cva("flex min-h-0 w-full flex-1 flex-col items-center justify-end gap-1");

export const decadeValue = cva("text-fg/70 text-[11px] tabular-nums");

export const decadeBar = cva("min-h-0.5 w-full rounded-t-md [height:var(--bar)]", {
  variants: {
    peak: {
      true: "bg-primary-400",
      false: "bg-primary-400/45",
    },
  },
  defaultVariants: { peak: false },
});

export const decadeLabel = cva("text-fg/60 font-mono text-[10px] whitespace-nowrap");

export const qualityList = cva("flex flex-col gap-2.5");

export const qualityRow = cva("grid grid-cols-[3.5rem_minmax(0,1fr)_2.75rem_3.5rem] items-center gap-3");

export const qualityFormat = cva("text-fg font-mono text-xs font-semibold uppercase");

export const qualityNumber = cva("text-fg/60 text-right text-xs tabular-nums");

export const serviceList = cva("flex flex-col");

export const serviceRow = cva(
  "border-fg/10 flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-b-0"
);

export const serviceName = cva("text-fg text-sm font-medium");

export const servicePills = cva("flex flex-wrap items-center gap-1.5");

export const heatGrid = cva(
  "grid min-h-0 flex-1 grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))_auto] gap-0.5"
);

export const heatDay = cva("text-fg/60 self-center font-mono text-[10px]");

export const heatCell = cva("rounded-[3px]", {
  variants: {
    empty: {
      true: "bg-fg/5",
      false: "bg-primary-400 [opacity:var(--heat)]",
    },
  },
  defaultVariants: { empty: true },
});

export const heatHour = cva("text-fg/60 col-span-6 font-mono text-[10px]");

export const clockFoot = cva("text-fg/60 flex flex-wrap items-center justify-between gap-2 text-xs");

export function cellVars(span: BoardSpan): CssVars {
  return { "--cell-cols": String(span.cols), "--cell-rows": String(span.rows) };
}

export function shareVars(share: number): CssVars {
  return { "--share": `${share * 100}%` };
}

export function barVars(share: number): CssVars {
  return { "--bar": `${share * 100}%` };
}

export function heatVars(level: number): CssVars {
  return { "--heat": String(level) };
}
