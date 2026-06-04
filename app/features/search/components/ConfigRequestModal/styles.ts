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
