import { cva } from "class-variance-authority";

export const paginationContainer = cva("flex flex-col gap-3 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between");

export const paginationSummary = cva("text-fg/50 hidden text-xs sm:block");

export const paginationControls = cva("flex items-center justify-between gap-2 sm:justify-end");

export const paginationSizeTrigger = cva(
  "border-fg/10 bg-fg/5 text-fg/70 hover:bg-fg/10 hover:text-fg flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors"
);

export const paginationNav = cva("flex items-center gap-1");

export const paginationNavButton = cva(
  "border-fg/10 bg-fg/5 text-fg/70 hover:bg-fg/10 hover:text-fg flex size-8 items-center justify-center rounded-lg border transition-colors disabled:pointer-events-none disabled:opacity-40"
);

export const paginationPages = cva("hidden items-center gap-1 md:flex");

export const paginationEllipsis = cva("text-fg/40 flex size-8 items-center justify-center");

export const paginationMobilePage = cva("text-fg/60 px-1 text-xs md:hidden");

export const paginationPageButton = cva(
  "flex size-8 items-center justify-center rounded-lg border text-xs transition-colors",
  {
    variants: {
      active: {
        true: "border-primary-500/40 bg-primary-500/15 text-primary-400",
        false: "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg",
      },
    },
    defaultVariants: { active: false },
  }
);
