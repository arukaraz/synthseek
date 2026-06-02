import { cva } from "class-variance-authority";

export const modalContent = cva(
  [
    "flex w-full flex-col p-4 sm:p-6",
    "h-[100dvh] max-w-none !max-h-[100dvh] !top-0 !left-0 !translate-x-0 !rounded-none",
    "sm:h-auto sm:max-w-lg sm:!max-h-[90vh] sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:!rounded-2xl",
  ].join(" ")
);

export const modalBody = cva("flex min-h-0 flex-1 flex-col gap-3 sm:gap-4");

export const modalHeader = cva("flex flex-col gap-1.5");

export const stepContainer = cva("flex min-h-0 flex-1 flex-col gap-3 sm:gap-4");

export const dropzone = cva(
  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-7 text-center transition-colors sm:py-10",
  {
    variants: {
      active: {
        true: "border-primary-400 bg-primary-500/10",
        false: "border-fg/15 hover:border-fg/30 bg-surface/30",
      },
    },
    defaultVariants: { active: false },
  }
);

export const dropzoneTitle = cva("text-fg text-sm font-medium");

export const dropzoneHint = cva("text-fg/50 text-xs");

export const sectionDivider = cva("flex items-center gap-3 text-fg/40 text-xs");

export const dividerLine = cva("h-px flex-1 bg-fg/10");

export const urlRow = cva("flex items-center gap-2");

export const urlInput = cva(
  "bg-surface/40 border-fg/15 focus:border-primary-400 text-fg h-9 flex-1 rounded-lg border px-3 text-sm outline-none"
);

export const errorText = cva("text-destructive text-xs");

export const coverageList = cva(
  "custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto sm:max-h-[22rem] sm:flex-none"
);

export const coverageHeader = cva("flex flex-wrap items-center gap-x-4 gap-y-1");

export const coverageHeaderStrong = cva("text-fg text-sm font-semibold");

export const coverageHeaderStat = cva("text-fg/60 text-xs");

export const searchInput = cva(
  "bg-surface/40 border-fg/15 focus:border-primary-400 text-fg h-8 w-full rounded-lg border px-2.5 text-xs outline-none"
);

export const sectionHeader = cva("text-fg/50 pt-1 text-[11px] font-medium tracking-wide uppercase");

export const trackRow = cva("hover:bg-fg/5 flex items-center gap-2.5 rounded-lg px-2 py-1.5");

export const trackThumb = cva("size-9 shrink-0 rounded object-cover");

export const trackThumbFallback = cva("bg-fg/10 size-9 shrink-0 rounded");

export const trackInfo = cva("flex min-w-0 flex-1 flex-col");

export const trackTitle = cva("text-fg truncate text-sm");

export const trackArtist = cva("text-fg/50 truncate text-xs");

export const trackMeta = cva("text-fg/40 hidden shrink-0 text-[11px] tabular-nums sm:block");

export const trackChips = cva("flex shrink-0 items-center gap-1");

export const statusChip = cva("rounded px-1.5 py-0.5 text-[10px] font-medium", {
  variants: {
    status: {
      matched: "bg-emerald-500/15 text-emerald-300",
      already: "bg-fg/10 text-fg/50",
      unmatched: "bg-destructive/15 text-destructive",
    },
  },
});

export const confidenceBadge = cva("rounded px-1.5 py-0.5 text-[10px]", {
  variants: {
    kind: {
      exact: "bg-primary-500/10 text-primary-300",
      approx: "bg-yellow-500/15 text-yellow-300",
    },
  },
});

export const footerRow = cva("flex items-center justify-end gap-2");

export const progressWrap = cva("flex flex-col gap-2 py-4");

export const progressLabel = cva("text-fg/60 text-center text-xs");
