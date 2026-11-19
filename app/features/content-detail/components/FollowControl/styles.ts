import { cva } from "class-variance-authority";

export const followPill = cva(
  "focus-visible:ring-primary-400 inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      tone: {
        idle: "border-fg/15 bg-fg/[0.06] text-fg hover:bg-fg/[0.12]",
        following: "type-text-artist border-current/40 bg-current/10 hover:bg-current/15",
        loading: "border-fg/10 bg-fg/[0.03] text-fg/60 pointer-events-none",
        locked: "border-fg/10 bg-fg/[0.03] text-fg/60 cursor-not-allowed",
      },
    },
    defaultVariants: { tone: "idle" },
  }
);

export const followLabelStack = cva("grid text-center");

export const followLabelGhost = cva("invisible col-start-1 row-start-1");

export const followLabelLive = cva("col-start-1 row-start-1");

export const followPopover = cva("flex w-72 flex-col gap-3 p-1 text-sm");

export const followPopoverTitle = cva("text-fg text-base leading-tight font-bold");

export const followSwitchRow = cva("flex items-start justify-between gap-3");

export const followSwitchCopy = cva("flex min-w-0 flex-col gap-0.5");

export const followSwitchLabel = cva("text-fg text-sm font-medium");

export const followHint = cva("text-fg-muted text-xs");

export const followNotice = cva("bg-fg/[0.06] text-fg/80 rounded-md px-2.5 py-1.5 text-xs");

export const followFooter = cva("flex gap-2", {
  variants: { stacked: { true: "flex-col-reverse items-stretch", false: "flex-wrap items-center" } },
  defaultVariants: { stacked: false },
});

export const followFooterEnd = cva("flex gap-2", {
  variants: { stacked: { true: "flex-col-reverse items-stretch", false: "ms-auto items-center" } },
  defaultVariants: { stacked: false },
});

export const followQuietDanger = cva(
  "text-destructive-vivid hover:bg-destructive-vivid/10 focus-visible:ring-destructive-vivid rounded-md px-2 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
);

export const followLink = cva(
  "text-primary-400 hover:bg-fg/10 focus-visible:ring-primary-400 rounded-md px-2 py-1.5 text-center text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
);

export const followSheetBody = cva("px-4 pb-4");
