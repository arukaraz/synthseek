import { cva } from "class-variance-authority";

export const heroFrame = cva("group/hero relative w-full overflow-hidden rounded-2xl");

export const errorFrame = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 relative flex h-full items-center justify-center rounded-2xl border bg-linear-to-br p-8"
);

export const heroCanvas = cva(
  "relative aspect-video w-full overflow-hidden rounded-2xl sm:aspect-2/1 md:h-70 md:aspect-auto lg:h-90"
);

export const heroImageOverlayBottom = cva("from-surface via-surface/60 absolute inset-0 bg-linear-to-t to-transparent");

export const heroImageOverlayLeft = cva("from-surface/80 absolute inset-0 bg-linear-to-r to-transparent");

export const heroTrendingBadge = cva(
  "text-warning relative flex items-center gap-2 p-5 text-xs font-mono uppercase tracking-[0.2em] sm:p-6"
);

export const heroContent = cva("absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6");

export const heroEyebrow = cva("text-fg-muted mb-2 text-[11px] font-mono uppercase tracking-widest");

export const heroTitle = cva("text-fg mb-1 line-clamp-2 text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl");

export const heroSubtitle = cva("text-fg-muted mb-4 text-sm");

export const skeletonCanvas = cva(
  "bg-fg/5 relative aspect-video w-full animate-pulse overflow-hidden rounded-2xl sm:aspect-2/1 md:h-70 md:aspect-auto lg:h-90"
);

export const skeletonContent = cva("absolute bottom-6 left-6 right-6 space-y-3");

export const navContainer = cva(
  "pointer-events-none absolute bottom-5 right-5 z-20 flex items-center gap-3 sm:bottom-6 sm:right-6"
);

export const navArrow = cva(
  "text-fg/70 hover:text-fg pointer-events-auto transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg/40 rounded"
);

export const dotsRow = cva("flex items-center gap-1.5");

export const dotBase = cva("pointer-events-auto h-1 rounded-full transition-all duration-300", {
  variants: {
    active: {
      true: "bg-fg w-5",
      false: "bg-fg/30 hover:bg-fg/50 w-1.5",
    },
  },
});
