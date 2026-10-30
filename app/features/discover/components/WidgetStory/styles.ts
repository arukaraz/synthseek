import { cva } from "class-variance-authority";

export const storyFrame = cva(
  "@container relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
);

export const storyBackdrop = cva(
  "pointer-events-none absolute inset-0 grid grid-cols-3 gap-1 opacity-25 blur-[2px] @xl:grid-cols-5 [&_img]:object-cover"
);

export const storyBackdropTile = cva("bg-surface-sunken relative min-h-0 overflow-hidden");

export const storyTint = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-surface via-surface/85 to-[var(--mix-acc)]/25"
);

export const storyBody = cva("relative flex min-h-0 flex-1 items-end gap-4 p-1");

export const storyCopy = cva("flex min-w-0 flex-1 flex-col gap-1.5");

export const storyLabel = cva("truncate text-[11px] font-semibold tracking-wide text-[var(--mix-acc)] uppercase");

export const storyHeadline = cva("text-fg leading-tight font-black break-words", {
  variants: {
    size: {
      S: "line-clamp-2 text-xl",
      M: "line-clamp-2 text-3xl",
      L: "line-clamp-2 text-4xl @3xl:text-5xl",
    },
  },
  defaultVariants: { size: "M" },
});

export const storyDetail = cva("text-fg/70 line-clamp-2 text-xs @xl:text-sm");

export const storyRows = cva("mt-1 flex flex-col gap-1");

export const storyRow = cva("flex min-w-0 items-baseline justify-between gap-3 text-xs");

export const storyRowLabel = cva("text-fg/80 truncate");

export const storyRowValue = cva("shrink-0 font-semibold text-[var(--mix-acc)] tabular-nums");

export const storyCover = cva(
  "bg-surface-sunken relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl shadow-lg @3xl:w-40 [&_img]:object-cover"
);

export const storyNav = cva("relative flex items-center justify-between gap-2 pt-2");

export const storyArrow = cva(
  "text-fg/70 hover:text-fg rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-30 [&_svg]:size-4"
);

export const storyDots = cva("flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden");

export const storyDot = cva("h-1.5 shrink-0 rounded-full transition-all duration-300", {
  variants: {
    active: {
      true: "w-5 bg-[var(--mix-acc)]",
      false: "bg-fg/25 hover:bg-fg/50 w-1.5",
    },
  },
});

export const storyCounter = cva("text-fg/60 text-[11px] tabular-nums");
