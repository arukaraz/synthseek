import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import { ROW_FILL_FADE_STEP, ROW_FILL_MIN_OPACITY } from "./constants";

export const panelFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 flex h-full flex-col overflow-hidden rounded-2xl border bg-linear-to-br"
);

export const errorFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 flex h-full items-center justify-center rounded-2xl border bg-linear-to-br p-6"
);

export const skeletonFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border bg-linear-to-br"
);

export const skeletonStats = cva("border-fg/10 grid grid-cols-3 border-b");

export const skeletonStat = cva("py-3 text-center");

export const skeletonHero = cva("border-fg/10 border-b p-3");

export const skeletonRows = cva("space-y-2 px-4 py-3");

export const skeletonBar = cva("bg-fg/10 rounded", {
  variants: {
    shape: {
      statValue: "mx-auto h-5 w-10",
      statLabel: "mx-auto mt-1.5 h-2.5 w-14",
      label: "h-3 w-24",
      tabs: "h-6 w-32",
      hero: "h-16 w-full",
      row: "h-4 w-full",
    },
  },
});

export const headerBlock = cva("shrink-0 px-4 pt-4 [&>header]:mb-3");

export const emptyFrame = cva("flex flex-1 items-center justify-center p-6");

export const rankingFrame = cva("flex min-h-0 min-w-0 flex-1 flex-col");

export const rankingColumns = cva("divide-fg/10 grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)] divide-x");

export const tabsContainer = cva(
  "border-fg/10 bg-surface/40 inline-flex rounded-lg border p-0.5 text-[11px] font-medium"
);

export const tabActive = cva(
  "from-primary-500 to-primary-600 text-overlay-fg bg-linear-to-br shadow-md rounded-md px-3 py-1 transition-colors"
);

export const tabInactive = cva("text-fg/60 hover:text-fg rounded-md px-3 py-1 transition-colors");

export const sectionHeaderRow = cva("border-fg/10 flex shrink-0 items-center justify-between border-b px-4 py-2.5");

export const sectionHeaderLabel = cva("text-fg/60 text-[12px] font-mono font-bold uppercase tracking-[0.22em]");

export const heroFrame = cva("border-fg/10 relative h-24 shrink-0 overflow-hidden border-b");

export const heroGhostRank = cva(
  "pointer-events-none absolute -bottom-10 -left-3 select-none text-[160px] font-black leading-none text-white/[0.04]"
);

export const heroThumb = cva(
  "absolute left-3 top-3 h-[72px] w-[72px] overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10"
);

export const heroThumbOverlay = cva(
  "from-surface/50 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent"
);

export const heroRankLabel = cva("text-overlay-fg/95 absolute bottom-1 left-1.5 text-[8px] font-mono tracking-[0.2em]");

export const heroContent = cva("absolute bottom-3 left-[92px] right-4 top-3 flex flex-col justify-center");

export const heroName = cva("text-fg truncate text-xl font-bold leading-tight sm:text-[22px]");

export const heroNameButton = cva(
  "text-fg hover:text-primary-400 truncate text-left text-xl font-bold leading-tight transition-colors sm:text-[22px]"
);

export const heroImage = cva("object-cover");

export const heroMeta = cva("mt-1.5 flex items-baseline gap-1");

export const heroCount = cva("text-fg text-base font-bold tabular-nums leading-none");

export const heroUnit = cva("text-fg/60 text-[10px] font-mono");

export const statsRow = cva("border-fg/10 grid shrink-0 grid-cols-3 border-b text-center");

export const statsCell = cva("py-3", {
  variants: {
    first: {
      true: "",
      false: "border-fg/10 border-l",
    },
  },
  defaultVariants: { first: false },
});

export const statsValue = cva("text-fg text-xl font-bold tabular-nums leading-none");

export const statsLabel = cva("text-fg/60 mt-1.5 text-[9px] font-mono uppercase tracking-[0.18em]");

export const rowsContainer = cva("flex flex-col gap-0.5 px-4 py-2");

export const rowGrid = cva("grid grid-cols-[20px_1fr_70px_38px] items-center gap-2 py-1.5", {
  variants: {
    last: {
      true: "",
      false: "border-b border-white/5",
    },
  },
});

export const rowRank = cva("text-fg/60 text-right text-[11px] font-mono tabular-nums");

export const rowName = cva("text-fg/80 truncate text-[13px]");

export const rowNameButton = cva("text-fg/80 hover:text-primary-400 truncate text-left text-[13px] transition-colors");

export const rowProgressTrack = cva("bg-fg/5 h-1 overflow-hidden rounded-full");

export const rowProgressFill = cva(
  "from-primary-400 to-primary-600 h-full w-(--fill-width) rounded-full bg-linear-to-r opacity-(--fill-opacity)"
);

export function rowFillVars(widthPct: number, index: number): CssVars {
  return {
    "--fill-width": `${widthPct}%`,
    "--fill-opacity": String(Math.max(ROW_FILL_MIN_OPACITY, 1 - index * ROW_FILL_FADE_STEP)),
  };
}

export const rowCount = cva("text-fg/60 text-right text-[11px] font-mono tabular-nums");
