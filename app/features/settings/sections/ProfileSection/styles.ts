import { cva } from "class-variance-authority";

export const accountAvatar = cva(
  "bg-fg/10 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
);

export const accountMeta = cva("text-fg/50 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs");

export const connectedRow = cva("border-fg/10 bg-fg/5 flex items-center gap-3 rounded-lg border p-3");

export const accountChip = cva("flex size-9 shrink-0 items-center justify-center rounded-full");

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

export const quotaRow = cva("flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm");

export const quotaLabel = cva("text-fg/70");

export const quotaValue = cva("text-fg tabular-nums");

export const quotaNote = cva("text-fg/50 w-full text-xs");

export const quotaMessage = cva("text-fg/60 text-sm");

export const reportingNote = cva(
  "border-fg/10 -mt-1 flex items-center gap-3 rounded-lg border border-dashed px-3 py-2"
);
