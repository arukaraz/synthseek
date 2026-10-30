import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

export const spark = cva("block w-full overflow-visible", {
  variants: {
    fill: {
      true: "min-h-0 flex-1",
      false: "h-7 shrink-0",
    },
  },
  defaultVariants: { fill: false },
});

export const sparkLine = cva("fill-none [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]", {
  variants: {
    tone: {
      primary: "stroke-primary-400",
      accent: "stroke-[var(--mix-acc)]",
    },
  },
  defaultVariants: { tone: "primary" },
});

export const sparkArea = cva("", {
  variants: {
    tone: {
      primary: "fill-primary-400/15",
      accent: "fill-[color-mix(in_oklch,var(--mix-acc)_15%,transparent)]",
    },
  },
  defaultVariants: { tone: "primary" },
});

export const sparkBar = cva("", {
  variants: {
    last: {
      true: "",
      false: "",
    },
    tone: {
      primary: "",
      accent: "",
    },
  },
  compoundVariants: [
    { tone: "primary", last: true, className: "fill-primary-400" },
    { tone: "primary", last: false, className: "fill-primary-400/50" },
    { tone: "accent", last: true, className: "fill-[var(--mix-acc)]" },
    { tone: "accent", last: false, className: "fill-[color-mix(in_oklch,var(--mix-acc)_50%,transparent)]" },
  ],
  defaultVariants: { last: false, tone: "primary" },
});

export const heatGrid = cva(
  "grid min-h-0 flex-1 grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))_auto] gap-0.5"
);

export const heatDay = cva("text-fg/60 self-center font-mono text-[10px]");

export const heatCell = cva("rounded-[3px]", {
  variants: {
    empty: {
      true: "bg-fg/5",
      false: "[opacity:var(--heat)]",
    },
    tone: {
      primary: "",
      accent: "",
    },
  },
  compoundVariants: [
    { empty: false, tone: "primary", className: "bg-primary-400" },
    { empty: false, tone: "accent", className: "bg-[var(--mix-acc)]" },
  ],
  defaultVariants: { empty: true, tone: "primary" },
});

export const heatHour = cva("text-fg/60 col-span-6 font-mono text-[10px]");

export function heatVars(level: number): CssVars {
  return { "--heat": String(level) };
}
