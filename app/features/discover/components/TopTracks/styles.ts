import { cva } from "class-variance-authority";

export const bodyFrame = cva("@container flex min-h-0 flex-1");

export const body = cva("flex min-h-0 w-full flex-col gap-4 @xl:flex-row @xl:items-stretch @xl:gap-5");

const heroFrame =
  "relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl @xl:aspect-auto @xl:w-[220px] @3xl:w-[240px]";

export const hero = cva(`group flex flex-col justify-end ${heroFrame}`);

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

export const list = cva("min-w-0", {
  variants: {
    columns: {
      one: "flex flex-col gap-1",
      two: "grid grid-cols-2 content-start gap-x-6 gap-y-1",
    },
  },
  defaultVariants: { columns: "one" },
});

export const item = cva("group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-fg/5");

export const itemRank = cva(
  "text-fg/40 group-hover:text-primary-400 w-5 text-right font-mono text-[13px] transition-colors"
);

export const itemCover = cva("bg-surface-sunken relative size-10 shrink-0 overflow-hidden rounded-md sm:size-[42px]");

export const itemMeta = cva("min-w-0 flex-1");

export const itemTitle = cva("text-fg truncate text-sm font-medium");

export const itemArtist = cva("text-fg/55 truncate text-[11.5px]");

export const itemPlays = cva("text-fg/40 shrink-0 font-mono text-[11px]");

export const skeletonHero = cva(`bg-fg/5 animate-pulse ${heroFrame}`);

export const skeletonRow = cva("bg-fg/5 h-14 w-full animate-pulse rounded-lg");
