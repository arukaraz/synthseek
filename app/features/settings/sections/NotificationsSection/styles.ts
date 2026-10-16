import { cva } from "class-variance-authority";

export const channelPanel = cva("flex flex-col gap-5");

export const channelHelp = cva("text-fg/60 text-sm");

export const fieldGrid = cva("grid grid-cols-1 gap-4 sm:grid-cols-2");

export const toggleRow = cva("border-fg/10 bg-fg/5 flex items-center justify-between gap-3 rounded-lg border p-3");

export const toggleText = cva("flex min-w-0 flex-col gap-0.5");

export const toggleLabel = cva("text-fg text-sm font-medium");

export const toggleHelper = cva("text-fg/60 text-xs");

export const statusLine = cva("text-xs", {
  variants: {
    tone: {
      muted: "text-fg/50",
      ok: "text-success-vivid",
      warning: "text-warning-vivid",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const actionsRow = cva("flex flex-wrap items-center gap-2");

export const destinationRow = cva("border-fg/10 bg-fg/5 flex flex-col gap-3 rounded-lg border p-3");

export const destinationHeader = cva("flex items-center gap-3");

export const destinationName = cva("text-fg text-sm font-medium");

export const channelMark = cva("flex shrink-0 items-center justify-center rounded-full", {
  variants: {
    channel: {
      discord: "bg-(--brand-discord)/15 text-(--brand-discord)",
      ntfy: "bg-(--brand-ntfy)/15 text-(--brand-ntfy)",
      telegram: "bg-(--brand-telegram)/15 text-(--brand-telegram)",
      webhook: "bg-fg/10 text-fg/70",
      apprise: "bg-fg/10 text-fg/70",
    },
    size: {
      sm: "size-6",
      md: "size-9",
    },
  },
  defaultVariants: { size: "md" },
});

export const channelMarkGlyph = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-[18px]",
    },
  },
  defaultVariants: { size: "md" },
});

export const matrixScroll = cva("min-w-0", {
  variants: {
    viewport: {
      true: "max-h-[70dvh] overflow-auto",
      false: "overflow-x-clip",
    },
  },
  defaultVariants: { viewport: false },
});

export const matrixTable = cva("w-full border-collapse text-sm");

export const matrixHead = cva("bg-surface sticky top-0 z-10 [&_tr]:border-fg/10 [&_tr]:border-b");

export const matrixRowHead = cva(
  "text-fg/50 py-2 pr-3 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase"
);

export const matrixColumnHead = cva("w-32 px-2 py-2 text-center align-bottom");

export const matrixColumnName = cva("text-fg inline-flex items-center gap-1.5 text-xs font-medium");

export const matrixPresetTrigger = cva(
  "text-fg/50 hover:text-fg mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium transition-colors"
);

export const matrixKindRow = cva("", {
  variants: {
    group: {
      true: "border-fg/10 border-t",
      false: "hover:bg-fg/[0.03]",
    },
  },
  defaultVariants: { group: false },
});

export const matrixCategoryButton = cva(
  "text-fg [&_svg]:text-fg/50 inline-flex items-center gap-1.5 py-1 text-sm font-medium tracking-normal normal-case"
);

export const matrixCategoryCount = cva("text-fg/45 text-xs font-normal");

export const matrixKindLabel = cva("text-fg/80 py-1.5 pr-3 pl-9 text-left text-sm font-normal");

export const matrixCell = cva("py-2 text-center");

export const matrixCellInner = cva("inline-flex items-center gap-2");

export const matrixCellCount = cva("text-fg/45 w-9 text-left text-[11px] tabular-nums");

export const matrixNote = cva("text-fg/50 text-xs");
