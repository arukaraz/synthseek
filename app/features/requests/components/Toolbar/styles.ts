import { cva } from "class-variance-authority";

export const importProviderMenuTrigger = cva("");

export const importProviderMenuItem = cva("flex w-full items-center gap-2 px-3 py-2 text-sm");

export const importProviderSpotifyChip = cva(
  "flex size-6 items-center justify-center rounded bg-[#1ed760]/15 text-[#1ed760]"
);

export const importProviderFileChip = cva("bg-fg/5 text-fg/70 flex size-5 items-center justify-center rounded");

export const importProviderTooltip = cva("text-[11px] text-fg/40");
