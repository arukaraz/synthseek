import { cva } from "class-variance-authority";

export const playSetPoster = cva("relative min-h-24 w-full flex-1 overflow-hidden");

export const singleCover = cva("object-cover");

export const playButton = cva(
  "bg-primary text-primary-foreground shadow-primary-500/40 focus-visible:ring-primary-300 absolute right-3 bottom-3 z-10 flex size-11 items-center justify-center rounded-full shadow-lg transition-transform outline-none hover:scale-105 focus-visible:ring-2 [&_svg]:size-5 [&_svg]:fill-current"
);

export const tagRow = cva("flex min-w-0 items-center gap-1");

export const tagText = cva("truncate");
