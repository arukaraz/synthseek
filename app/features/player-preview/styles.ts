import { cva } from "class-variance-authority";

export const previewScreen = cva("flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-40 sm:px-8");

export const previewHeading = cva("text-fg text-xl font-bold");

export const previewIntro = cva("text-fg-muted max-w-2xl text-sm");

export const previewTable = cva("border-fg-muted/15 divide-fg-muted/10 divide-y overflow-hidden rounded-xl border");

export const previewHeaderRow = cva(
  "border-fg-muted/15 text-fg-muted grid grid-cols-[1fr_auto] gap-3 border-b px-4 py-2 font-mono text-[10.5px] tracking-[0.12em]"
);

export const previewRow = cva("hover:bg-primary-500/8 grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2", {
  variants: {
    missing: {
      true: "opacity-55",
      false: "",
    },
  },
  defaultVariants: { missing: false },
});

export const previewRowButton = cva(
  "focus-visible:ring-primary-500 flex min-w-0 items-center gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:outline-none"
);

export const previewRowTitle = cva("text-fg truncate text-[13px] font-semibold", {
  variants: {
    active: {
      true: "text-primary-400",
      false: "",
    },
  },
  defaultVariants: { active: false },
});

export const previewRowMeta = cva("text-fg-muted truncate text-[11.5px]");

export const previewRowActions = cva("flex shrink-0 items-center gap-2");

export const previewChip = cva(
  "border-fg-muted/25 text-fg-muted hover:text-fg focus-visible:ring-primary-500 rounded-full border px-2.5 py-1 font-mono text-[9.5px] whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      tone: {
        primary: "border-primary-500/45 text-primary-400",
        muted: "",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export const previewMissing = cva("text-destructive-vivid font-mono text-[10.5px]");
