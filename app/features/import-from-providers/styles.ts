import { cva } from "class-variance-authority";

export const modalRoot = cva(
  "flex w-full max-w-5xl flex-col gap-0 bg-surface/95 sm:bg-surface/90 border-fg/10 sm:backdrop-blur-2xl"
);

export const modalLayout = cva("grid h-[70vh] min-h-[480px] grid-cols-1 md:grid-cols-[14rem_1fr]");

export const sidebar = cva(
  "border-fg/10 bg-surface/40 flex flex-col gap-1 overflow-y-auto border-b md:border-r md:border-b-0 p-3"
);

export const sidebarHeader = cva("text-fg/50 px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider");

export const sidebarItem = cva(
  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-fg/80 hover:bg-fg/5 hover:text-fg",
  {
    variants: {
      active: {
        true: "bg-fg/10 text-fg",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const sidebarBadge = cva("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase", {
  variants: {
    tone: {
      neutral: "bg-fg/10 text-fg/60",
      success: "bg-emerald-500/20 text-emerald-300",
      warning: "bg-amber-500/20 text-amber-300",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const content = cva("flex h-full min-h-0 flex-col");

export const tabsRow = cva("border-fg/10 flex items-center gap-1 overflow-x-auto border-b px-4 py-2");

export const tabButton = cva(
  "rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors text-fg/70 hover:bg-fg/5 hover:text-fg",
  {
    variants: {
      active: {
        true: "bg-fg/10 text-fg",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const list = cva("flex flex-1 flex-col gap-2 overflow-y-auto p-4");

export const listItem = cva(
  "flex items-center gap-3 rounded-xl border border-fg/5 bg-surface/40 p-3 transition-colors hover:bg-surface/60"
);

export const itemImage = cva("size-12 shrink-0 rounded-lg bg-fg/10 object-cover");

export const itemTitle = cva("text-fg text-sm font-medium");
export const itemSubtitle = cva("text-fg/50 text-xs");

export const footer = cva("border-fg/10 flex flex-col gap-3 border-t bg-surface/60 px-4 py-3");
export const footerRow = cva("flex flex-wrap items-center justify-between gap-3");
export const watcherPanel = cva(
  "border-fg/10 mx-4 mt-2 flex flex-col gap-2 rounded-xl border bg-surface/40 p-3"
);
export const watcherRow = cva("flex items-center justify-between gap-3");
export const helperText = cva("text-fg/50 text-xs");
export const emptyState = cva("flex flex-1 items-center justify-center p-8 text-fg/60 text-sm");

export const gateRoot = cva("flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center");
export const gateTitle = cva("text-fg text-lg font-medium");
export const gateBody = cva("text-fg/60 max-w-sm text-sm");
export const gateLink = cva("text-primary-400 underline underline-offset-2 hover:text-primary-300");
