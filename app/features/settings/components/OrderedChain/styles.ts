import { cva } from "class-variance-authority";

export const chainLayout = cva(
  "grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:gap-0"
);

export const chainColumn = cva("flex min-w-0 flex-col gap-5");

export const chainLabel = cva(
  "text-fg/50 mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wider uppercase"
);

export const chainList = cva("flex flex-col gap-2", {
  variants: {
    joined: {
      true: "mt-2",
      false: "",
    },
  },
  defaultVariants: { joined: false },
});

export const chainItem = cva(
  "relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors xl:mr-3.5",
  {
    variants: {
      selected: {
        true: "border-primary-500/55 bg-primary-500/10 z-10 xl:-mr-px xl:rounded-r-none xl:border-r-transparent",
        false: "border-fg/10 bg-fg/[0.02] hover:bg-fg/5",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const chainHit = cva(
  "focus-visible:ring-primary-500/60 absolute inset-0 cursor-pointer rounded-[inherit] focus-visible:ring-2 focus-visible:outline-none"
);

export const chainGrip = cva("text-fg/35 hover:text-fg/70 relative z-10 cursor-grab touch-none active:cursor-grabbing");

export const chainNumber = cva(
  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
  {
    variants: {
      selected: {
        true: "bg-primary-500 text-primary-foreground",
        false: "bg-fg/10 text-fg/70",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const chainItemBody = cva("pointer-events-none flex min-w-0 flex-1 flex-col gap-1");

export const chainItemTitle = cva("text-fg truncate text-sm font-semibold");

export const chainItemStatus = cva("inline-flex items-center gap-1.5 text-xs", {
  variants: {
    tone: {
      success: "text-success-vivid",
      muted: "text-fg/55",
      warning: "text-warning-vivid",
      danger: "text-destructive-vivid",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const chainArrows = cva("relative z-10 flex flex-col");

export const chainArrow = cva(
  "text-fg/40 hover:text-fg transition-colors disabled:pointer-events-none disabled:opacity-30"
);

export const chainHint = cva("text-fg/50 mt-2 px-1 text-xs");

export const chainPanel = cva(
  "border-primary-500/55 from-primary-500/10 min-w-0 rounded-2xl border bg-linear-to-b to-transparent to-[10rem] xl:sticky xl:top-4 xl:max-h-[calc(var(--height-screen-minus-header)-2rem)] xl:overflow-y-auto xl:overscroll-contain [&>div>section]:border-0 [&>div>section]:bg-transparent"
);
