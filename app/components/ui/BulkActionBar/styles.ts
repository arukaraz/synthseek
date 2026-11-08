import { cva } from "class-variance-authority";

export const selectionBar = cva("bg-surface/95 sticky top-0 z-10 flex w-full min-w-0 items-center rounded-xl border", {
  variants: {
    appearance: {
      compact: "border-fg/10 mb-2 flex-wrap gap-1.5 px-3 py-2 sm:gap-2",
      prominent: "border-primary-500/35 mb-3 gap-2 p-1.5 shadow-lg",
    },
  },
  defaultVariants: { appearance: "compact" },
});

export const selectionChip = cva(
  "border-primary-500/30 bg-primary-500/15 text-fg inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
);

export const selectionChipDot = cva("bg-primary-400 size-1.5 rounded-full");
export const selectionChipNum = cva("text-primary-400 font-mono font-semibold");

export const selectionCount = cva("flex min-w-0 flex-1 items-baseline gap-1.5 truncate");
export const selectionCountNum = cva("text-primary-400 text-lg leading-none font-bold tabular-nums");
export const selectionCountLabel = cva("text-fg/70 truncate text-sm");

export const selectionActions = cva("flex shrink-0 items-center gap-1.5");

export const selectionAction = cva(
  "border-fg/10 bg-fg/[0.03] text-fg/70 hover:bg-fg/[0.06] hover:text-fg inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5"
);

export const prominentAction = cva(
  "focus-visible:ring-primary-400 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      tone: {
        default: "bg-fg/[0.06] text-fg hover:bg-fg/10",
        danger: "bg-destructive-vivid/15 text-destructive-vivid hover:bg-destructive-vivid/25",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export const selectionActionLabel = cva("hidden sm:inline");
export const selectionActionCount = cva("font-mono font-semibold sm:hidden");

export const selectionClear = cva("text-fg/60 hover:text-fg inline-flex shrink-0 items-center transition-colors", {
  variants: {
    appearance: {
      compact: "hover:bg-fg/5 ml-auto gap-1.5 rounded px-2 py-1 text-xs",
      prominent:
        "hover:bg-fg/10 focus-visible:ring-primary-400 size-9 justify-center rounded-lg focus-visible:ring-2 focus-visible:outline-none",
    },
  },
  defaultVariants: { appearance: "compact" },
});
