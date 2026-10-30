import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

export const visuallyHidden = cva("sr-only");

export const blockBody = cva("@container flex min-h-0 flex-1 flex-col");

export const blockList = cva("flex flex-col gap-0.5", {
  variants: {
    wide: {
      true: "@3xl:grid @3xl:grid-cols-2 @3xl:gap-x-6",
      false: "",
    },
  },
  defaultVariants: { wide: false },
});

export const blockValue = cva(
  "inline-flex shrink-0 items-center rounded-full bg-fg/10 px-2 py-0.5 font-sans text-[10.5px] font-semibold whitespace-nowrap text-[var(--mix-acc)]"
);

export const blockRail = cva("flex h-full snap-x gap-3 [&>*]:w-40 [&>*]:shrink-0 [&>*]:snap-start");

export const card = cva("flex min-h-0 min-w-0 flex-col gap-2");

export const cardCover = cva(
  "bg-surface-sunken relative aspect-square w-full shrink overflow-hidden rounded-xl [&_img]:object-cover"
);

export const cardAction = cva(
  "text-overlay-fg absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-sm transition-colors outline-none hover:bg-[var(--mix-acc)] focus-visible:ring-2 focus-visible:ring-primary-400 [&_svg]:size-4"
);

export const cardCopy = cva("flex min-w-0 flex-col");

export const cardTitle = cva("text-fg truncate text-left text-[13px] font-medium", {
  variants: {
    interactive: {
      true: "hover:underline focus-visible:underline outline-none",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

export const cardSubtitle = cva("text-fg/60 truncate text-[11.5px]");

export const cardFoot = cva("truncate text-[11px] font-semibold text-[var(--mix-acc)]");

export const statBody = cva("flex min-h-0 flex-1 items-end justify-between gap-4");

export const statValue = cva("text-fg text-4xl leading-none font-black tabular-nums @xl:text-5xl");

export const statLabel = cva("text-fg/60 truncate text-xs");

export const statDelta = cva("truncate text-[11px] font-semibold text-[var(--mix-acc)]");

export const statsRow = cva("grid min-h-0 flex-1 gap-4 [grid-template-columns:repeat(var(--stat-cols),minmax(0,1fr))]");

export function statsVars(columns: number): CssVars {
  return { "--stat-cols": String(columns) };
}

export const statCell = cva("flex min-w-0 flex-col justify-start gap-1");

export const statsValue = cva("text-fg text-2xl leading-none font-bold tabular-nums");

export const leaderLink = cva(
  "text-overlay-fg w-full truncate text-left text-lg font-semibold outline-none hover:underline focus-visible:underline"
);

export const leaderAction = cva(
  "text-overlay-fg inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold backdrop-blur-sm hover:bg-[var(--mix-acc)] [&_svg]:size-3.5"
);

export const feedList = cva("flex flex-col divide-y divide-fg/10");

export const feedItem = cva("flex min-w-0 flex-col gap-0.5 py-2 first:pt-0");

export const feedTitle = cva("text-fg line-clamp-2 text-left text-[13px] font-semibold", {
  variants: {
    interactive: {
      true: "hover:underline focus-visible:underline outline-none",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

export const feedMeta = cva("text-fg/60 truncate text-[11.5px]");

export const calendarDate = cva(
  "flex w-10 shrink-0 flex-col items-center rounded-lg bg-fg/10 py-1 leading-none text-[var(--mix-acc)]"
);

export const calendarMonth = cva("text-[9.5px] font-bold uppercase tracking-wider");

export const calendarDay = cva("text-fg text-base font-bold tabular-nums");

export const moveBadge = cva(
  "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      direction: {
        up: "bg-fg/10 text-[var(--mix-acc)]",
        down: "bg-fg/5 text-fg/60",
        same: "bg-fg/5 text-fg/50",
        new: "bg-fg/10 text-fg",
      },
    },
    defaultVariants: { direction: "same" },
  }
);

export const mosaicGrid = cva(
  "grid min-h-0 flex-1 gap-2 [grid-template-columns:repeat(var(--mosaic-cols),minmax(0,1fr))] [grid-template-rows:repeat(var(--mosaic-rows),minmax(0,1fr))] @max-md:[grid-template-columns:repeat(3,minmax(0,1fr))] @max-md:[&>li:nth-child(n+7)]:hidden"
);

export const mosaicTile = cva("bg-surface-sunken relative min-h-0 overflow-hidden rounded-lg [&_img]:object-cover");

export const mosaicButton = cva(
  "absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-inset hover:bg-black/20"
);

export function mosaicVars(columns: number, rows: number): CssVars {
  return { "--mosaic-cols": String(columns), "--mosaic-rows": String(rows) };
}
