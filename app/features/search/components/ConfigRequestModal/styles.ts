import { cva } from "class-variance-authority";

export const configDialogContent = cva(
  "bg-surface/95 sm:bg-surface/90 sm:backdrop-blur-2xl max-w-[95vw] gap-0 p-0 shadow-2xl sm:max-w-lg"
);

export const acquisitionTrigger = cva(
  "border-fg/10 bg-fg/5 text-fg/80 hover:bg-fg/10 hover:border-primary-500/30 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
);

export const acquisitionRadioItem = cva("flex flex-col gap-0.5");

export const lidarrSelectTrigger = cva(
  "border-fg/10 bg-fg/5 text-fg/80 hover:bg-fg/10 hover:border-primary-500/30 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:pointer-events-none disabled:opacity-40"
);

export const lidarrSelectRadioItem = cva("flex flex-col gap-0.5");

export const lidarrTagsField = cva(
  "border-fg/10 bg-fg/5 focus-within:border-primary-500/50 focus-within:ring-primary-500/30 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors focus-within:ring-2"
);

export const lidarrTagChip = cva(
  "border-primary-500/30 bg-primary-500/15 text-fg/90 inline-flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-xs font-medium"
);

export const lidarrTagChipRemove = cva(
  "text-fg/50 hover:bg-primary-500/25 hover:text-fg/90 inline-flex size-4 items-center justify-center rounded-full transition-colors"
);

export const lidarrTagInputField = cva(
  "text-fg placeholder:text-fg/30 min-w-24 flex-1 bg-transparent text-sm outline-none"
);

export const lidarrTagSuggestion = cva(
  "text-fg/80 hover:bg-primary-500/15 hover:text-fg flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm outline-none transition-colors focus-visible:bg-primary-500/15"
);
