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

export const listeningChip = cva("flex size-9 shrink-0 items-center justify-center rounded-full bg-current/15", {
  variants: {
    service: {
      lastfm: "social-lastfm",
      listenbrainz: "social-listenbrainz",
    },
  },
});

export const listeningRow = cva("border-fg/10 bg-fg/5 flex flex-col gap-3 rounded-lg border p-3");

export const listeningRowHeader = cva("flex items-center gap-3");

export const listeningFailure = cva("text-warning-vivid mt-1 text-xs");

export const listeningPanel = cva("border-fg/10 flex flex-col gap-3 border-t pt-3");

export const listeningToggleRow = cva("flex items-center justify-between gap-3");

export const listeningToggleLabel = cva("text-fg/70 text-xs");

export const listeningClientList = cva("flex flex-wrap gap-x-4 gap-y-2");

export const listeningClientOption = cva("text-fg/70 flex items-center gap-2 text-xs");

export const listeningTokenRow = cva("flex flex-col gap-2 sm:flex-row sm:items-center");
