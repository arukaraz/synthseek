import { cva } from "class-variance-authority";

export const importProviderMenuTrigger = cva("");

export const importProviderMenuItem = cva("flex w-full items-center gap-2 px-3 py-2 text-sm");

export const importProviderSpotifyChip = cva(
  "flex size-6 items-center justify-center rounded bg-[#1ed760]/15 text-[#1ed760]"
);

export const importProviderFileChip = cva("bg-fg/5 text-fg/70 flex size-5 items-center justify-center rounded");

export const reviewQueueTrigger = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg/90 relative flex items-center justify-center rounded-lg border p-1.5 transition-colors"
);

export const reviewQueueBadge = cva(
  "bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 min-w-4 rounded-full px-1 text-[10px] leading-4 font-semibold tabular-nums"
);

export const toolbarMenuTrigger = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg/90 flex items-center justify-center rounded-lg border p-1.5 transition-colors"
);

export const toolbarMenuContent = cva("min-w-52 bg-linear-to-b from-primary-600/5 via-primary-600/5 to-accent-600/5");

export const toolbarMenuDeleteItem = cva(
  "text-destructive-vivid hover:bg-destructive-vivid/10 hover:text-destructive-vivid focus:bg-destructive-vivid/10 focus:text-destructive-vivid active:bg-destructive-vivid/15 gap-2.5 py-2.5"
);
