import { cva } from "class-variance-authority";

export const panelFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 flex h-full flex-col overflow-hidden rounded-2xl border bg-linear-to-br"
);

export const errorFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 flex h-full items-center justify-center rounded-2xl border bg-linear-to-br p-6"
);

export const skeletonFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border bg-linear-to-br"
);

export const tabsContainer = cva(
  "border-fg/10 bg-surface/40 inline-flex rounded-lg border p-0.5 text-[11px] font-medium"
);

export const tabActive = cva(
  "from-primary-500 to-primary-600 text-overlay-fg bg-linear-to-br shadow-md rounded-md px-3 py-1 transition-colors"
);

export const tabInactive = cva("text-fg/60 hover:text-fg rounded-md px-3 py-1 transition-colors");

export const sectionHeaderRow = cva("border-fg/10 flex items-center justify-between border-b px-4 py-2.5");

export const sectionHeaderLabel = cva("text-fg/60 text-[12px] font-mono font-bold uppercase tracking-[0.22em]");

export const heroFrame = cva("border-fg/10 relative h-24 overflow-hidden border-b");

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

export const heroCount = cva("text-fg text-base font-bold tabular-nums leading-none");

export const heroUnit = cva("text-fg/60 text-[10px] font-mono");

export const statsRow = cva("border-fg/10 grid grid-cols-3 border-b text-center");

export const statsValue = cva("text-fg text-xl font-bold tabular-nums leading-none");

export const statsLabel = cva("text-fg/60 mt-1.5 text-[9px] font-mono uppercase tracking-[0.18em]");

export const rowsContainer = cva("flex flex-1 flex-col gap-0.5 px-4 py-2");

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

export const rowProgressTrack = cva("bg-fg/5 h-1 overflow-hidden rounded-full");

export const rowProgressFill = cva("from-primary-400 to-primary-600 h-full rounded-full bg-linear-to-r");

export const rowCount = cva("text-fg/60 text-right text-[11px] font-mono tabular-nums");
