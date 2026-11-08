import { cva } from "class-variance-authority";

export const bottomSheetContent = cva(
  "flex flex-col gap-0 overflow-hidden p-0 pb-[env(safe-area-inset-bottom,0px)] max-sm:rounded-t-[20px] max-sm:border-b-0",
  {
    variants: {
      size: {
        compact: "max-h-[92dvh]",
        half: "max-h-[62dvh]",
        full: "max-h-[92dvh] max-sm:h-[92dvh]",
      },
    },
    defaultVariants: { size: "compact" },
  }
);

export const bottomSheetHandle = cva("bg-fg/25 h-1 w-9 shrink-0 rounded-full sm:hidden", {
  variants: {
    placement: {
      inline: "mx-auto mt-2 mb-0.5",
      overlay: "pointer-events-none absolute top-2 left-1/2 z-40 -translate-x-1/2",
    },
  },
  defaultVariants: { placement: "inline" },
});

export const bottomSheetHeader = cva("flex shrink-0 items-center gap-2.5 px-4 py-2.5");

export const bottomSheetHeaderText = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const bottomSheetTitle = cva("text-fg truncate text-base leading-tight font-bold tracking-tight");

export const bottomSheetSubtitle = cva("text-fg/60 line-clamp-2 text-[12.5px]");

export const bottomSheetClose = cva(
  "text-fg/70 hover:bg-fg/10 hover:text-fg grid size-9 shrink-0 place-items-center rounded-full transition-colors"
);

export const bottomSheetBody = cva("min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-2.5");

export const bottomSheetFooter = cva(
  "border-fg/10 bg-surface/60 flex shrink-0 items-center gap-2.5 border-t px-4 pt-2.5 pb-3.5"
);
