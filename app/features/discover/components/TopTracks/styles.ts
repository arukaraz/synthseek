import { cva } from "class-variance-authority";

export const body = cva("flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5");

export const hero = cva(
  "group relative flex aspect-[4/5] w-full shrink-0 flex-col justify-end overflow-hidden rounded-2xl sm:aspect-auto sm:w-[200px] md:w-[220px] lg:w-[240px]"
);

export const heroImage = cva("absolute inset-0 size-full object-cover");

export const heroFallback = cva("absolute inset-0 size-full");

export const heroShade = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent"
);

export const heroTop = cva("absolute left-3 right-3 top-3 z-10 flex items-center justify-between");

export const heroCrown = cva(
  "border-overlay-fg-accent/50 text-overlay-fg-accent inline-flex items-center gap-1.5 rounded-full border bg-black/70 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
);

export const heroBody = cva("relative z-10 p-4 sm:p-5");

export const heroRank = cva("type-text-track type-text-overlay text-[56px] font-bold leading-none sm:text-[64px]");

export const heroTitle = cva("text-overlay-fg mt-2 text-lg font-semibold sm:text-xl");

export const heroBy = cva("text-overlay-fg/80 text-sm");

export const heroPlays = cva("type-text-track type-text-overlay mt-2 font-mono text-xs");

export const list = cva("flex min-w-0 flex-1 flex-col gap-1");

export const item = cva("group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-fg/5");

export const itemRank = cva(
  "text-fg/40 group-hover:text-primary-400 w-5 text-right font-mono text-[13px] transition-colors"
);

export const itemCover = cva("bg-surface-sunken relative size-10 shrink-0 overflow-hidden rounded-md sm:size-[42px]");

export const itemMeta = cva("min-w-0 flex-1");

export const itemTitle = cva("text-fg truncate text-sm font-medium");

export const itemArtist = cva("text-fg/55 truncate text-[11.5px]");

export const itemPlays = cva("text-fg/40 shrink-0 font-mono text-[11px]");

export const emptyPanel = cva(
  "border-fg/10 bg-fg/[0.02] flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center"
);

export const emptyText = cva("text-fg/60 text-sm");

export const emptyLink = cva(
  "text-primary-400 text-sm font-medium underline-offset-2 transition-colors hover:underline"
);

export const skeletonHero = cva(
  "bg-fg/5 aspect-[4/5] w-full shrink-0 animate-pulse rounded-2xl sm:aspect-auto sm:h-72 sm:w-[200px] md:w-[220px] lg:w-[240px]"
);

export const skeletonRow = cva("bg-fg/5 h-14 w-full animate-pulse rounded-lg");
