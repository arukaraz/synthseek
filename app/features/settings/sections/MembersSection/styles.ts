import { cva } from "class-variance-authority";

export const toolbarActions = cva("flex flex-wrap items-center justify-start gap-2 sm:justify-end");

export const bulkBar = cva("border-fg/10 bg-fg/5 mb-3 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2");

export const bulkCount = cva("text-fg/70 text-sm font-medium");

export const bulkSpacer = cva("flex-1");

export const userCell = cva("flex min-w-0 items-center gap-3");

export const userAvatar = cva(
  "bg-fg/10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
);

export const userName = cva("text-fg truncate text-sm font-medium");

export const userEmail = cva("text-fg/50 truncate text-xs");

export const requestCount = cva("text-fg/60 text-sm tabular-nums");

export const joinedDate = cva("text-fg/50 text-xs");

export const actionsCell = cva("flex items-center justify-end gap-1.5");

export const pill = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1",
  {
    variants: {
      tone: {
        plex: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
        local: "ring-fg/10 bg-fg/5 text-fg/60",
      },
    },
  }
);

export const importList = cva("flex max-h-80 flex-col gap-1 overflow-y-auto");

export const importRow = cva("hover:bg-fg/5 flex items-center gap-3 rounded-lg p-2 transition-colors", {
  variants: {
    disabled: {
      true: "opacity-50",
      false: "cursor-pointer",
    },
  },
});

export const importEmpty = cva("text-fg/60 py-8 text-center text-sm");
