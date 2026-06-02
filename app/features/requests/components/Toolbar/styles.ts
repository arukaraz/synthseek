import { cva } from "class-variance-authority";

export const importProviderMenuTrigger = cva("");

export const importProviderMenuItem = cva("flex w-full items-center gap-2 px-3 py-2 text-sm");

export const importProviderSpotifyChip = cva(
  "flex size-6 items-center justify-center rounded bg-[#1ed760]/15 text-[#1ed760]"
);

export const importProviderFileChip = cva("bg-fg/5 text-fg/70 flex size-5 items-center justify-center rounded");

export const importProviderTooltip = cva("text-[11px] text-fg/40");

export const sourceSearchInput = cva(
  "border-fg/10 bg-fg/5 text-fg placeholder:text-fg/40 focus:border-primary-500/50 h-8 w-full rounded-md border pr-2 pl-7 text-sm outline-none transition-colors"
);

export const sourceFilterCount = cva("bg-fg/10 text-fg/60 ml-auto rounded-full px-1.5 text-[10px] font-medium");
