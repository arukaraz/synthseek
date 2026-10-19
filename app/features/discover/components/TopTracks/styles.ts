import { cva } from "class-variance-authority";

export const bodyFrame = cva("@container flex min-h-0 flex-1");

export const body = cva("flex min-h-0 w-full @xl:flex-row @xl:items-stretch @xl:gap-5", {
  variants: {
    shape: {
      compact: "flex-row items-stretch gap-3",
      tall: "flex-col gap-4",
    },
  },
});

const heroFrame = "relative shrink-0 overflow-hidden rounded-2xl @xl:aspect-auto @xl:w-[220px] @3xl:w-[240px]";

const heroShapes = {
  compact: "w-2/5 max-w-[240px]",
  tall: "aspect-[4/3] w-full",
};

export const hero = cva(`group flex flex-col justify-end ${heroFrame}`, {
  variants: { shape: heroShapes },
});

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

export const list = cva(
  "flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

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

export const skeletonHero = cva(`bg-fg/5 animate-pulse ${heroFrame}`, {
  variants: { shape: heroShapes },
});

export const skeletonRow = cva("bg-fg/5 h-14 w-full animate-pulse rounded-lg");
