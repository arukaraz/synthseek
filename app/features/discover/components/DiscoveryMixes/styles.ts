import { cva } from "class-variance-authority";

export const widgetHeader = cva("mb-4 flex items-center gap-3");

export const widgetIcon = cva(
  "bg-primary-500/15 text-primary-300 flex size-8 shrink-0 items-center justify-center rounded-lg"
);

export const widgetTitle = cva("text-fg text-base font-semibold sm:text-lg");

export const widgetSubtitle = cva("text-fg/55 text-xs");

export const mixGrid = cva("grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4");

export const mixCard = cva(
  "group relative flex flex-col overflow-hidden rounded-2xl border border-fg/10 bg-surface/40 text-left transition-all",
  {
    variants: {
      state: {
        ready: "cursor-pointer hover:-translate-y-1 hover:border-[var(--mix-acc)]",
        empty: "pointer-events-none opacity-55",
      },
    },
    defaultVariants: { state: "ready" },
  }
);

export const mixPoster = cva("relative aspect-square w-full overflow-hidden");

export const mixPosterTint = cva("pointer-events-none absolute inset-0 bg-[var(--mix-acc)] opacity-55 mix-blend-color");

export const mixPosterShade = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/10"
);

export const mixChip = cva(
  "text-overlay-fg absolute left-3 top-3 flex size-7 items-center justify-center rounded-lg border border-white/20 bg-black/45 backdrop-blur-sm"
);

export const mixFreshPill = cva(
  "text-overlay-fg/90 absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm"
);

export const mixInfo = cva("flex flex-1 flex-col gap-1 bg-surface/60 p-3.5");

export const mixTag = cva("text-[10px] font-semibold uppercase tracking-wider text-[var(--mix-acc)]");

export const mixTitle = cva("text-fg text-sm font-semibold sm:text-base");

export const mixBlurb = cva("text-fg/55 line-clamp-2 flex-1 text-xs leading-relaxed");

export const mixFoot = cva("mt-2 flex items-center border-t border-fg/10 pt-2.5");

export const mixCount = cva("text-fg/50 font-mono text-[11px]");

export const mosaicGrid = cva("grid size-full grid-cols-2 grid-rows-2");

export const mosaicTile = cva("relative size-full overflow-hidden");

export const mosaicImage = cva("object-cover");

export const mosaicFallback = cva("size-full");

export const emptyPanel = cva(
  "border-fg/10 bg-fg/[0.02] flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center"
);

export const emptyPanelText = cva("text-fg/60 text-sm");

export const emptyPanelLink = cva("text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors");

export const skeletonCard = cva("bg-fg/5 aspect-[3/4] animate-pulse rounded-2xl");
