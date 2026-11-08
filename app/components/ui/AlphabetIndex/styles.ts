import { cva } from "class-variance-authority";

export const alphabetIndexRoot = cva(
  "absolute top-1 right-0 bottom-1 z-20 flex w-7 touch-none flex-col items-center justify-start select-none [container-type:size]"
);

export const alphabetIndexStrip = cva("flex max-h-full w-full flex-col items-stretch");

export const alphabetIndexLetter = cva(
  "flex h-[min(1.375rem,calc(100cqh/27))] shrink-0 items-center justify-center text-[min(0.875rem,calc(100cqh/27*0.8))] leading-none font-bold tabular-nums transition-colors",
  {
    variants: {
      state: {
        idle: "text-primary-400",
        active: "text-fg scale-125",
        empty: "text-fg/25",
      },
    },
    defaultVariants: { state: "idle" },
  }
);

export const alphabetIndexBubble = cva(
  "bg-primary-500 text-primary-foreground pointer-events-none absolute right-10 grid size-14 -translate-y-1/2 place-items-center rounded-full rounded-br-md text-2xl font-extrabold shadow-xl"
);
