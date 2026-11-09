import { cva } from "class-variance-authority";

export const playSetPoster = cva("relative min-h-24 w-full flex-1 overflow-hidden");

export const singleCover = cva("object-cover");

export const pinFlag = cva(
  "bg-surface/80 text-fg absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full [&_svg]:size-3.5"
);

export const playButton = cva(
  "bg-primary text-primary-foreground shadow-primary-500/40 focus-visible:ring-primary-300 absolute right-3 bottom-3 z-10 flex size-11 items-center justify-center rounded-full shadow-lg transition outline-none hover:scale-105 focus-visible:ring-2 [&_svg]:size-5 [&_svg]:fill-current",
  {
    variants: {
      reveal: {
        true: "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
        false: "",
      },
    },
    defaultVariants: { reveal: false },
  }
);

export const playSetOpen = cva("text-left outline-none hover:underline focus-visible:underline");

export const tagRow = cva("flex min-w-0 items-center gap-1");

export const tagText = cva("truncate");
