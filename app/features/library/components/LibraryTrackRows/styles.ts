import { cva } from "class-variance-authority";

export const trackRowList = cva("flex flex-col");

export const trackRow = cva(
  "focus-visible:ring-primary-500/60 flex min-h-16 min-w-0 items-center gap-3 rounded-xl py-1.5 pr-0 pl-1 outline-none focus-visible:ring-2",
  {
    variants: {
      selected: { true: "bg-primary-500/12", false: "" },
    },
    defaultVariants: { selected: false },
  }
);

export const trackRowCheck = cva("pointer-events-none shrink-0");

export const trackRowArt = cva("ring-fg/10 relative size-11 shrink-0 overflow-hidden rounded-md ring-1");

export const trackRowPlay = cva("text-overlay-fg absolute inset-0 grid place-items-center bg-black/35");

export const trackRowText = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const trackRowTitle = cva("text-fg truncate text-[14.5px] font-semibold");

export const trackRowSubtitle = cva("text-fg/60 truncate text-[12.5px]");

export const trackRowStatus = cva("text-[11.5px]");
