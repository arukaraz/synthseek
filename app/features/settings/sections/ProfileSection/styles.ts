import { cva } from "class-variance-authority";

export const accountAvatar = cva(
  "bg-fg/10 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
);

export const accountMeta = cva("text-fg/50 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs");

export const connectedRow = cva("border-fg/10 bg-fg/5 flex items-center gap-3 rounded-lg border p-3");

export const spotifyChip = cva(
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1ed760]/15 text-[#1ed760]"
);

export const plexChip = cva(
  "bg-plex-500/15 text-plex-400 flex size-9 shrink-0 items-center justify-center rounded-full"
);
